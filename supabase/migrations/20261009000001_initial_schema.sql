-- Histora Phase 2 — migration 1/2: initial production data model.
-- Schema only: no seed data (data migration begins in Phase 3/4).
-- Apply with `supabase db push`, or paste into the Supabase SQL editor in filename order.
-- JSON -> column mapping for ingestion is documented in supabase/README.md.

create schema if not exists extensions;

create extension if not exists pgcrypto with schema extensions;
create extension if not exists vector with schema extensions; -- prepared for Phase 8 (pgvector); no vector tables yet

create type public.entity_type as enum ('person', 'event', 'place', 'empire', 'dynasty', 'war', 'region', 'story');
create type public.evidence_class as enum ('documented_fact', 'interpretation', 'fictional_reconstruction');
create type public.source_kind as enum ('Primary source', 'Secondary source', 'Archive', 'Book', 'Museum', 'Academic source');
create type public.source_channel as enum ('wikidata', 'wikipedia', 'wikisource', 'commons', 'internet-archive', 'gazette', 'publisher', 'web', 'repository');
create type public.confidence_level as enum ('high', 'medium', 'low');
create type public.tag_kind as enum ('category', 'era', 'century', 'pov', 'topic');
create type public.source_role as enum ('primary', 'supports');
create type public.document_kind as enum ('proclamation', 'despatch', 'letter', 'chronicle', 'treaty', 'gazette', 'book', 'article', 'record', 'other');

create or replace function public.set_updated_at() returns trigger
language plpgsql as $fn$
begin
  new.updated_at = now();
  return new;
end;
$fn$;

