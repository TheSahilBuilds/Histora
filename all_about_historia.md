# All About Histora — Complete Project Reference

> **Project:** Histora — **An Interactive Historical Atlas**
> **Scope:** Interactive historical atlases. Prototype region: **Maharashtra — 17th century** (Chhatrapati Shivaji Maharaj); the Phase A **India 1857** period remains fully live.
> **Root directory:** `C:\Users\sahil\Desktop\Histora`
> **Last verified build:** `npm run build` + `eslint` clean; every phase-B route smoke-tested over HTTP (200 OK + content markers; 404 fallback for unknown story ids).

---

## 1. What Histora Is

Histora re-centres history on the people who lived it, organized as an **atlas** — Region → Era → Period (Subject) → Place → Story → Perspective → Evidence — instead of "Event → Date → Famous Person".

### Core principles (enforced throughout the UI and data)
1. **Documented fact** vs **interpretation** vs **fictional reconstruction** are always distinguished and visibly labelled (`FICTIONAL RECONSTRUCTION` stamps).
2. Every historical claim leads to a **source** (a record in `data/sources.json`).
3. All scenario/perspective characters are **fictional reconstructions based on documented historical conditions** — never claims about real individuals; labelled as such on `/live`, `/perspectives`, story pages and scenarios.
4. Unverifiable details are **marked as placeholders**, never presented as verified.
5. One event affected different people in different ways — multiple perspectives are shown on the same events.
6. Content is curated and local (JSON); **no database and no API-key dependency**.

---

## 2. Tech Stack & Dependencies

| Layer | Choice |
|---|---|
| Framework | **Next.js 16.3.5** (App Router, Turbopack, React Server Components) |
| React | **19.2.8** |
| Language | TypeScript |
| Styling | **Tailwind CSS v4** via `@tailwindcss/postcss`; theming with `@theme` in `app/globals.css` |
| Animation | `motion` — imported from `"motion/react"` |
| Map | `leaflet` 1.9.4 + `react-leaflet` v5 (client-only, `ssr:false`) |
| 3D dioramas | `three` 0.186 + `@react-three/fiber` v9 + `@react-three/drei` v10 (client-only, lazy chunks, WebGL-guarded) |
| State | `zustand` v5 with `persist` middleware (localStorage key `histora-journey`) |
| Icons | `lucide-react` |
| Fonts | `next/font/google`: **Cormorant Garamond** + **Inter** |

### npm scripts
- `dev` → `next dev` · `build` → `next build` · `start` → `next start` · `lint` → `eslint`

Note: after adding/renaming routes, run `npx next typegen` to regenerate `PageProps<"">` unions in `.next/types/routes.d.ts` (needed by `tsc`).

---

## 3. Getting Started

```bash
npm install
npm run dev          # http://localhost:3000
npm run build && npm run start   # production
npm run lint         # eslint (0 errors expected)
npx tsc --noEmit     # typecheck
```

---

## 4. Project Structure (Phase B)

```
Histora/
├─ app/
│  ├─ layout.tsx              # Root layout: fonts, metadata, Navigation, Footer, .paper-noise body
│  ├─ globals.css             # Tailwind v4 @theme + all custom CSS (see §19)
│  ├─ page.tsx                # HOME — Hero + FeatureCards + SameEventSection + "Start exploring" + JourneyPanel + flow band
│  ├─ loading.tsx             # Root stream shell ("The archive is loading...")
│  ├─ not-found.tsx           # 404 folio page
│  ├─ error.tsx               # Error boundary ("Reading room fault")
│  ├─ explore/page.tsx        # ATLAS EXPLORER — Region → Era → Subject → Stories (AtlasExplorer)
│  ├─ story/[id]/page.tsx     # STORY folio — force-dynamic; ?perspective=<pov> deep link; POV panel + mini-map; prev/next
│  ├─ live/page.tsx           # LIVE THROUGH HISTORY — ?role=<povId>; role cards → scenario moments
│  ├─ period/[id]/page.tsx    # Legacy period dashboard (Phase A) — generateStaticParams
│  ├─ timeline/page.tsx       # Grouped timeline (?event=<id> deep link)
│  ├─ map/page.tsx            # Unified map (?loc=<id>, ?event=<id> deep links)
│  ├─ perspectives/page.tsx   # Six perspectives from perspectives.json
│  ├─ scenario/[id]/page.tsx  # Live Through History engine (generateStaticParams)
│  ├─ sources/page.tsx        # Sources (?source=<id> & ?event=<id>)
│  └─ guide/page.tsx          # Historical Guide
├─ components/
│  ├─ 3d/                     # Hero3D + HeroCanvas (backdrop), HistoricalScene (shell), HistoricalModel (GLB loader), PratapgadScene (R3F scene), ProceduralFort (temporary fallback), SceneControls, SceneFallback, sceneEnvironment, sceneTextures, sceneUtils
│  ├─ layout/                 # Navigation (client), Footer (server)
│  ├─ ui/                     # ArchiveButton, ArchiveHeader, Chip/Tag, HistoricalCard, Modal, Ornament, SectionTitle
│  ├─ home/                   # Hero, FeatureCards, SameEventSection, JourneyPanel (Phase B copy — atlas framing)
│  ├─ explore/AtlasExplorer.tsx   # 3-step wizard: Region → Scope (State) → Era → Period → Stories (client, lock icons)
│  ├─ story/                  # StoryPovPanel (client), EvidenceStamp (server)
│  ├─ timeline/Timeline.tsx   # Grouped TimelineGroup/TimelineItem model
│  ├─ map/                    # MapLoader (client, ssr:false), HistoricalMap (unified MapMarker model)
│  ├─ perspectives/PerspectiveCard.tsx   # PovRole-driven
│  ├─ live/LiveHub.tsx        # Role grid + moment list (client)
│  ├─ scenario/               # ScenarioEngine, DecisionCard
│  ├─ guide/HistoricalGuide.tsx
│  └─ sources/                # SourceCard, SourcesGrid, DocumentViewer
├─ lib/                       # types.ts, data.ts, store.ts, guide-engine.ts, utils.ts
├─ data/                      # regions, states, eras, periods, stories, events, people, locations(16), scenarios(14), sources(17), perspectives, guide (see §18)
└─ config                     # next.config.ts, tsconfig.json, postcss.config.mjs, AGENTS.md, all_about_historia.md
```

