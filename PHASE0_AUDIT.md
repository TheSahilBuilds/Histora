# Histora — Phase 0 Repository Audit

**Scope:** full repository inspection prior to any modification.
**Baseline recorded:** audit performed on the working tree at commit `afb4760` (plus planned prototype cleanup: `tsconfig.tsbuildinfo`, starter SVGs `file.svg`, `globe.svg`, `next.svg`, `vercel.svg`, `window.svg` removed from `public/`).
**Statement:** this audit changed no application behavior, no routes, no components, no data, and no dependencies.

---

## 1. Current architecture

| Layer | Implementation |
|---|---|
| Framework | Next.js 16.3.5 (App Router, Turbopack), React 19.2.8, TypeScript 5.x |
| Styling | Tailwind CSS v4 (PostCSS plugin `@tailwindcss/postcss`), custom design tokens in `app/globals.css` |
| Map | Leaflet + react-leaflet 5 (`components/map/`, server page → `MapLoader` → `HistoricalMap`) |
| 3D | Three.js + @react-three/fiber + drei (`components/3d/`, asset-based pipeline V2) |
| State | Zustand 5 with `persist` middleware, localStorage key `histora-journey` |
| Motion / icons | `motion` 13, `lucide-react` |
| Content | 13 local JSON collections in `data/*.json` (archived prototype copy in `data/_archive/prototype-2026-10/`) |
| Backend / DB / API | **None.** No API routes, no server actions for data, no database, no env files |
| Tests | **None.** No test runner configured |

**Data flow:** `data/*.json` → `lib/data.ts` (single gateway: getters, markers, timeline items, scenario lookups) → server components (pages) → presentational/client components. Client components receive plain serialized props. Guide uses `lib/guide-engine.ts` (local keyword scorer over `data/guide.json`). Scenario engine reads `data/scenarios.json` stages and persists progress through `lib/store.ts`.

## 2. Current routes

| Route | Render | Purpose |
|---|---|---|
| `/` | static | Home (hero, features, journey panel) |
| `/_not-found` | static | 404 |
| `/explore` | static (client filters via query params `scope/region/era/role`) | Explore grid |
| `/guide` | static (client) | Historical Guide Q&A |
| `/live` | dynamic (`?role=`) | Live Through History hub |
| `/map` | dynamic (`?loc=`, `?event=`) | Historical map |
| `/period/[id]` | SSG (`generateStaticParams`) | Period landing |
| `/perspectives` | static | POV roles |
| `/scenario/[id]` | SSG (14 scenarios) | Scenario engine |
| `/sources` | dynamic (`?source=`, `?event=`) | Sources hub |
| `/story/[id]` | dynamic (`?perspective=`) | Story pages + POV |
| `/timeline` | dynamic (`?event=`) | Grouped timeline |

Baseline build rendered **26 prerendered routes** (Phase 0) → **27** after Phase 1 (`/period/maharashtra-17th-century` added to SSG).

## 3. Current data model

`lib/types.ts` contracts: `Period`, `Story`, `Event`, `Person`, `Location`, `Scenario`, `Source`, `GuideQA`, `PovRole`, `Perspective`, `Marker`/`TimelineItem` shapes, `EvidenceClass` triad, `SourceKind`, `SourceChannel`, `PovId`.

Key vocabularies:

- `PovId`: `ruler | soldier | farmer | merchant | artisan | commoner` (exhaustively mapped in `components/live/LiveHub.tsx` `ICON_MAP: Record<PovId, …>` — extending it is a type error by design).
- `EvidenceClass`: `documented-fact | interpretation | fictional-reconstruction` (rendered by `components/story/EvidenceStamp.tsx`).
- Story ↔ source links are bidirectional (`stories[].sourceIds` / `sources[].relatedStoryIds`); event → source is single `events[].sourceId` with reverse `sources[].relatedEventIds`.

## 4. Current dependencies

