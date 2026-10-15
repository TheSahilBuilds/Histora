-- Histora Phase 2 — RLS smoke tests.
-- Run against a DEVELOPMENT Supabase project (requires the roles anon, authenticated,
-- service_role — i.e. not vanilla PostgreSQL):
--   psql "$SUPABASE_DB_URL" -v ON_ERROR_STOP=1 -f supabase/tests/rls_test.sql
-- Output: PASS notices or a FAIL exception. Everything runs inside a transaction
-- that is rolled back at the end; no rows persist.

begin;

do $$
declare t text; rls int; pol int;
begin
  foreach t in array array[
    'regions', 'states', 'periods', 'eras', 'entities', 'places', 'people', 'empires',
    'dynasties', 'wars', 'events', 'event_relations', 'person_events', 'person_places',
    'person_empires', 'person_dynasties', 'sources', 'entity_sources', 'images',
    'entity_images', 'documents', 'tags', 'entity_tags', 'entity_external_ids'
  ]
  loop
    select count(*) into rls
      from pg_class c
      join pg_namespace ns on ns.oid = c.relnamespace
     where ns.nspname = 'public' and c.relname = t and c.relkind = 'r' and c.relrowsecurity;
    if rls <> 1 then
      raise exception 'FAIL: row level security not enabled on public.%', t;
    end if;
    select count(*) into pol
      from pg_policies
     where schemaname = 'public' and tablename = t and polname = 'public_read';
    if pol <> 1 then
      raise exception 'FAIL: missing public_read policy on public.%', t;
    end if;
  end loop;
  raise notice 'PASS: RLS enabled and public_read present on all 24 tables';
end $$;

do $$
declare reads int; writes int;
begin
  select count(*) into reads from pg_policies
   where schemaname = 'public' and polname = 'public_read';
  if reads <> 24 then
    raise exception 'FAIL: expected 24 public_read policies, found %', reads;
  end if;
  select count(*) into writes from pg_policies
   where schemaname = 'public' and polcmd in ('a', 'w', 'd');
  if writes <> 0 then
    raise exception 'FAIL: found % write policies in schema public, expected 0', writes;
  end if;
  raise notice 'PASS: 24 public_read policies, 0 write policies';
end $$;

insert into public.tags (kind, slug, name) values ('category', 'rls-probe', 'RLS probe');

do $$
begin
  set local role anon;

  begin
    perform count(*) from public.tags;
  exception when insufficient_privilege then
    raise exception 'FAIL: anon read denied: %', sqlerrm;
  end;
  raise notice 'PASS: anon read';

  begin
    insert into public.tags (kind, slug, name) values ('category', 'anon-insert', 'x');
    raise exception 'FAIL: anon insert allowed';
  exception when insufficient_privilege then
    raise notice 'PASS: anon insert denied';
  end;

  begin
    update public.tags set name = 'tampered' where slug = 'rls-probe';
    if found then
      raise exception 'FAIL: anon update allowed';
    end if;
  exception when insufficient_privilege then
    null;
  end;
  raise notice 'PASS: anon update denied';

  begin
    delete from public.tags where slug = 'rls-probe';
    if found then
      raise exception 'FAIL: anon delete allowed';
    end if;
  exception when insufficient_privilege then
    null;
  end;
  raise notice 'PASS: anon delete denied';

  reset role;
end $$;

do $$
begin
  set local role authenticated;

  begin
    perform count(*) from public.tags;
  exception when insufficient_privilege then
    raise exception 'FAIL: authenticated read denied: %', sqlerrm;
  end;
  raise notice 'PASS: authenticated read';

  begin
    insert into public.tags (kind, slug, name) values ('category', 'authenticated-insert', 'x');
    raise exception 'FAIL: authenticated insert allowed';
  exception when insufficient_privilege then
    raise notice 'PASS: authenticated insert denied';
  end;

  begin
    update public.tags set name = 'tampered' where slug = 'rls-probe';
    if found then
      raise exception 'FAIL: authenticated update allowed';
    end if;
  exception when insufficient_privilege then
    null;
  end;
  raise notice 'PASS: authenticated update denied';

  begin
    delete from public.tags where slug = 'rls-probe';
    if found then
      raise exception 'FAIL: authenticated delete allowed';
    end if;
  exception when insufficient_privilege then
    null;
  end;
  raise notice 'PASS: authenticated delete denied';

  reset role;
end $$;

do $$
begin
  set local role service_role;
  begin
    insert into public.tags (kind, slug, name) values ('category', 'svc-insert', 'service-role write');
    update public.tags set name = 'service-role update' where slug = 'rls-probe';
  exception when insufficient_privilege then
    raise exception 'FAIL: service_role write denied: %', sqlerrm;
  end;
  raise notice 'PASS: service_role writes allowed';
  reset role;
end $$;

do $$
begin
  if exists (select 1 from public.tags where slug = 'anon-insert')
     or exists (select 1 from public.tags where slug = 'authenticated-insert') then
    raise exception 'FAIL: anonymous/authenticated write row persisted';
  end if;
  if not exists (select 1 from public.tags where slug = 'svc-insert')
     or not exists (select 1 from public.tags where slug = 'rls-probe') then
    raise exception 'FAIL: setup/service_role rows missing';
  end if;
  raise notice 'PASS: final row state correct';
end $$;

rollback;