---

## 5. Routes, Pages & Deep Links (Phase B)

| Route | Type | Static/Dynamic | Purpose | Deep links |
|---|---|---|---|---|
| `/` | Server | ○ Static | Landing (atlas framing) | — |
| `/explore` | Server+client | ○ Static | Atlas explorer wizard (Region→Era→Subject→Stories) | — |
| `/story/<id>` | Server+client | ƒ Dynamic (`force-dynamic`) | Story folio: facts, people, sources, POV experience, mini-map, prev/next | `?perspective=<povId>` |
| `/live` | Server+client | ƒ Dynamic | Six identity roles → scenario moments | `?role=<povId>` |
| `/period/india-1857` | Server | ● SSG | Phase A period dashboard (kept) | — |
| `/timeline` | Server+client | ƒ Dynamic | Two groups: Maharashtra stories + India 1857 events | `?event=<id>` |
| `/map` | Server+client | ƒ Dynamic | Unified markers (locations + stories) | `?loc=<id>`, `?event=<id>` |
| `/perspectives` | Server | ○ Static | Six perspective cards | — |
| `/scenario/<id>` | Server+client | ● SSG | Branching live engine (14 ids) | — |
| `/sources` | Server+client | ƒ Dynamic | Source cards + viewer | `?source=<id>`, `?event=<id>` |
| `/guide` | Server+client | ○ Static | Keyword guide chat | — |
| `/_not-found` | — | ○ | 404 folio | — |

Notes:
- Routes reading `searchParams` are dynamic and `await` them via `PageProps<"route">`. `/story/[id]` reads searchParams too, so it is `force-dynamic` (a statically-prerendered page that reads `searchParams` throws `DYNAMIC_SERVER_USAGE` in production).
- Under the root `loading.tsx` stream, a thrown `notFound()` renders the 404 folio correctly in the body but the HTTP status stays 200 (Next 16 Turbopack streaming shell). Known limitation, content verified.

---

## 6. Layout & Shell

### app/layout.tsx
- Metadata title: **"Histora — An Interactive Historical Atlas"**; description mentions Maharashtra + Swarajya + 1857.
- Fonts: Cormorant Garamond 400–700 (`--font-cormorant`), Inter (`--font-inter`); body `paper-noise`.

### Navigation.tsx (client)
- `NAV_LINKS` order: **Home, Explore, Map, Timeline, Perspectives, Sources, Guide**. Active state = `pathname === "/"` for Home, `startsWith` otherwise.
- CTA "Live Through History" → **`/live`** (desktop + mobile drawer).

### Footer.tsx (server)
- Copy: "An interactive historical atlas. Begin with Maharashtra and the rise of Swarajya in the seventeenth century — then step into India 1857..."
- Explore column: Explore the Atlas / Historical Map / Timeline / Perspectives. Learn column: Live Through History (**`/live`**) / Historical Guide / Sources & Evidence.
- Verified-source count badge updates automatically.

---

## 7. Home Page Breakdown

### Hero (client)
- Kicker "**An interactive historical atlas**", H1 "**History, as it was lived.**", tagline "Not rulers alone, but the fort, the field and the street…" — parchment-deep full-viewport, hand-drawn MapArt relabeled (the sahyadri / shivneri / swarajya).
- Behind the typography a **procedural 3D diorama** (Hero3D/HeroCanvas) renders a sepia Deccan ridge with a distant fort silhouette — lazy-loaded, only when WebGL is available, `pointer-events-none`, static or gently swaying per `prefers-reduced-motion`; the SVG MapArt remains as the non-WebGL illustration.
- CTAs: **Explore History → /explore** (bronze), **Live Through History → /live** (outline); strip **People · Places · Events · Perspectives · Evidence**.

