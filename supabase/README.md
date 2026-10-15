# Histora — Supabase (Phase 2)

Production data model for Histora. **Schema only** — no seed data: the frontend still
reads `data/*.json`, and data migration begins with the Python ingestion pipeline
(Phase 3/4). No secrets live in this repository; connection values go through
environment variables (see `.env.example`).

## Layout

```
supabase/
├── migrations/
│   ├── 20261009000001_initial_schema.sql   # extensions, enums, tables, FKs, indexes, triggers
│   └── 20261009000002_rls_policies.sql     # RLS enabled on all 24 tables, public read
└── tests/
    └── rls_test.sql                        # anon/authenticated/service_role assertions
```

## Applying the migrations

Option A — Supabase CLI (recommended):

```bash
supabase link --project-ref <your-project-ref>
supabase db push
```

Option B — SQL editor: paste `20261009000001_initial_schema.sql`, then
`20261009000002_rls_policies.sql`, in filename order.

The schema requires the `pgcrypto` and `vector` extensions (both available on
Supabase; `vector` is prepared for Phase 8 and has no tables yet).

## Development vs production

Use **separate Supabase projects** (dev and prod) with separate API keys:

- local development → `.env.local` (gitignored), pointing at the dev project
- production → the host's environment variables, pointing at the prod project

Never reuse the service-role key outside a server environment.

## Security model

- Every one of the 24 tables has RLS enabled with a single `public_read`
  policy: `FOR SELECT TO anon, authenticated USING (true)` — public history
  stays readable in the browser.
- There are intentionally **no INSERT/UPDATE/DELETE policies**, so `anon` and
  `authenticated` cannot write. All writes must come from the backend (Phase 5)
  using `SUPABASE_SERVICE_ROLE_KEY`, which bypasses RLS.
- `grant select … to anon, authenticated` plus
  `alter default privileges … grant select` keep the read path working for
  tables created by future migrations.

### Running the RLS tests

Against a **development** project only (needs the Supabase roles):

```bash
psql "$SUPABASE_DB_URL" -v ON_ERROR_STOP=1 -f supabase/tests/rls_test.sql
```

Expected output: seven `PASS` notices, no `FAIL` exceptions. The whole file
runs in one transaction and rolls back — no rows persist.

## Design notes

- **Supertype/subtype pattern**: `entities` holds the shared columns
  (`slug`, `title`, `description`, `evidence_class`, `period_id`,
  `metadata`); each historical kind (`people`, `places`, `empires`,
  `dynasties`, `wars`, `events`) has a subtype table enforcing its own type
  through a composite foreign key `(id, entity_type)` + a `CHECK` constraint.
- **Vocabulary tables** (`regions`, `states`, `eras`) mirror
  `data/regions.json` / `data/states.json` / `data/eras.json` with text slug
  primary keys (1:1 with JSON ids). They are navigation/availability rows,
  not historical entities.
- **Enum members `region` and `story` are reserved** — no subtype table yet.
  Stories migrate to `entities` with `entity_type = 'story'` in a later phase;
  app-level regions stay in the `regions` table.
- **Dates**: `events.date_display` (required UI label) and `events.date_text`
  (raw source text) mirror the JSON; `date_sort`/`date_start`/`date_end` are
  nullable and are only filled when the source supports the precision —
  the schema never invents dates.
- **Persona/people split**: `people` holds historical persons only. The six
  POV personas in `data/people.json`, plus `perspectives`, `scenarios`,
  `guide.json` and `sites.json`, remain local JSON (fictional/UI content and
  the guide engine seam).

## JSON → column mapping (for Phase 3 ingestion and Phase 6 adapters)

| JSON (`data/*.json`) | Database |
|---|---|
| camelCase fields generally | `snake_case` columns |
| `sources.type` | `sources.kind` (enum `source_kind`) |
| `sources.sourceType` | `sources.channel` (enum `source_channel`) |
| `events.date` / `events.displayDate` | `events.date_text` / `events.date_display` |
| `events.locationId` | `events.place_id` |
| `events.sourceId` + `sources.relatedEventIds` | rows in `entity_sources` (single source of truth, built from both sides) |
| `locations.region` (descriptive siteline) | `places.region` (free text) |
| `locations.relatedStoryIds`, `locations.relatedPeople` | `places.metadata` (UI wiring, until stories/personas land) |
| `periods.overview` (structured object) | `periods.overview` (`jsonb`) |
| `periods.regionId` / `stateId` / `eraId` | `periods.region_id` / `state_id` / `era_id` |
| evidence `"documented-fact"` | `evidence_class 'documented_fact'` (hyphen → underscore) |
| JSON ids of stories/events/locations/sources | `entities.slug` / `sources.slug` (public id, used in URLs) |
| period / region / state / era ids | primary key `id` on `periods` / `regions` / `states` / `eras` |

## Status / next steps

- Phase 3: Python ingestion framework (`backend/ingestion/*`) seeds vocab +
  content tables from real sources.
- Phase 4: adapters (Wikidata, MediaWiki, Commons, LoC, Europeana, Internet
  Archive) with license/attribution metadata into `images`, `documents`,
  `entity_external_ids`.
- Phase 5: FastAPI service writes with the service-role key; browser never
  gets write access.