`next 16.3.5`, `react`/`react-dom 19.2.8`, `leaflet ^1.9.4`, `react-leaflet ^5.0.0`, `three ^0.186.0`, `@react-three/fiber ^9.7.0`, `@react-three/drei ^10.7.8`, `zustand ^5.0.15`, `motion ^13.4.0`, `lucide-react ^1.47.0`, `tailwindcss ^4.3.3`, `@tailwindcss/postcss ^4.3.3`. Dev: `typescript ^5`, `eslint ^9`, `eslint-config-next 16.3.5`, `@types/*`. No Supabase/auth/HTTP/test libraries.

## 5. Current data files (`data/`)

`periods.json`, `eras.json`, `regions.json`, `states.json`, `stories.json` (12), `events.json` (12), `locations.json` (16), `people.json` (6 POV personas), `perspectives.json` (6), `scenarios.json` (14), `sources.json` (17), `guide.json` (21 Q&A), `sites.json`. Prototype originals archived at `data/_archive/prototype-2026-10/`.

## 6. Current source / evidence model

- Every record carries evidence classification (`documented-fact` / `interpretation` / `fictional-reconstruction`); scenarios are labelled `FICTIONAL RECONSTRUCTION` disclaimers.
- `Source` records carry `verified`, optional `url`, `sourceType` (Wikidata/Wikipedia/Wikisource/Commons/Internet Archive/gazette/publisher/web/repository), `externalId`, `retrievedAt`, `license`, `confidence`, `demoDocument`, `placeholder`.
- Validation gate: `npm run validate:data` → `scripts/validate-data.mjs` (unique ids, all cross-references, bidirectional link symmetry, guide followUp/hint integrity).

## 7. Component dependencies

**Data-consuming (will migrate in Phase 6):** pages under `app/` (explore, story, timeline, map, sources, guide, live, period, home panels), `components/explore/*`, `components/story/*`, `components/sources/*`, `components/home/*`, `components/live/*`, `components/perspectives/*`, `components/timeline/*` (props only).

**Protected — must remain unchanged:** `components/ui/*`, `components/layout/Navigation.tsx`, `components/3d/**`, `components/map/**`, `components/timeline/Timeline.tsx`, `components/scenario/**`, `components/story/**` incl. `EvidenceStamp`, `components/perspectives/**`, `lib/store.ts`, `lib/utils.ts`, `app/globals.css`, `data/sites.json`, route/query-param contracts, scenario/perspective behavior.

## 8. Existing API / backend / environment

- No API routes, no server actions, no Python/DB code. No `backend/` directory.
- **Phase 0 statement "no environment variables exist" is now outdated** (corrected in §16): `.env.example` exists and is intentionally tracked (`.gitignore` keeps `.env*` ignored but un-ignores `.env.example`). It documents placeholder-only names for Supabase, the future FastAPI layer, and future ingestion adapters; there are no real secret files and no secret values.
- No Supabase client library is installed (`package.json` has no `@supabase/*`, auth, or HTTP dependency). The frontend still reads `data/*.json` only.
- Commands: `npm run dev`, `npm run build`, `npm run start`, `npm run lint`; plus `npm run validate:data` (added Phase 1).

## 9. Baseline results

| Check | Result |
|---|---|
| `npm run lint` | **0 errors**, 1 pre-existing warning (`postcss.config.mjs` anonymous default export) |
| `npx tsc --noEmit` | **0 errors** |
| `npm run build` | **✅ 26 routes** (baseline; 27 after Phase 1) |
| `npm run validate:data` | ✅ (Phase 1 addition) |

Re-verified on the Phase 2 working tree (2026-10-11): `eslint` 0 errors / 1 warning, `npx tsc --noEmit` 0 errors, `npm run build` ✅ 27 routes, `npm run validate:data` ✅ (2 periods, 12 stories, 12 events, 16 locations, 6 people, 6 perspectives, 14 scenarios, 17 sources, 21 guide entries). See §16.

## 10. Risks

