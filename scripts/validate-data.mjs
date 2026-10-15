// Data integrity gate for Histora's local JSON dataset.
// Run: node scripts/validate-data.mjs   (exit code 1 on any error)
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dataDir = path.join(root, "data");

const EVIDENCE_CLASSES = ["documented-fact", "interpretation", "fictional-reconstruction"];

const errors = [];
const err = (msg) => errors.push(msg);

function load(name) {
  const file = path.join(dataDir, `${name}.json`);
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch (e) {
    err(`${name}.json: failed to parse — ${e.message}`);
    return [];
  }
}

const periods = load("periods");
const stories = load("stories");
const events = load("events");
const locations = load("locations");
const people = load("people");
const perspectives = load("perspectives");
const scenarios = load("scenarios");
const sources = load("sources");
const guide = load("guide");

const byId = (arr) => new Map(arr.map((x) => [x.id, x]));
const has = (map, id) => map.has(id);

const periodIds = byId(periods);
const storyIds = byId(stories);
const eventIds = byId(events);
const locationIds = byId(locations);
const peopleIds = byId(people);
const perspectiveIds = byId(perspectives);
const sourceIds = byId(sources);

// --- unique ids per collection ---
for (const [name, arr] of Object.entries({ periods, stories, events, locations, people, perspectives, scenarios, sources, guide })) {
  const seen = new Set();
  for (const item of arr) {
    if (!item.id) err(`${name}: entry without id (${JSON.stringify(item).slice(0, 60)}…)`);
    else if (seen.has(item.id)) err(`${name}: duplicate id "${item.id}"`);
    else seen.add(item.id);
  }
}

// guide questions must also be unique (they are used as followUp targets)
{
  const seen = new Set();
  for (const q of guide) {
    if (seen.has(q.question)) err(`guide: duplicate question text "${q.question}"`);
    else seen.add(q.question);
  }
}

// --- periods ---
for (const p of periods) {
  if (!p.id || !p.title) err(`periods: "${p.id}" missing title`);
}

// --- stories ---
for (const s of stories) {
  if (!has(periodIds, s.periodId)) err(`story "${s.id}": unknown periodId "${s.periodId}"`);
  for (const sid of s.sourceIds ?? []) {
    if (!has(sourceIds, sid)) err(`story "${s.id}": unknown sourceId "${sid}"`);
  }
  for (const lid of s.locationIds ?? []) {
    if (!has(locationIds, lid)) err(`story "${s.id}": unknown locationId "${lid}"`);
  }
  for (const rid of s.relatedStories ?? []) {
    if (!has(storyIds, rid)) err(`story "${s.id}": unknown relatedStory "${rid}"`);
  }
  for (const pov of s.povs ?? []) {
    if (!has(perspectiveIds, pov)) err(`story "${s.id}": pov "${pov}" is not a known perspective`);
  }
  if (!EVIDENCE_CLASSES.includes(s.evidence)) {
    err(`story "${s.id}": evidence "${s.evidence}" is not one of ${EVIDENCE_CLASSES.join("/")}`);
  }
}

// --- events ---
for (const e of events) {
  if (!has(periodIds, e.periodId)) err(`event "${e.id}": unknown periodId "${e.periodId}"`);
  if (e.locationId && !has(locationIds, e.locationId)) err(`event "${e.id}": unknown locationId "${e.locationId}"`);
  if (!e.sourceId) err(`event "${e.id}": missing sourceId`);
  else if (!has(sourceIds, e.sourceId)) err(`event "${e.id}": unknown sourceId "${e.sourceId}"`);
}

// --- locations ---
for (const l of locations) {
  for (const sid of l.sourceIds ?? []) {
    if (!has(sourceIds, sid)) err(`location "${l.id}": unknown sourceId "${sid}"`);
  }
  for (const eid of l.events ?? []) {
    if (!has(eventIds, eid)) err(`location "${l.id}": unknown event "${eid}"`);
  }
  for (const pid of l.relatedPeople ?? []) {
    if (!has(peopleIds, pid)) err(`location "${l.id}": relatedPeople "${pid}" does not resolve to a person`);
  }
  for (const sid of l.relatedStoryIds ?? []) {
    if (!has(storyIds, sid)) err(`location "${l.id}": unknown relatedStory "${sid}"`);
  }
}

