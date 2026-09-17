import { guideQA, getSources } from "@/lib/data";
import type { GuideQA } from "@/lib/types";

export interface GuideResponse {
  answer: string;
  tags: GuideQA["tags"];
  followUps: string[];
  matchedQuestion: string;
  matchedId: string;
  confidence: number;
}

const QUIET_WORDS = new Set([
  "the", "a", "an", "of", "to", "in", "on", "for", "and", "or", "but",
  "was", "were", "is", "are", "did", "do", "what", "how", "why", "when",
  "who", "where", "can", "you", "tell", "me", "about", "please", "i",
  "my", "it", "its", "that", "this", "there", "they", "them", "their",
  "would", "could", "should", "has", "have", "had", "with", "from",
]);

export function tokenize(query: string): string[] {
  return query
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 1 && !QUIET_WORDS.has(w));
}

function score(qa: GuideQA, tokens: string[], raw: string): number {
  const lowered = raw.toLowerCase();
  let score = 0;
  for (const kw of qa.keywords) {
    const k = kw.toLowerCase();
    if (k.length >= 3 && lowered.includes(k)) {
      score += k.length >= 7 ? 3 : 2;
    }
  }
  for (const tok of tokens) {
    if (qa.keywords.some((k) => k.includes(tok) && tok.length >= 3)) {
      score += 1;
    }
  }
  return score;
}

/**
 * `askGuide` is the single entry point for the Historical Guide.
 *
 * It currently runs on a local keyword engine over the curated dataset in
 * data/guide.json. To connect a real LLM (Gemini / OpenAI / etc.) later,
 * replace the body of this function with an async fetch to your API route —
 * the rest of the UI only depends on the shape of `GuideResponse`.
 */
export function askGuide(rawQuery: string): GuideResponse {
  const query = rawQuery.trim();
  const tokens = tokenize(query);

  let best: GuideQA | null = null;
  let bestScore = 0;
  for (const qa of guideQA) {
    const s = score(qa, tokens, query);
    if (s > bestScore) {
      best = qa;
      bestScore = s;
    }
  }

  if (!best || bestScore === 0) {
    const curated = guideQA.slice(0, 6);
    return {
      answer:
        "I could not find a confident match in the archive for that question. Try one of the questions below, or ask about Swarajya, Shivaji, the forts, the coronation at Raigad, or the upheaval of 1857.",
      tags: ["Interpretation"],
      followUps: curated.map((q) => q.question),
      matchedQuestion: "No entry in the archive",
      matchedId: "no-match",
      confidence: 0,
    };
  }

  const confidence = Math.min(0.98, bestScore / 6);

  const answer =
    best.tags.includes("Documented fact") && !best.tags.includes("Fictional reconstruction")
      ? `${best.answer}`
      : best.answer;

  return {
    answer,
    tags: best.tags,
    followUps: best.followUp,
    matchedQuestion: best.question,
    matchedId: best.id,
    confidence,
  };
}

export function guideSourceHint(matchedId: string): string | undefined {
  const direct: Record<string, string> = {
    "maharashtra-shivaji": "sg-sabhasad",
    "maharashtra-17th": "sg-sabhasad",
    "maharashtra-swarajya": "sg-sarkar",
    "maharashtra-pratapgad": "sg-afzalkhan",
    "maharashtra-coronation": "sg-coronation",
    "maharashtra-sources": "sg-sarkar",
  };
  if (direct[matchedId]) return direct[matchedId];

  const sourceHints: Record<string, string> = {
    "cartridges": "The Last Mughal",
    "mangal-pandey": "The History of the Indian Mutiny (Ball)",
    "delhi-importance": "The Last Mughal",
    "farmers-life": "Mutiny at the Margins",
    "what-changed": "Queen Victoria's Proclamation",
    "groups-involved": "Mutiny at the Margins",
    "rani-jhansi": "Work on Jhansi records (see Sources hub)",
  };
  const hint = sourceHints[matchedId];
  if (!hint) return undefined;
  const source = getSources().find((s) => s.title.includes(hint) || s.author.includes(hint));
  return source?.id;
}