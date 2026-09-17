# Histora — History From Below

An interactive historical-learning prototype focused on **India 1857**. Histora re-centres history on people, places and experience: every event is traced to a source, and every dramatic scene is a **fictional reconstruction grounded in documented conditions** — never a claim about a real named individual.

## What you can do

- **Explore** — period catalogue with historical overview.
- **Timeline** — twelve dated records, each opening a document folio with its significance and related source.
- **Map** — five places on a sepia archival map with events and people attached.
- **Perspectives** — six social worlds (soldier, farmer, artisan, merchant, student, ruler).
- **Live Through History** — branching scenarios where you decide as a fictional person of the time; each choice shows its consequence, its historical context and a linked source.
- **Guide** — a simulated research companion that answers from a curated dataset and labels *documented fact / interpretation / fictional reconstruction*.
- **Sources** — verified records, placeholder references (explicitly marked), and a demonstration document.

## Tech stack

- Next.js 16 (App Router, Turbopack), React 19, TypeScript
- Tailwind CSS v4 (`@tailwindcss/postcss`, theming via `@theme` in `app/globals.css`)
- `motion` (Framer Motion) for transitions
- `react-leaflet` + `leaflet` for the map (client-only, `ssr: false`)
- `zustand` (with `persist`) for the "Your Journey" progress tracker
- `lucide-react` icons

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
```

Production:

```bash
npm run build && npm run start
```

## Project structure

```
app/
  page.tsx                       home
  explore/                       period catalogue
  period/[id]/                   period dashboard
  timeline/                      timeline + event modal (deep-linkable via ?event=)
  map/                           historical map                       (?loc=)
  perspectives/                  six perspectives
  scenario/[id]/                 Live Through History                (?…  )
  sources/                       sources, filters, document viewer   (?source=)
  guide/                         Historical Guide
  globals.css                    theme, textures, buttons, leaflet overrides
components/
  layout/   Navigation, Footer
  home/     Hero, FeatureCards, SameEventSection, JourneyPanel
  ui/       ArchiveButton, ArchiveHeader, Chip, HistoricalCard, Modal,
            Ornament, SectionTitle
  timeline/ Timeline
  map/      HistoricalMap, MapLoader
  perspectives/ PerspectiveCard
  scenario/ ScenarioEngine, DecisionCard
  guide/    HistoricalGuide
  sources/  SourceCard, SourcesGrid, DocumentViewer
data/        periods, events, people, locations, scenarios, sources, guide (.json)
lib/
  types.ts       all TypeScript types
  data.ts        typed accessors over the JSON
  store.ts       zustand journey store
  guide-engine.ts keyword-based Guide; the single API seam for a real LLM
  utils.ts       cn(), clamp()
```

## Adding a period

1. Add `periods.json` entry and create `/period/[id]` data by copying the pattern for `india-1857`.
2. Add events, locations, people, scenarios, sources following the existing shape in `lib/types.ts`.
3. The UI is fully data-driven — no route changes are needed for timeline, map, scenarios or sources.

## Connecting a real AI to the Guide

`lib/guide-engine.ts` exposes `askGuide(query): GuideResponse` (shape: `answer`, `tags`, `followUps`, `matchedQuestion`, `matchedId`, `confidence`). To use a real model later, replace the body with an async call to an API route that returns the same shape — nothing else in the UI changes.

## Notes on accuracy

- Verified records are marked; unverifiable references carry explicit **placeholder** notices.
- The map uses a modern geographic base, sepia-toned, as a teaching instrument.
- All scenario characters are fictional reconstructions based on documented conditions, and are labelled as such.