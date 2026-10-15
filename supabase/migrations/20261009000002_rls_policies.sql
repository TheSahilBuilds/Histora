-- Histora Phase 2 — migration 2/2: row-level security.
-- Model: public history is readable by anon/authenticated; there are intentionally
-- no INSERT/UPDATE/DELETE policies, so browser-facing roles cannot write.
-- All writes come from the backend (Phase 5) using the service-role key,
-- which bypasses RLS (Supabase-managed `service_role`).

grant usage on schema public to anon, authenticated;
grant select on all tables in schema public to anon, authenticated;
alter default privileges in schema public grant select on tables to anon, authenticated;

do $$
declare t text;
begin
  foreach t in array array[
    'regions', 'states', 'periods', 'eras', 'entities', 'places', 'people', 'empires',
    'dynasties', 'wars', 'events', 'event_relations', 'person_events', 'person_places',
    'person_empires', 'person_dynasties', 'sources', 'entity_sources', 'images',
    'entity_images', 'documents', 'tags', 'entity_tags', 'entity_external_ids'
  ]
  loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists public_read on public.%I', t);
    execute format('create policy public_read on public.%I for select to anon, authenticated using (true)', t);
  end loop;
end $$;