// --- scenarios ---
for (const sc of scenarios) {
  if (!has(periodIds, sc.periodId)) err(`scenario "${sc.id}": unknown periodId "${sc.periodId}"`);
  if (!has(perspectiveIds, sc.perspectiveId)) {
    err(`scenario "${sc.id}": perspectiveId "${sc.perspectiveId}" does not resolve to a perspective`);
  }
  if (sc.storyId && !has(storyIds, sc.storyId)) err(`scenario "${sc.id}": unknown storyId "${sc.storyId}"`);
}

// --- sources: reverse links + story/source symmetry ---
for (const s of sources) {
  for (const eid of s.relatedEventIds ?? []) {
    if (!has(eventIds, eid)) err(`source "${s.id}": unknown relatedEvent "${eid}"`);
  }
  for (const sid of s.relatedStoryIds ?? []) {
    if (!has(storyIds, sid)) err(`source "${s.id}": unknown relatedStory "${sid}"`);
  }
}
for (const s of sources) {
  for (const sid of s.relatedStoryIds ?? []) {
    const story = storyIds.get(sid);
    if (story && !(story.sourceIds ?? []).includes(s.id)) {
      err(`link asymmetry: source "${s.id}" lists story "${sid}", but the story does not cite the source`);
    }
  }
}
for (const s of stories) {
  for (const sid of s.sourceIds ?? []) {
    const src = sourceIds.get(sid);
    if (src && !(src.relatedStoryIds ?? []).includes(s.id)) {
      err(`link asymmetry: story "${s.id}" cites source "${sid}", but the source does not list the story`);
    }
  }
}
for (const e of events) {
  const src = sourceIds.get(e.sourceId);
  if (src && !(src.relatedEventIds ?? []).includes(e.id)) {
    err(`link asymmetry: event "${e.id}" cites source "${e.sourceId}", but the source does not list the event`);
  }
}

// --- guide: followUp entries must be exact questions ---
{
  const questions = new Set(guide.map((q) => q.question));
  for (const q of guide) {
    for (const f of q.followUp ?? []) {
      if (!questions.has(f)) err(`guide "${q.id}": followUp "${f}" does not match any question`);
    }
    if ((q.followUp ?? []).includes(q.question)) err(`guide "${q.id}": followUp references its own question`);
    const dupes = (q.followUp ?? []).length !== new Set(q.followUp ?? []).size;
    if (dupes) err(`guide "${q.id}": duplicate followUp entries`);
    if (!(q.tags ?? []).length) err(`guide "${q.id}": missing tags`);
  }
}

// --- guide-engine hint maps must point at real source ids ---
{
  const enginePath = path.join(root, "lib", "guide-engine.ts");
  const src = fs.readFileSync(enginePath, "utf8");
  for (const mapName of ["direct", "sourceHints"]) {
    const m = src.match(new RegExp(`const ${mapName}[^=]*=\\s*\\{([\\s\\S]*?)\\};`));
    if (!m) {
      err(`guide-engine.ts: could not locate "${mapName}" hint map`);
      continue;
    }
    for (const [, key, value] of m[1].matchAll(/"([^"]+)"\s*:\s*"([^"]+)"/g)) {
      if (!has(sourceIds, value)) {
        err(`guide-engine.ts: ${mapName}["${key}"] points at unknown source "${value}"`);
      }
    }
  }
}

// --- report ---
if (errors.length) {
  console.error(`validate-data: ${errors.length} error(s)\n`);
  for (const e of errors) console.error("  ✗ " + e);
  process.exit(1);
}
console.log(
  `validate-data: OK — ${periods.length} periods, ${stories.length} stories, ${events.length} events, ` +
    `${locations.length} locations, ${people.length} people, ${perspectives.length} perspectives, ` +
    `${scenarios.length} scenarios, ${sources.length} sources, ${guide.length} guide entries`
);