1. **ID stability:** story/location/scenario/source ids appear in URLs, `scenarios.json` `storyId`, guide hints, and saved `histora-journey` localStorage state. IDs must not change during migration (or need an explicit mapping).
2. **Two vocabularies for "people":** `people.json` holds six POV *personas* (soldier/farmer/…), while historical persons (Shivaji, Afzal Khan…) exist only inline inside `stories[].people`. A database `people` table must model *historical persons*; personas are UI constructs and must not be conflated.
3. **Free-text dates:** `events[].date` and `stories[].date` are display strings (`"early 1857"`, `"c. 1646"`), not ISO dates — the production model needs display + sortable/parseable components without inventing precision.
4. **Bidirectional link invariants** (story↔source, event↔source) are enforced only by the validate script today; the DB must preserve them via FKs + checks or ingestion-time validation.
5. **Exhaustive `Record<PovId,…>` maps** break at compile time if the POV vocabulary changes.
6. **Guide engine seam:** `lib/guide-engine.ts` must keep its `GuideResponse` shape if/when it becomes an API-backed RAG client.
7. **LocalStorage journey schema** (`histora-journey`) can hold stale state across releases.

## 11. Migration risks (Phases 2–6)

- Field-name impedance (`displayDate` ↔ `display_date`, enum label spacing `"Primary source"` ↔ `primary_source`) — adapters required in Phase 6, never raw DB shapes in components.
- Applying migrations without a live Supabase instance risks undetected SQL errors (no Docker/psql on the audit machine → mitigated with parser-based validation + documented apply step).
- RLS misconfiguration could silently hide public history from the anon role (mitigated with policy tests).
- Switching data sources mid-flight can change route payloads (static vs dynamic rendering) — must compare route behavior before/after.
- Scenario/perspective content (fictional) must never be mixed into factual entity tables.

## 12. Recommended migration order

1. ✅ Phase 0 — audit (this document).
2. ✅ Phase 1 — source-backed local dataset (UI unchanged; all gates green).
3. **Phase 2 — Supabase schema + migrations + RLS + env docs** (frontend untouched). *Artifacts present in the working tree (`supabase/migrations/`, `supabase/tests/rls_test.sql`, `supabase/README.md`, `.env.example`) but **not verified against a live Supabase project** — see §16. Do not treat as complete.*
4. Phase 3 — Python ingestion framework (`backend/ingestion/*`).
5. Phase 4 — real adapters (Wikidata, MediaWiki, Commons, LoC, Europeana, IA).
6. Phase 5 — FastAPI layer.
7. Phase 6 — frontend data-service seam (Explore → Story → Timeline → Map → Sources → Guide).
8. Phase 7 — PostgreSQL search → Phase 8 pgvector → Phase 9 RAG → Phase 10 auth → Phase 11 recommendations → Phase 12 hardening.

## 13. Files that must NOT be touched

`components/ui/*`, `components/layout/Navigation.tsx`, `components/3d/**`, `components/map/**`, `components/timeline/Timeline.tsx`, `components/scenario/**`, `components/story/**` (incl. `EvidenceStamp`), `components/perspectives/**`, `lib/store.ts`, `lib/utils.ts`, `app/globals.css`, `data/sites.json`, `all_about_historia.md`, `AGENTS.md`/`CLAUDE.md`, route + query-param contracts.

## 14. Files likely to change later

- `lib/data.ts` — becomes the data-service seam (Phase 6); `lib/types.ts` — adapter-compatible additions (no breaking renames).
- `lib/guide-engine.ts` — minimal internal fixes only; later RAG-backed implementation behind the same `GuideResponse`.
- `data/*.json` — frozen reference / local fallback after Phase 6; `package.json` — future supabase-js + scripts.
- `app/*/page.tsx` — param handling only where a data contract genuinely requires it; `.env.example`, `supabase/**`, `backend/**` (new).

## 15. Issues found during the audit (unresolved at Phase 0 close)