### FeatureCards (server)
- kicker "A different way in", title "History is more than dates."
- **Regions** (Compass → `/explore`), **Places** (Map → `/map`), **Moments** (Clock3 → `/timeline`); folio corner tags.

### SameEventSection (server)
- Dark band "**Same Moment. Different Experiences.**" — plaque on Maharashtra / Seventeenth Century; six role rows → `/live?role=<id>` (incl. The Commoner).

### JourneyPanel (client)
- Counts against the active period: `getStories("maharashtra-17th-century")` + `getPerspectives().length`.
- Stats: Moments explored · Perspectives (x/6) · Atlas % · Scenarios completed. Links: Continue the timeline → `/timeline`, Live through history → `/live`.

### app/page.tsx
- "Start exploring" block uses `getPeriod("maharashtra-17th-century")` with buttons **Explore the atlas → /explore** + **View the timeline → /timeline**.
- Closing dark band "A document you can step inside." shows the flow chain: **Region → Era → Subject → Place → Perspective → Evidence**.

---

## 8. Timeline Feature (grouped)

### app/timeline/page.tsx (server)
- Builds two groups: **"Chhatrapati Shivaji Maharaj"** (`sublabel` "Maharashtra — 17th century", the 12 Maharashtra stories from `getStories(maharashtra.id)`) and **"India, 1857"** (`sublabel` "Nineteenth century — prototype", the 12 events). `?event=` selects the group (story id → Maharashtra group) and initial item. Event items link to `/explore?event=<id>`; story items to `/story/<id>`.

### components/timeline/Timeline.tsx (client)
- Props `{ groups: TimelineGroup[]; initialGroupId?; initialItemId? }`; `TimelineGroup` is exported from this file.
- `TimelineGroup = { id; label; sublabel; items: TimelineItem[] }`; `TimelineItem = { id; displayDate; title; location; description; category; href; kind: "story"|"event" }`.
- Story groups render **Link cards** ("Open the story" → `/story/<id>`, calls `markEventExplored` onClick); event groups keep the parchment **folio modal** (unchanged Phase A behavior).
- On mount `setTimelineRead(true)`.

---

## 9. Map Feature (unified markers)

### Markers model (lib/types.ts)
```ts
interface MapMarker {
  id: string; title: string; sub: string; description: string;
  lat: number; lng: number; icon: "city" | "fort" | "town";
  locationId?: string; relatedStoryIds?: string[];       // → clickable story links in popup
  eventLinks?: { href: string; label: string }[];        // from relatedEventIds (1857)
  people?: string[]; feeds?: string[]; perspectives?: PovId[];
}
```

### components/map/HistoricalMap.tsx (client)
- Renders an array of `MapMarker`. `MARKER_COLORS` per icon; `initialMarkerId` → flyTo + open popup.
- Popup: title, sub, description, **Stories here** (links), **Event links**, **People / Perspectives**, footer links.
- Key panel only when `compact=false`; compass overlay; sepia `.historical-map-panel` filter stays.
- `getStoryMarkers()` / `getLocationMarkers()` in `lib/data.ts` build the unified array (stories get `perspectives: s.povs`; locations get `eventLinks` + `people`).

### components/map/MapLoader.tsx (client)
- Props `{ markers; initialMarkerId?; center?; zoom?; compact? }` — hosts the `ssr:false` dynamic import; compact mode powers the story-page mini-map (single marker, zoom ~10).

### app/map/page.tsx (server)
- `markers = [...getLocationMarkers(), ...getStoryMarkers()]`; `?loc=` and `?event=` handled; focused-record panel.

---

## 10. Story Route (new) + POV Experience

### app/story/[id]/page.tsx (server, `force-dynamic`)
- `await props.params` + `await props.searchParams`; `getStory(id)` else `notFound()`.
- Header band (breadcrumb → /explore / region / century; period chip + category tag; title; shortDescription; date/place/district/experienced-by; `EvidenceStamp tone="paper"`).
- Body: drop-cap description, "Why it mattered", people cards, related stories, **Sources & evidence** (verified vs placeholder chips).
- Sticky aside: `StoryPovPanel` + compact mini-map (`?event` link back → `/map?event=<id>`).
- **THE PLACE 3D experience (V2, asset-based):** when a story is registered in `data/sites.json` (currently `pratapgad-1659`), a full-width **THE PLACE / PRATAPGAD** section renders between the header band and the body grid, with the subtitle "Explore the location where this historical moment unfolded." and a `10 November 1659 · Maharashtra` dateline. `HistoricalScene` (HTML shell) probes the site's model URL at runtime: if `public/models/historical/pratapgad/pratapgad.glb` answers, the scene streams the GLB via `HistoricalModel` (drei `useGLTF` + Suspense + error boundary) under a "SURVEYING THE FORT···" loading bar; if it 404s, or WebGL is unavailable, or the model throws, the app falls back. `PratapgadScene` (the R3F composer) = sunlit displaced Sahyadri terrain (vertex-colored slopes → grass/rock), haze fog + sky, distant ghats, instanced rocks & scrub, static cinematic camera with a very slow ambient drift (pauses on interaction; off under `prefers-reduced-motion`), OrbitControls (min/max distance + polar clamps). Landmarks come from `data/sites.json` hotspots (Main Gate · Fortification · Summit · Ridge) rendered as archival chips → parchment panel with factual description + [Explore Record] → `/sources?event=<id>`. Controls: Rotate / +Zoom / −Zoom / Reset View. The written record and the "**Explore this moment →**" anchor remain untouched below. Labelled "HISTORICAL VISUALIZATION · This 3D environment is a stylized visualization for learning and exploration. It is not presented as an archaeologically exact reconstruction."
- **Fallback safety net (V2):** no WebGL → `SceneFallback` static diorama panel "3D VISUALIZATION UNAVAILABLE / The historical record is still available below." with event description, location, context and source links; missing/load-failed model → a temporary `ProceduralFort` (jittered extruded walls, polygon bastions, gate complex, summit keep, stairways — no naive cylinder towers) worn with a "Procedural fallback — awaiting pratapgad.glb" chip until a licensed asset is dropped in at `public/models/historical/pratapgad/pratapgad.glb`.
- `prev/next` navigation band (dark) walking the period story sequence.
- `?perspective=<povId>` selects the panel's starting perspective (server-resolved, no `useSearchParams` → no Suspense needed).

