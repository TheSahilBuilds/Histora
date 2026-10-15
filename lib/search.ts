import {
  stories,
  events,
  locations,
  people,
  sources,
  perspectives,
  periods,
} from "@/lib/data";
import type { EvidenceClass } from "@/lib/types";

export type SearchKind =
  | "story"
  | "event"
  | "location"
  | "person"
  | "source"
  | "perspective"
  | "period";

export interface SearchResult {
  id: string;
  kind: SearchKind;
  title: string;
  subtitle: string;
  description: string;
  href: string;
  date?: string;
  location?: string;
  evidence?: EvidenceClass;
  meta?: string;
  keywords: string[];
}

export const KIND_LABEL: Record<SearchKind, string> = {
  story: "Story",
  event: "Event",
  location: "Place",
  person: "Person",
  source: "Source",
  perspective: "Perspective",
  period: "Period",
};

export const SEARCH_KINDS: { id: SearchKind | "all"; label: string }[] = [
  { id: "all", label: "Everything" },
  { id: "story", label: "Stories" },
  { id: "event", label: "Events" },
  { id: "location", label: "Places" },
  { id: "person", label: "People" },
  { id: "source", label: "Sources" },
  { id: "perspective", label: "Perspectives" },
  { id: "period", label: "Periods" },
];

export const EVIDENCE_LABEL: Record<EvidenceClass, string> = {
  "documented-fact": "Documented fact",
  interpretation: "Interpretation",
  "fictional-reconstruction": "Fictional reconstruction",
};

function buildIndex(): SearchResult[] {
  const out: SearchResult[] = [];

  for (const s of stories) {
    out.push({
      id: `story-${s.id}`,
      kind: "story",
      title: s.title,
      subtitle: `${s.displayDate} · ${s.location}`,
      description: s.shortDescription,
      href: `/story/${s.id}`,
      date: s.displayDate,
      location: s.location,
      evidence: s.evidence,
      meta: s.century,
      keywords: [
        s.title,
        s.century,
        s.era ?? "",
        s.period,
        s.state,
        s.region,
        s.district,
        s.location,
        s.category,
        ...s.povs,
        ...s.people.map((p) => p.name),
      ],
    });
  }

  for (const e of events) {
    out.push({
      id: `event-${e.id}`,
      kind: "event",
      title: e.title,
      subtitle: `${e.displayDate} · ${e.location}`,
      description: e.description,
      href: `/sources?event=${e.id}`,
      date: e.displayDate,
      location: e.location,
      meta: e.category,
      keywords: [e.title, e.location, e.category, e.significance],
    });
  }

  for (const l of locations) {
    out.push({
      id: `location-${l.id}`,
      kind: "location",
      title: l.name,
      subtitle: l.region,
      description: l.description,
      href: `/map?loc=${l.id}`,
      location: l.name,
      meta: l.icon,
      keywords: [l.name, l.region, l.tagline, ...(l.relatedStoryIds ?? [])],
    });
  }

  for (const p of people) {
    out.push({
      id: `person-${p.id}`,
      kind: "person",
      title: p.role,
      subtitle: p.tagline,
      description: p.context,
      href: `/period/${p.periodId}`,
      meta: "Perspective person",
      keywords: [p.role, p.tagline, ...p.concerns],
    });
  }

  for (const s of sources) {
    out.push({
      id: `source-${s.id}`,
      kind: "source",
      title: s.title,
      subtitle: `${s.author} · ${s.year}`,
      description: s.description,
      href: `/sources?source=${s.id}`,
      date: s.year,
      meta: s.type,
      keywords: [s.title, s.author, s.year, s.type, s.category, s.institution ?? ""],
    });
  }

  for (const p of perspectives) {
    out.push({
      id: `perspective-${p.id}`,
      kind: "perspective",
      title: p.role,
      subtitle: p.tagline,
      description: p.context,
      href: "/perspectives",
      meta: "Perspective",
      keywords: [p.role, p.tagline, p.sees, p.experience, ...p.knows, ...p.concerns],
    });
  }

  for (const p of periods) {
    out.push({
      id: `period-${p.id}`,
      kind: "period",
      title: p.title,
      subtitle: p.subtitle,
      description: p.description,
      href: `/period/${p.id}`,
      date: p.year,
      meta: p.era,
      keywords: [
        p.title,
        p.subtitle,
        p.tagline,
        p.era,
        p.subjectName ?? "",
        ...p.overview.importantEvents,
        ...p.overview.majorRegions,
        ...p.overview.socialGroups,
        ...p.overview.context,
      ],
    });
  }

  return out;
}

let INDEX: SearchResult[] | null = null;

export function getSearchIndex(): SearchResult[] {
  return (INDEX ??= buildIndex());
}

const STOP_WORDS = new Set([
  "the", "a", "an", "of", "to", "in", "on", "for", "and", "or", "but",
  "was", "were", "is", "are", "did", "do", "what", "how", "why", "when",
  "who", "where", "can", "you", "tell", "me", "about", "please", "i",
  "my", "it", "its", "that", "this", "there", "they", "them", "their",
  "would", "could", "should", "has", "have", "had", "with", "from", "at",
  "by", "as", "be", "been",
]);

export function tokenize(query: string): string[] {
  return query
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 1 && !STOP_WORDS.has(w));
}

function score(result: SearchResult, tokens: string[], raw: string): number {
  const title = result.title.toLowerCase();
  const meta = `${result.subtitle} ${result.date ?? ""} ${result.location ?? ""} ${result.meta ?? ""}`.toLowerCase();
  const description = result.description.toLowerCase();
  const keywords = result.keywords.join(" ").toLowerCase();

  let score = 0;
  if (title === raw) score += 14;
  else if (raw.length >= 3 && title.includes(raw)) score += 7;

  for (const token of tokens) {
    if (title.includes(token)) score += 5;
    if (keywords.includes(token)) score += 3;
    if (meta.includes(token)) score += 2;
    if (description.includes(token)) score += 1;
  }
  return score;
}

export function searchArchive(
  query: string,
  kind: SearchKind | "all" = "all"
): SearchResult[] {
  const raw = query.trim().toLowerCase();
  if (!raw) return [];

  const tokens = Array.from(new Set(tokenize(raw)));

  return getSearchIndex()
    .filter((result) => kind === "all" || result.kind === kind)
    .map((result) => ({ result, score: score(result, tokens, raw) }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || a.result.title.localeCompare(b.result.title))
    .map((entry) => entry.result);
}