1. `getStories()` defaulted to a `PERIOD_ID` matching no story (empty result if called bare).
2. `student-1857` scenario referenced perspective `"student"`, which does not exist (scenario invisible on `/live`).
3. Link asymmetries: `sg-sarkar` ↔ `rajgad-building-new-power`, `sg-pagdi`/`sg-sabhasad` claiming stories that did not cite back.
4. Timeline event items linked to inert `/explore?event=` (explore ignores that param).
5. `generateStaticParams` omitted `maharashtra-17th-century`.
6. `guideSourceHint` lookups failed for `mangal-pandey` and `rani-jhansi` (title substring mismatch); `rani-placeholder` was an unresolved placeholder source.
7. 18 of 31 `guide.json` `followUp[]` entries did not match any question.
8. `/live` static subtitle ("twelve moments") disagreed with actual scenario count (14).
9. Data accuracy issues: Jhansi 1858 dates imprecise, Delhi recapture over-precise (20–21 Sep), Agra escape display window wrong, Torna age overstated, garbled `return-expansion` sentence, `commoner` relatedPeople refs that could not resolve.

**Items 1–9 were remediated in Phase 1** (data/code fixes + the `validate:data` gate) without changing routes, layout, or visual design. Remaining open items by design: no backend, no DB, no tests, no env config — addressed by Phases 2–12.

---

## 16. Phase 2 reconciliation (2026-10-11)

**Provenance:** read-only inspection of the working tree. No application behavior, route, component, data, or dependency was changed; no `backend/` was created; no migration was executed. Doc-only edits were made to reconcile stale claims.

**Status categories:** ✅ Complete and verified locally · 🟡 Complete but not verified against a live database · 🟠 Partially implemented · ⛔ Not implemented · 🔧 Requires manual configuration.

### 16.1 Environment & repo status

| Item | State | Notes |
|---|---|---|
| `.env.example` (placeholder names only) | ✅ | Tracked; contains no secrets. |
| `.gitignore` (`.env*` ignored, `!.env.example`) | ✅ | Real secret files remain ignored. |
| Supabase schema migrations | 🟡 | 2 files present and reviewed; never executed. |
| RLS policies | 🟡 | Present for all 24 tables; never executed. |
| RLS test script | 🔧 | Written; requires a live dev Supabase project (no `psql`/`docker`/`supabase` CLI on this machine). |
| `supabase/config.toml` | ⛔ | Absent — CLI `db push` needs `supabase link`/init first. |
| `backend/` (Python ingestion / FastAPI) | ⛔ | Absent by design (Phases 3–5). |
| `supabase-js` / auth / HTTP client in frontend | ⛔ | Absent — frontend still reads `data/*.json`. |

### 16.2 Schema (24 tables) — 🟡 not verified live

`regions, states, periods, eras, entities, places, people, empires, dynasties, wars, events, event_relations, person_events, person_places, person_empires, person_dynasties, sources, entity_sources, images, entity_images, documents, tags, entity_tags, entity_external_ids`.

- **Supertype/subtype:** `entities` holds `slug/title/short_description/description/evidence_class/period_id/metadata`; `places/people/empires/dynasties/wars/events` are subtypes via composite FK `(id, entity_type)` + `CHECK`. Accurate.
- **Vocabulary tables** `regions/states/periods/eras` mirror JSON 1:1 with slug PKs.
- **Dates/uncertainty:** `events.date_display` (required) + `date_text` (raw) + nullable `date_sort/date_start/date_end`; `people.birth/death` date + display. Good — never invents precision.
- **Source attribution:** `entity_sources` (role `primary`/`supports`, `citation`, `sort_order`) is the single source of truth; JSON `relatedEventIds`/`relatedStoryIds` become rows.
- **Duplicate prevention:** unique `entities.slug`, `sources.slug`, `tags(kind,slug)`, partial-unique `images(channel,external_id)`, PK `entity_external_ids(system,external_id)`. Title matching for entities is a non-unique index (external IDs mitigate).
- **Ordering/reproducibility:** timestamped `…0001`, `…0002`; run in filename order; standard run-once semantics (not idempotent for `create type`/`create table`; `drop policy if exists` is). Requires `pgcrypto` + `vector` (Supabase provides).