### components/story/StoryPovPanel.tsx (client)
- Props `{ storyId; storyTitle; povIds: PovId[]; selectedPov?: PovRole; liveHref? }`.
- Unselected state: kicker "What was it like?" + "Choose a point of view into this moment." and a list of perspective links (`?perspective=<pov>`).
- Selected state: dark "You are <role>" plaque with a rotated **Fictional reconstruction** stamp, tagline, experience lede, then labelled blocks — **What you see**, **What you know**, **Concerns**, **Documented context** — and pov-switch chips.
- "Live this moment" → `/scenario/<id>` when a scenario exists for story+pov (`liveHref`).
- On mount/switch `markEventExplored` + `markPerspectiveExplored` (via `useEffect` + `setTimeout`, matching ScenarioEngine's lint-passing pattern).

### components/story/EvidenceStamp.tsx (server)
- Props `{ evidence: EvidenceClass; tone?: "natural"|"paper"; className? }`.
- Renders a bordered stamp whose label/note depend on the class: **Documented fact** ("Attested in contemporary records"), **Interpretation** ("Informed historical judgement"), **Fictional reconstruction** ("Imagined for experience, grounded in documented conditions"). `tone="paper"` recolors for dark bands.

---

## 11. Live Through History (new) + Perspectives

### app/live/page.tsx (server, dynamic)
- `await props.searchParams.role`; roles from `getPerspectives()` with `momentCount` (scenarios for that pov); validates the role.
- ArchiveHeader: kicker "Live Through History", title **"Whose life will you enter?"**, subtitle "Six lives, twelve moments. Choose a perspective, then a moment in time — and live it."

### components/live/LiveHub.tsx (client)
- Props `{ roles: LiveRole[]; moments: LiveMoment[]; initialRole?: PovId }`.
- Six role cards (icons incl. `commoner`→House); active card is inverted; each shows "N live moments". Until a role is chosen, no moment list is shown.
- Moments list: kicker **"Choose a moment"** + "<role> — when and where?" heading; each moment shows date/location, title, tagline, disclaimer; buttons **"Live it"** → `/scenario/<id>` and **"Read the story behind · <title>"** → `/story/<id>`.

### app/perspectives/page.tsx + PerspectiveCard.tsx (updated)
- Title "**Six ways of reading the same events**"; cards from `perspectives.json` (fields: pov id, role, tagline, context, `concerns[]`); `commoner`→House; "Fictive reconstruction" chip; CTA → **`/live?role=<id>`**.

---

## 12. Scenario Engine (Phase A, extended)

### app/scenario/[id]/page.tsx
- `generateStaticParams()` now returns **all 14** scenario ids from `getScenarios()` (8 Maharashtra + 6 Phase A 1857 scenarios incl. farmer/soldier).

### lib/store.ts / Engine fixes
- `PlaythroughRecord` gained `perspectiveId`; `completeScenario` pushes `record.perspectiveId` into `exploredPerspectives` (replaces the old `scenarioId.replace(/-1857$/,"")` hack, which broke Maharashtra ids).
- `ScenarioEngine` passes `perspectiveId: scenario.perspectiveId`; `JourneyPanel` reads it.

---

## 13. lib/types.ts — Type System (Phase B additions)

```ts
// 1857 types unchanged: Period, Event, Person, Location, Scenario…, Source, GuideQA

type StateKey        = "safety" | "resources" | "information" | "mobility" | "connections";
type Mode            = "state" | "national" | "international";
type VisualType      = "fort" | "terrain" | "battlefield" | "city";
type PovId           = "ruler" | "soldier" | "farmer" | "merchant" | "artisan" | "commoner";
type EvidenceClass   = "documented-fact" | "interpretation" | "fictional-reconstruction";
type StoryCategory   = "birth"|"rise"|"fort"|"battle"|"escape"|"campaign"|"siege"|"coronation"|"recovery";

interface Period {  // Phase A fields + optional atlas fields
  id; title; shortTitle; year; era; subtitle; description; tagline;
  regionId?; stateId?; eraId?; century?; mode?: Mode; subjectName?; subjectDescription?;
  overview: { importantEvents; majorRegions; socialGroups; context }
}
interface Region      { id; name; region; available: boolean; periodId?; note }
interface RegionState { id; regionId; name; code; mode: Mode; available: boolean; note }
interface Era         { id; label; title; description; subjectPeriodId? }
interface StoryPerson { id; name; role; note }
interface Story {
  id; periodId; regionId; stateId; category: StoryCategory;
  scope?: Mode; visualType?: VisualType;          // scope = filter rubric; visualType = legacy 3D style flag (V1)
  // NOTE (V2): the 3D experience is no longer driven by Story.visualType — it is driven by
  // a matching entry in data/sites.json (lib/sites.ts → getSiteForStory). visualType is kept as
  // inert data on pratapgad-1659 only; new future-proof accessor set in lib/sites.ts.
  title; date; displayDate; century; period; state; region; district; location;
  latitude; longitude; shortDescription; description; significance;
  people: StoryPerson[]; relatedStories: string[]; locationIds: string[];
  sourceIds: string[]; evidence: EvidenceClass; povs: PovId[];
}
interface PovRole {   // one entry of perspectives.json
  id: PovId; role; tagline; icon;
  knows: string[]; sees: string; concerns: string[]; risks: string[]; resources: string[];
  experience; context;
}
interface TimelineItem { id; displayDate; title; location; description; category; href; kind: "story"|"event" }
interface MapMarker    { /* §9 */ }
// TimelineGroup { id; label; sublabel; items: TimelineItem[] } is exported from components/timeline/Timeline.tsx
interface PlaythroughRecord { scenarioId; perspectiveId; title; decisions: string[]; completedAt: string }
```

---

## 14. lib/data.ts — Accessors (Phase B)

- Raw exports: `regions, states, eras, periods, stories, events, people, locations, scenarios, sources, guideQA, perspectives`.
- Getters: `getRegions/getRegion, getStates/getState, getEras/getEra, getPeriods`,
  `getStories(periodId=PERIOD_ID)/getStory/getStoriesForLocation`,
  `getPerspectives/getPerspective/getScenarioForStoryAndPerspective/getScenarios/getScenariosByPerspective`,
  `getSourcesForStory/getStoryPeople/getPeriodByRegionAndEra`,
  `getStoryMarkers/getLocationMarkers/getTimelineItems`,
  `getEvents/getEvent/getPeople/getPerson/getLocations/getLocation/getScenario/getSource/…` (Phase A kept).
- `STORY_CATEGORY_ICON`: birth/rise/fort/coronation/recovery → "fort"; battle/siege → "battle"; escape → "pass"; campaign → "city".
- `PERIOD_ID = "india-1857"` is **still the default of `getStories()`** — always pass the Maharashtra id explicitly (JourneyPanel does).
- Re-exports all types.

---

## 15. lib/store.ts — Journey State

- Same persisted store (`histora-journey`). `completeScenario` now uses `record.perspectiveId` (see §12).

---

## 16. lib/guide-engine.ts

- `answer` fallback text now suggests Swarajya/Shivaji/forts/Raigad + 1857.
- `guideSourceHint` supports a direct id map for the 6 Maharashtra guide entries (`maharashtra-shivaji`→`sg-sabhasad`, `maharashtra-17th`→`sg-sabhasad`, `maharashtra-swarajya`→`sg-sarkar`, `maharashtra-pratapgad`→`sg-afzalkhan`, `maharashtra-coronation`→`sg-coronation`, `maharashtra-sources`→`sg-sarkar`) plus the original 1857 title/author hints.

---

## 17. lib/utils.ts — unchanged (`cn, clamp, formatDate, scrollToId, timeAgo`).

---

## 18. Content Layer (data/*.json)

- `regions.json` (9) — `maharashtra` (open), new modules locked.
- `states.json` (4) — `maharashtra` (open), others locked.
- `eras.json` (5) — `early-modern` open for Maharashtra; `ancient/medieval/colonial/modern` locked.
- `periods.json` (2) — `india-1857` (Phase A) + **`maharashtra-17th-century`** ("RISE OF SWARAJYA — 1645–1680", `regionId` `maharashtra`, `stateId` `maharashtra`, `eraId` `early-modern`, `mode` `state`, `subjectName` "Chhatrapati Shivaji Maharaj"; locations `pratapgad,panhala,torna,rajgad,raigad`; overview of the Swarajya rise).
- `locations.json` (16) — 5 Phase A (Meerut/Delhi/Kanpur/Lucknow/Jhansi) + 11 Phase B (Shivneri, Pune, Torna, Rajgad, Sinhagad, Pratapgad, Panhala, Vishalgad, Surat, Agra, Raigad) with real lat/lng, icons (`fort`/`city`/`town`).
- `stories.json` (12) — the Swarajya narrative:
  `birth-shivneri-1630, first-forts-rise-of-swarajya, torna-beginning-expansion, rajgad-building-new-power, capture-consolidation-of-forts, pratapgad-1659, panhala-siege-escape, pavankhind, surat-campaign-1664, agra-episode-1666, return-expansion-recovery-of-forts, coronation-raigad-1674`. Each: full folio fields ± people, related stories, locationIds, sourceIds, `povs[]`, `evidence` note. `pratapgad-1659` additionally carries the inert `"visualType": "fort"` flag from V1 (no longer wired to the 3D layer).
- `sites.json` (1) — V2 3D site registry: `pratapgad` → `storyId pratapgad-1659`, `model "/models/historical/pratapgad/pratapgad.glb"`, `title/location/century/date`, and 4 factual `hotspots[]` (Main Gate · Fortification · Summit · Ridge, each `{ id, title, description, position:[x,y,z] }`) that the scene renders as archival chips. Add new forts simply by appending entries — `HistoricalScene`/`PratapgadScene` need no code change.
- `perspectives.json` (6) — `ruler, soldier, farmer, merchant, artisan, commoner`. Each entry is a `PovRole`: role, tagline, icon, `knows[]`, `sees`, `concerns[]`, `risks[]`, `resources[]`, `experience`, `context`. Drives `/perspectives`, `/live`, and the story POV panel (new `commoner` replaces Phase A's people-only model).
- `sources.json` (17) — Phase A nine + **Phase B eight**: `sg-sarkar` (Sarkar), `sg-sabhasad` (Sabhasad's Bakhar), `sg-pagdi` (Pagdi), `sg-sardesai` (New History of the Marathas, Vol. I) are `verified: true`; `sg-afzalkhan`, `sg-agra-escape`, `sg-coronation`, `sg-surat` are `verified: false` with `placeholder` notes pending archival shelf references. The JSON was missing a closing `]` in Phase A and was fixed.
- `scenarios.json` (14) — Phase A 6 + **Phase B 8**: `ruler-coronation-raigad-1674, soldier-pratapgad-1659, soldier-panhala-1660, farmer-torna-1646, merchant-surat-1664, artisan-rajgad-1650, commoner-shivneri-1630, commoner-coronation-1674` (meter labels themed to the Deccan; all carry `perspectiveId` + `FICTIONAL RECONSTRUCTION` disclaimer).
- `guide.json` (21) — 6 new Q&As (Shivaji, 17th-century Deccan, Swarajya, Pratapgad, Raigad coronation, sources/method) prepended to Phase A's 15.

---

## 19. Design System

- Theme tokens: **unchanged** — parchment/paper/ink trio, bronze accent, Cormorant + Inter (`--color-*`, `--font-*`, `--shadow-paper*`, animations `fade-in/fade-up/ink-progress`).
- **New CSS:** `.stamp` (inline-flex bordered uppercase badge), `.stamp-rotate` (−2°), `.stamp-bronze/paper/faint` color variants — used by EvidenceStamp/StoryPovPanel (`FICTIONAL RECONSTRUCTION`).
- Everything else (`.paper-noise`, `.parchment*`, `.btn-archive`/`.btn-outline`, `.drop-cap`, Leaflet overrides, scrollbar, reduced-motion) unchanged.

---

## 20. Reusable Components Reference (Phase B changes only)

| Component | Kind | Props (new) | Notes |
|---|---|---|---|
| `AtlasExplorer` | client | `regions eras periods stories` | 3-step region→scope→era wizard; period panel; story grid with EvidenceStamp; Lock icons for closed modules |
| `StoryPovPanel` | client | `storyId storyTitle povIds selectedPov? liveHref?` | perspective blocks + stamp + live CTA |
| `EvidenceStamp` | server | `evidence tone?` | evidence stamp |
| `MapLoader` | client | `markers initialMarkerId? center? zoom? compact?` | replaced `locations/initialLocId` |
| `HistoricalMap` | client | `markers initialMarkerId? center? zoom? compact?` | unified markers (stories, eventLinks, people, perspectives) |
| `Timeline` | client | `groups initialGroupId? initialItemId?` | replaces `events/initialEventId` |
| `PerspectiveCard` | server | `pov index?` | istead of `person` |
| `LiveHub` | client | `roles moments initialRole?` | role grid + moments |
| `JourneyPanel` | client | `compact?` | active-period counts |
| `HistoricalScene` | client | `title location? dateText? description contextText? sources modelPath? hotspots recordHref? className?` | THE PLACE 3D shell (V2): WebGL gate, runtime model probe, "SURVEYING THE FORT···" overlay, `SceneControls`, hotspot panel, `SceneFallback`, "HISTORICAL VISUALIZATION" figcaption |
| `HistoricalModel` | client | `path onReady? onError?` | drei `useGLTF` + Suspense + error boundary; enables shadow casting on GLB meshes |
| `PratapgadScene` | client | `mode modelPath hotspots activeHotspotId onSelectHotspot driftEnabled zoomIn/OutSignal resetSignal reduced quality recordHref onModelReady onModelError fallbackNotice` | R3F composer: sunlit displaced terrain, haze/sky/ghats, vitals scatter, drift rig (slow cinematic ambience, pauses on interaction, off under reduced-motion), OrbitControls, dispatches `HistoricalModel` ↔ `ProceduralFort`, drei Html hotspot chips |
| `ProceduralFort` | client | `baseY shadowsOn` | temporary architectural fallback (irregular extruded walls, polygon bastions, gate complex, summit keep, stairways) until a licensed GLB exists |
| `SceneControls` | client | `driftActive driftDisabled onToggleDrift onZoomIn onZoomOut onReset` | minimal archive bar: Rotate / +Zoom / −Zoom / Reset |
| `SceneFallback` | client | `title locationLabel? dateText? description contextText sources className?` | no-WebGL static diorama + "3D VISUALIZATION UNAVAILABLE" + event description/location/context/source links |
| `sceneEnvironment` | client | — | sky dome, warm sun + shadow-caster, hemisphere fill, distant ghats rings |
| `sceneTextures` | client | — | memoized procedural PBR textures (stone colour/height, terrain colour/height, roughness, sky gradient) |
| `Hero3D` / `HeroCanvas` | client | — / `reduced?` | home backdrop: WebGL gate + lazy ridge/fort scene |
| `TiltCard` | client | `children className? maxDeg?` | subtle pointer-tilt depth wrapper for Explore story cards (reduced-motion safe) |

---

## 21. Content / Accuracy Rules (unchanged, enforced)

1. Scenarios always display the `FICTIONAL RECONSTRUCTION` disclaimer.
2. Unverified/placeholder sources show explicit notices; `demoDocument` is labelled "Demonstration".
3. Story/event facts each link a `sourceId`; the Guide tags answers by evidence class.
4. The map is a teaching instrument, not period cartography (footer note).
5. Meters are gameplay, never historical scoring (stated in scenario intros).
6. Story `description`, `significance`, `evidence` avoid fabricating precise facts; uncertain dates are stated as traditional/approximate.

---

## 22. Accessibility & Performance Notes (unchanged)

- Modal/folio accessibility; focus-visible outlines; reduced-motion kill-switch; `whileInView` reveals.
- SSR-level: all new pages pre-rendered (static/SSG) except URL-driven ones; map + guide client-only.

---

## 23. Verified Status (QA log — Phase B)

- `npm run build` → green (Turbopack; 15 route entries; `/story/[id]` and `/live` dynamic; 12 story ids available on demand; 14 scenario ids SSG'd; `/period/india-1857` still SSG'd).
- `npx tsc --noEmit` → 0 errors. `npx eslint .` → 0 errors (1 harmless pre-existing `import/no-anonymous-default-export` warning in `postcss.config.mjs`).
- HTTP smoke (production server): `/`, `/explore`, `/live`, `/live?role=commoner`, `/map`, `/map?loc=torna`, `/map?event=pratapgad-1659`, `/timeline`, `/timeline?event=…`, `/perspectives`, `/sources`, `/sources?event=…`, `/guide`, 4 story pages + `?perspective=` variants, 6 scenarios (Phase B + Phase A), `/period/india-1857` — all 200 with SSR content markers.
- Known limitation (Next 16 Turbopack): a story page's `notFound()` streams the 404 folio as content but the HTTP status remains 200 because the root `loading.tsx` shell commits headers first. Browser behavior verified correct; `curl` status is 200.
- 3D layer (V2): `npm run lint` / `npx tsc --noEmit` / `npm run build` green (26 routes); production SSR smoke: `/` 200, `/story/pratapgad-1659` 200 with THE PLACE section, "Explore the location where this historical moment unfolded.", dateline `10 November 1659 · Maharashtra`, hotspots (Main Gate · Fortification · Summit · Ridge) and the SSR fallback state ("3D VISUALIZATION UNAVAILABLE" + "The historical record is still available below.") which hydrates into the WebGL scene; `/story/panhala-siege-escape` 200 with **no** THE PLACE section; `/explore`, `/sources?event=pratapgad-1659`, `/map?event=pratapgad-1659`, `/timeline` 200; `GET /models/historical/pratapgad/pratapgad.glb` correctly 404 while the asset is unstaged (runtime falls back to `ProceduralFort`). `three` remains one lazy client chunk fetched only when WebGL is available and a scene mounts. The rendered WebGL scene (camera framing, drift, hotspot chips, shadows) still needs a real-browser/visual pass.
- Client-side interactivity (map popups, LiveHub selection, POV marks, modals) verified at SSR level only, not driven in a real browser.

---

## 24. Extension Paths

- **Add a new subject/period:** add `regions/states/eras/periods/stories/…` JSON + accessors; the atlas UI is data-driven — unlock new `region`/`era`/`state` locks in the JSON.
- **More story routes:** `/story/[id]` requires no code changes for new ids (dynamic, `getStory` + notFound).
- **More 3D sites/forts:** append an entry to `data/sites.json` pointing at the new model path and reuse the one `HistoricalScene`/`PratapgadScene` pipeline (Rajgad, Raigad, Shivneri, Panhala, Pavankhind…). Drop the licensed `.glb` at `public/models/historical/<site>/<site>.glb` per the README; until then the labeled procedural fallback runs. Hotspot positions live in `sites.json` and may need re-tuning per mesh. All scene text/data is passed via `HistoricalScene` props — never duplicated inside the 3D components.
- **Connect a real AI to the Guide:** swap `askGuide`'s body for an async call returning the same `GuideResponse`.
- **Replace placeholders:** the four `verified:false` Phase B sources (`sg-afzalkhan`, `sg-agra-escape`, `sg-coronation`, `sg-surat`) await verified archival shelf references (published English Factory Records, Persian chronicle chapters), as do the Phase A `meerut-court` and `rani-placeholder`.
- **Footnote docs:** update this file after UI/data changes; re-run `npx next typegen` after adding routes.

---

## 25. 3D Visual Experience (V2 — asset-based pipeline)

- Three placements: the **home Hero** (decorative), the **story page THE PLACE section** (interactive Pratapgad scene, driven by `data/sites.json` via `getSiteForStory` — no longer by `Story.visualType`), and **subtle tilt depth on Explore result cards** (CSS/perspective, no 3D lib).
- **Asset-first (V2 directive):** naive primitive geometry (cylinder tower / cube wall / cone roof) is **not** the fort anymore. The pipeline loads a real licensed `.glb` (`public/models/historical/pratapgad/pratapgad.glb`) through `HistoricalScene` (runtime HEAD probe) → `HistoricalModel` (drei `useGLTF` + Suspense + error boundary). While the model streams, the stage shows "SURVEYING THE FORT···" with an ink progress bar. If the URL 404s, WebGL is absent, or the model throws, `ProceduralFort` renders instead — a *temporary, clearly-labelled* fallback built from jittered extruded walls, polygonal bastions, a gate complex, summit keep, and terrain-following stairways (no cylinder towers), tagged "Procedural fallback — awaiting pratapgad.glb". **Alignment is automatic and data-driven:** `HistoricalModel` applies the site's `transform` from `data/sites.json` — `excludePrefixes` drops satellite terrain/photo nodes, `targetHeight` re-scales, `rotationY` re-orients, `embed` buries the raw photogrammetry slab-edge under the mountain crown — so replacing or re-exporting the mesh needs no code edits. The scene ground is **one continuous fortress mountain** (`siteTerrainHeight`, `sceneUtils.ts`): the crown rises to just below the wall footings so fortifications sit *on* the hill, a raised rim completely covers the slab underside around the terrace (no floating plates, no razor cuts, no exposed undersides), and smooth rocky shoulders fall into the valley; vegetation is seeded on the real surface with keep-out zones around the fort and the gate approach, so nothing floats or is buried. No `.glb` is fabricated or committed. A read-only everyday asset swap needs **zero code changes** — replace the file (details in `public/models/historical/pratapgad/README.md`).
- **Scene composition:** sunlit displaced Sahyadri terrain with vertex-colored slopes (grass → soil → rock by gradient), procedural PBR textures (stone/terrain colour + height, roughness, sky), haze fog + horizon dome, three rings of distant ghats, sparse instanced rocks & scrub (halved on `quality="reduced"`). Camera is **static cinematic** (three-quarter aerial from the south-east) with a very slow ambient drift (±0.05 rad sway) that **pauses on user interaction** and is fully off under `prefers-reduced-motion`; `frameloop` switches `always`/`demand` accordingly. OrbitControls: drag-to-rotate, wheel/+/− zoom, Reset View, min/max distance + polar clamps.
- **Landmarks (data-driven):** `data/sites.json` hotspots (Main Gate · Fortification · Summit · Ridge) render as archival chips over the scene; click opens a parchment panel with a factual description and [Explore Record] → `/sources?event=<id>`. Hotspot coordinates were authored against the procedural fallback and may need re-tuning once the real mesh lands (edit `sites.json`, no code change).
- **Fallback safety net:** no WebGL → `SceneFallback` static diorama panel: "3D VISUALIZATION UNAVAILABLE / The historical record is still available below." + event description, location, context, and source links. The page never goes blank; the written record below the scene is never replaced.
- **Ethics label:** the stage is always captioned "HISTORICAL VISUALIZATION · This 3D environment is a stylized visualization for learning and exploration. It is not presented as an archaeologically exact reconstruction." Fictional reconstructions keep their existing `FICTIONAL RECONSTRUCTION` stamps elsewhere; the Leaflet map is untouched.
- **Performance:** compressed GLB only (Draco/KTX2 when practical), no 4K/8K-everywhere maps, limited lights, reduced dpr on mobile/coarse/≤4-core (`quality="reduced"`: fewer instances, coarser terrain, no shadow casters), single lazy `three` chunk, client-only.

## 26. 3D Legacy Notes (V1 → V2)

- V1's `SceneLoader.tsx` and `SCENE_MARKERS`/`SceneMarkerId` callouts (FORT·GATE·RIDGE·VALLEY) were removed; `PratapgadScene` and `HistoricalScene` were rewritten for the asset pipeline. `story.visualType` and `VisualType` remain in the types/data only as inert legacy. Re-run `npx next typegen` if routes change.