-- Curated app vocabulary (data/regions.json, data/states.json, data/eras.json).
-- Text slug PKs map 1:1 to JSON ids; these are navigation/availability rows, not historical entities.
create table public.regions (
  id text primary key check (btrim(id) <> ''),
  name text not null,
  parent_region text not null,
  available boolean not null default false,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.states (
  id text primary key check (btrim(id) <> ''),
  region_id text not null references public.regions(id) on delete restrict,
  name text not null,
  code text not null check (code ~ '^[A-Z]{2,4}$'),
  mode text not null check (mode in ('state', 'national', 'international')),
  available boolean not null default false,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.periods (
  id text primary key check (btrim(id) <> ''),
  title text not null,
  short_title text not null,
  year text not null,
  era text not null,
  subtitle text not null,
  tagline text not null,
  description text not null,
  overview jsonb not null default '{}'::jsonb, -- JSON `overview` is a structured object, not text
  region_id text references public.regions(id) on delete set null,
  state_id text references public.states(id) on delete set null,
  era_id text, -- FK added after public.eras exists (mutual reference)
  century text,
  mode text check (mode in ('state', 'national', 'international')),
  subject_name text,
  subject_description text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.eras (
  id text primary key check (btrim(id) <> ''),
  label text not null,
  title text not null,
  description text not null,
  subject_period_id text references public.periods(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.periods
  add constraint periods_era_id_fk
  foreign key (era_id) references public.eras(id) on delete set null;

-- Supertype for historical content. `slug` carries the stable public id used in URLs;
-- enum members 'region' and 'story' are reserved (no subtype table yet — see supabase/README.md).
create table public.entities (
  id uuid primary key default gen_random_uuid(),
  entity_type public.entity_type not null,
  slug text not null unique check (btrim(slug) <> ''),
  title text not null check (btrim(title) <> ''),
  short_description text,
  description text,
  evidence_class public.evidence_class not null default 'documented_fact',
  period_id text references public.periods(id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, entity_type)
);

create index entities_entity_type_idx on public.entities (entity_type);
create index entities_period_id_idx on public.entities (period_id);
create index entities_title_lower_idx on public.entities (lower(title));

create table public.places (
  id uuid primary key,
  entity_type public.entity_type not null default 'place',
  lat double precision not null check (lat between -90.0 and 90.0),
  lng double precision not null check (lng between -180.0 and 180.0),
  region text, -- JSON `region` is a descriptive siteline, not a regions-table id
  region_id text references public.regions(id) on delete set null,
  icon text,
  tagline text,
  timeline_note text,
  metadata jsonb not null default '{}'::jsonb, -- UI wiring until stories land (relatedStoryIds, relatedPeople personas)
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint places_type check (entity_type = 'place'),
  constraint places_entity_fk foreign key (id, entity_type)
    references public.entities (id, entity_type) on delete cascade
);

create index places_region_id_idx on public.places (region_id);
create index places_geo_idx on public.places (lat, lng);

-- Historical persons only. The six POV personas in data/people.json are UI constructs and stay local JSON.
create table public.people (
  id uuid primary key,
  entity_type public.entity_type not null default 'person',
  birth_date date,
  death_date date,
  birth_display text,
  death_display text,
  birth_place_id uuid references public.places(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint people_type check (entity_type = 'person'),
  constraint people_entity_fk foreign key (id, entity_type)
    references public.entities (id, entity_type) on delete cascade
);

create index people_birth_date_idx on public.people (birth_date);
create index people_death_date_idx on public.people (death_date);
create index people_birth_place_idx on public.people (birth_place_id);

create table public.empires (
  id uuid primary key,
  entity_type public.entity_type not null default 'empire',
  region_id text references public.regions(id) on delete set null,
  start_year int,
  end_year int,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint empires_type check (entity_type = 'empire'),
  constraint empires_entity_fk foreign key (id, entity_type)
    references public.entities (id, entity_type) on delete cascade,
  constraint empires_years check (start_year is null or end_year is null or start_year <= end_year)
);

create index empires_region_id_idx on public.empires (region_id);

create table public.dynasties (
  id uuid primary key,
  entity_type public.entity_type not null default 'dynasty',
  empire_id uuid references public.empires(id) on delete set null,
  start_year int,
  end_year int,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint dynasties_type check (entity_type = 'dynasty'),
  constraint dynasties_entity_fk foreign key (id, entity_type)
    references public.entities (id, entity_type) on delete cascade,
  constraint dynasties_years check (start_year is null or end_year is null or start_year <= end_year)
);

create index dynasties_empire_id_idx on public.dynasties (empire_id);

create table public.wars (
  id uuid primary key,
  entity_type public.entity_type not null default 'war',
  date_display text,
  date_sort date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint wars_type check (entity_type = 'war'),
  constraint wars_entity_fk foreign key (id, entity_type)
    references public.entities (id, entity_type) on delete cascade
);

create table public.events (
  id uuid primary key,
  entity_type public.entity_type not null default 'event',
  date_display text not null, -- JSON `displayDate` (UI label)
  date_text text,             -- JSON `date` (raw source text, e.g. "early 1857")
  date_sort date,
  date_start date,
  date_end date,
  location text not null,     -- JSON `location` (display label; exists even when place_id is null)
  place_id uuid references public.places(id) on delete set null, -- JSON `locationId`
  war_id uuid references public.wars(id) on delete set null,
  significance text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint events_type check (entity_type = 'event'),
  constraint events_entity_fk foreign key (id, entity_type)
    references public.entities (id, entity_type) on delete cascade,
  constraint events_dates check (date_start is null or date_end is null or date_start <= date_end)
);

create index events_place_id_idx on public.events (place_id);
create index events_war_id_idx on public.events (war_id);
create index events_date_sort_idx on public.events (date_sort);

create table public.event_relations (
  from_event_id uuid not null references public.events(id) on delete cascade,
  to_event_id uuid not null references public.events(id) on delete cascade,
  relation text not null default 'related',
  primary key (from_event_id, to_event_id),
  constraint event_relations_distinct check (from_event_id <> to_event_id)
);

create index event_relations_to_idx on public.event_relations (to_event_id);

create table public.person_events (
  person_id uuid not null references public.people(id) on delete cascade,
  event_id uuid not null references public.events(id) on delete cascade,
  role text,
  primary key (person_id, event_id)
);

create index person_events_event_idx on public.person_events (event_id);

create table public.person_places (
  person_id uuid not null references public.people(id) on delete cascade,
  place_id uuid not null references public.places(id) on delete cascade,
  role text,
  primary key (person_id, place_id)
);

create index person_places_place_idx on public.person_places (place_id);

create table public.person_empires (
  person_id uuid not null references public.people(id) on delete cascade,
  empire_id uuid not null references public.empires(id) on delete cascade,
  role text,
  primary key (person_id, empire_id)
);

create index person_empires_empire_idx on public.person_empires (empire_id);

create table public.person_dynasties (
  person_id uuid not null references public.people(id) on delete cascade,
  dynasty_id uuid not null references public.dynasties(id) on delete cascade,
  primary key (person_id, dynasty_id)
);

create index person_dynasties_dynasty_idx on public.person_dynasties (dynasty_id);

-- JSON `type` maps to `kind`, JSON `sourceType` maps to `channel`.
-- JSON relatedEventIds/relatedStoryIds are realized as entity_sources rows (single source of truth).
create table public.sources (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (btrim(slug) <> ''),
  title text not null check (btrim(title) <> ''),
  author text not null,
  institution text,
  year text not null,
  kind public.source_kind not null,
  category text not null,
  description text not null,
  context text not null,
  verified boolean not null,
  placeholder text,
  demo_document boolean not null default false,
  url text check (url is null or url like 'https://%'),
  channel public.source_channel,
  external_id text,
  retrieved_at date,
  license text,
  confidence public.confidence_level not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.entity_sources (
  entity_id uuid not null references public.entities(id) on delete cascade,
  source_id uuid not null references public.sources(id) on delete cascade,
  role public.source_role not null default 'supports',
  citation text,
  sort_order int not null default 0,
  primary key (entity_id, source_id)
);

create index entity_sources_source_idx on public.entity_sources (source_id);

create table public.images (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  url text not null check (url like 'https://%'),
  thumbnail_url text check (thumbnail_url is null or thumbnail_url like 'https://%'),
  creator text,
  license text not null,
  attribution text,
  channel public.source_channel not null,
  external_id text,
  retrieved_at date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index images_channel_external_idx on public.images (channel, external_id)
  where external_id is not null;

create table public.entity_images (
  entity_id uuid not null references public.entities(id) on delete cascade,
  image_id uuid not null references public.images(id) on delete cascade,
  role text not null default 'illustration',
  sort_order int not null default 0,
  primary key (entity_id, image_id)
);

create index entity_images_image_idx on public.entity_images (image_id);

create table public.documents (
  id uuid primary key default gen_random_uuid(),
  entity_id uuid references public.entities(id) on delete cascade,
  source_id uuid references public.sources(id) on delete set null,
  title text not null,
  doc_type public.document_kind not null default 'other',
  content text,
  url text check (url is null or url like 'https://%'),
  channel public.source_channel,
  external_id text,
  license text,
  retrieved_at date,
  evidence_class public.evidence_class not null default 'documented_fact',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint documents_owner check (entity_id is not null or source_id is not null)
);

create index documents_entity_idx on public.documents (entity_id);
create index documents_source_idx on public.documents (source_id);

create table public.tags (
  id uuid primary key default gen_random_uuid(),
  kind public.tag_kind not null,
  slug text not null,
  name text not null,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (kind, slug)
);

create table public.entity_tags (
  entity_id uuid not null references public.entities(id) on delete cascade,
  tag_id uuid not null references public.tags(id) on delete cascade,
  primary key (entity_id, tag_id)
);

create index entity_tags_tag_idx on public.entity_tags (tag_id);

create table public.entity_external_ids (
  system text not null,
  external_id text not null,
  entity_id uuid not null references public.entities(id) on delete cascade,
  url text,
  retrieved_at date,
  primary key (system, external_id)
);

create index entity_external_ids_entity_idx on public.entity_external_ids (entity_id);

do $$
declare t text;
begin
  foreach t in array array[
    'periods', 'regions', 'states', 'eras', 'entities', 'places', 'people', 'empires',
    'dynasties', 'wars', 'events', 'sources', 'images', 'documents', 'tags'
  ]
  loop
    execute format(
      'create trigger set_updated_at before update on public.%I for each row execute function public.set_updated_at()',
      t
    );
  end loop;
end $$;