### 16.3 RLS & security — 🟡 not verified live

- All 24 tables: RLS enabled + one `public_read` policy `FOR SELECT TO anon, authenticated USING (true)`.
- `grant usage on schema public` + `grant select on all tables` to `anon, authenticated`; `alter default privileges` for future tables.
- **No INSERT/UPDATE/DELETE policies** and no write grants → browser roles cannot write. Writes are expected only from a server using the Supabase-managed `service_role` (bypasses RLS). No auth/user-owned tables exist yet, so "owner-only" rules are N/A.
- `service_role` is never referenced by any client code; no client library is installed → credentials cannot reach the browser.
- **Untested:** the RLS test file asserts reads succeed, writes fail, and `service_role` writes; it has not been run (no live DB here). Static review found the logic sound assuming standard Supabase roles/grants.

### 16.4 Historical-data compatibility — 🟠 partial (by design)

| JSON collection | DB target | Coverage |
|---|---|---|
| periods, regions, states, eras | `periods/regions/states/eras` | ✅ full (`regions.region` → `parent_region`; note `Region.periodId` is unused/none in JSON) |
| sources (17) | `sources` + `entity_sources` | ✅ full; all `confidence` present, all `url` https, `type`→`kind`, `sourceType`→`channel`, `license`/`channel` optional and nullable |
| locations (16) | `places` + `entity_sources` | ✅ lat/lng/icon/region/description/tagline/timeline_note; `events[]`, `relatedStoryIds`, `relatedPeople` → `metadata` UI-wiring |
| events (12) | `events` | ✅ display/raw dates + place + significance; `sourceId`→`entity_sources` |
| stories (12) | `entities` (type `story`) | 🟠 **no story subtype and no story↔person / story↔place / story↔story relation tables**; `significance`, story `date`/`displayDate`, `district`, `latitude/longitude`, `people[]`, `locationIds[]`, `relatedStories[]` have no first-class columns (only `metadata`/`entity_sources` partials) |
| people (6 personas) | — (stays local) | by design; personas are UI constructs, not historical persons |
| historical persons (inline `stories[].people`) | `people` | 🟠 persons exist only inline; no ingestion yet and no story link |
| scenarios (14), guide (21), perspectives (6), sites (1) | — (stay local) | by design (fictional/UI content) |

- Fields that **cannot be represented safely today:** Story `significance`, story date/display, `district`, story coordinates, `relatedStories`, story↔person, story↔place; historical-persons table has no source or story association.
- **Speculative/unused-in-JSON tables:** `empires`, `dynasties`, `wars`, `person_empires`, `person_dynasties`, `event_relations` are not backed by any current TS type or JSON. `images/documents/tags/entity_*`/`entity_external_ids` are forward-looking for Phase 4 ingestion. No `vector` tables (extension installed only; Phase 8).
- **Not** classifying any source as verified by URL — `verified` mirrors JSON and is authored, not inferred.

### 16.5 Verification results (this reconciliation)

| Check | Result |
|---|---|
| `npm run lint` | ✅ exit 0 — 0 errors, 1 pre-existing warning (`postcss.config.mjs`) |
| `npx tsc --noEmit` | ✅ exit 0 — 0 errors |
| `npm run build` | ✅ exit 0 — 27 routes |
| `npm run validate:data` | ✅ exit 0 |
| SQL apply / RLS test | ⛔ not run — no `psql`, `supabase` CLI, or `docker` available |

### 16.6 Phase 2 verdict

**Phase 2 is PARTIALLY COMPLETE.** The schema, RLS policies, RLS test, README, and environment docs exist and read correctly on local inspection (**complete but not verified against a live database**). No migration has been executed and no Supabase project has been linked. Phase 2 must **not** be labelled complete on the strength of files alone.

---

*Phase 0 changed no functionality. This §16 reconciliation also changed no application code or data — documentation only.*
