import { guideQA, stories, events, locations, sources, perspectives } from "@/lib/data";
import { askGuide, guideSourceHint, type GuideAnswer, type GuideCitation } from "@/lib/guide-engine";
import { tokenize } from "@/lib/search";

export interface GuideDoc {
  id: string;
  kind: "guide" | "story" | "event" | "location" | "source" | "perspective";
  title: string;
  text: string;
  href: string;
  sourceIds: string[];
}

function buildCorpus(): GuideDoc[] {
  const out: GuideDoc[] = [];

  for (const q of guideQA) {
    const hint = guideSourceHint(q.id);
    out.push({
      id: `guide:${q.id}`,
      kind: "guide",
      title: q.question,
      text: q.answer,
      sourceIds: hint ? [hint] : [],
      href: hint ? `/sources?source=${hint}` : "/guide",
    });
  }

  for (const s of stories) {
    out.push({
      id: `story:${s.id}`,
      kind: "story",
      title: s.title,
      text: `${s.displayDate} · ${s.location}\n${s.shortDescription}\n${s.description}\nSignificance: ${s.significance}`,
      sourceIds: s.sourceIds,
      href: `/story/${s.id}`,
    });
  }

  for (const e of events) {
    out.push({
      id: `event:${e.id}`,
      kind: "event",
      title: e.title,
      text: `${e.displayDate} · ${e.location}\n${e.description}\nSignificance: ${e.significance}`,
      sourceIds: e.sourceId ? [e.sourceId] : [],
      href: `/sources?event=${e.id}`,
    });
  }

  for (const l of locations) {
    out.push({
      id: `location:${l.id}`,
      kind: "location",
      title: l.name,
      text: `${l.region} — ${l.tagline}\n${l.description}`,
      sourceIds: l.sourceIds,
      href: `/map?loc=${l.id}`,
    });
  }

  for (const s of sources) {
    out.push({
      id: `source:${s.id}`,
      kind: "source",
      title: s.title,
      text: `${s.author} · ${s.year}\n${s.description}`,
      sourceIds: [s.id],
      href: `/sources?source=${s.id}`,
    });
  }

  for (const p of perspectives) {
    out.push({
      id: `perspective:${p.id}`,
      kind: "perspective",
      title: p.role,
      text: `${p.tagline}\n${p.context}`,
      sourceIds: [],
      href: "/perspectives",
    });
  }

  return out;
}

let CORPUS: GuideDoc[] | null = null;

export function getGuideCorpus(): GuideDoc[] {
  return (CORPUS ??= buildCorpus());
}

function scoreDoc(doc: GuideDoc, tokens: string[], raw: string): number {
  const title = doc.title.toLowerCase();
  const text = doc.text.toLowerCase();
  let score = 0;
  if (raw.length >= 3 && title.includes(raw)) score += 8;
  for (const token of tokens) {
    if (title.includes(token)) score += 4;
    if (text.includes(token)) score += 1;
  }
  return score;
}

export function retrieve(query: string, limit = 6): GuideDoc[] {
  const raw = query.trim().toLowerCase();
  if (!raw) return [];
  const tokens = Array.from(new Set(tokenize(raw)));

  return getGuideCorpus()
    .map((doc) => ({ doc, score: scoreDoc(doc, tokens, raw) }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || a.doc.title.localeCompare(b.doc.title))
    .slice(0, limit)
    .map((entry) => entry.doc);
}

const CONTEXT_CHARS = 700;

export function buildContextText(docs: GuideDoc[]): string {
  return docs
    .map((doc, i) => {
      const text = doc.text.length > CONTEXT_CHARS ? `${doc.text.slice(0, CONTEXT_CHARS)}…` : doc.text;
      return `[${i + 1}] id: ${doc.id}\n    title: ${doc.title}\n    text: ${text}`;
    })
    .join("\n\n");
}

function toCitation(doc: GuideDoc): GuideCitation {
  return { id: doc.id, kind: doc.kind, title: doc.title, href: doc.href };
}

export function offlineAnswer(query: string): GuideAnswer {
  const base = askGuide(query);
  return {
    answer: base.answer,
    tags: base.tags,
    followUps: base.followUps,
    citations: retrieve(query, 4).map(toCitation),
    confidence: base.confidence,
    matchedId: base.matchedId,
    mode: "offline",
  };
}

export function validateCitations(ids: string[], provided: GuideDoc[]): GuideCitation[] {
  const providedIds = new Set(provided.map((doc) => doc.id));
  return ids
    .filter((id) => providedIds.has(id))
    .slice(0, 6)
    .map((id) => toCitation(provided.find((doc) => doc.id === id)!));
}