import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  retrieve,
  buildContextText,
  offlineAnswer,
  validateCitations,
} from "@/lib/guide-retrieval";
import type { GuideAnswer } from "@/lib/guide-engine";

export const runtime = "nodejs";

const VALID_TAGS = ["Documented fact", "Interpretation", "Fictional reconstruction"] as const;

const SYSTEM_INSTRUCTIONS = `You are the Historical Guide for Histora, an interactive historical atlas. You answer ONLY from the provided CONTEXT records, which are curated entries from the archive's local dataset.

Rules:
- NEVER invent facts, sources, citations, names, dates, or links outside the CONTEXT records.
- If the CONTEXT records do not establish an answer to the user's question, say so plainly and point to what the archive does cover. Do not fall back on general knowledge.
- Preserve the archive's distinction between documented fact, interpretation, and clearly-labelled fictional reconstruction.
- Answer concisely (2-5 sentences) in a clear, archival voice.

Respond with JSON only, in this exact shape:
{"answer": string, "supported": boolean, "citations": string[], "tags": ["Documented fact"|"Interpretation"|"Fictional reconstruction"], "confidence": number, "followUps": string[]}
- "citations": a list of ids drawn ONLY from the CONTEXT records you actually relied on; an empty array if none.
- "supported": true only if your answer rests on the CONTEXT records.
- "confidence": a number from 0 to 1.
- "followUps": up to 3 short questions the visitor could ask next.`;

function parseJson(raw: string): Record<string, unknown> | null {
  const trimmed = raw
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "");
  try {
    const value = JSON.parse(trimmed);
    return typeof value === "object" && value !== null
      ? (value as Record<string, unknown>)
      : null;
  } catch {
    return null;
  }
}

function normalizeTags(tags: unknown): GuideAnswer["tags"] {
  const valid = Array.isArray(tags)
    ? tags.filter((t): t is (typeof VALID_TAGS)[number] =>
        VALID_TAGS.includes(t as (typeof VALID_TAGS)[number])
      )
    : [];
  return valid.length ? valid : ["Interpretation"];
}

function normalizeStrings(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((v): v is string => typeof v === "string" && Boolean(v.trim())).map((s) => s.trim())
    : [];
}

export async function POST(request: Request) {
  let query = "";
  try {
    const body = await request.json();
    query = typeof body?.query === "string" ? body.query.trim() : "";
  } catch {
    // ignore malformed JSON; handled below
  }

  if (!query) {
    return NextResponse.json(
      { error: "A non-empty 'query' string is required." },
      { status: 400 }
    );
  }
  if (query.length > 300) {
    query = query.slice(0, 300);
  }

  const docs = retrieve(query, 6);

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || docs.length === 0) {
    return NextResponse.json(offlineAnswer(query));
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: process.env.GEMINI_MODEL ?? "gemini-2.0-flash",
    });

    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `${SYSTEM_INSTRUCTIONS}\n\nCONTEXT RECORDS:\n${buildContextText(
                docs
              )}\n\nVISITOR QUESTION:\n${query}`,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.2,
        responseMimeType: "application/json",
      },
    });

    const raw = result.response.text();
    const parsed = parseJson(raw);

    if (!parsed) {
      return NextResponse.json(offlineAnswer(query));
    }

    const fallback = offlineAnswer(query);
    const answer =
      typeof parsed.answer === "string" && parsed.answer.trim()
        ? parsed.answer.trim()
        : fallback.answer;

    const citations = validateCitations(
      normalizeStrings(parsed.citations),
      docs
    );

    const confidence =
      typeof parsed.confidence === "number"
        ? Math.max(0, Math.min(1, parsed.confidence))
        : fallback.confidence;

    const supported =
      typeof parsed.supported === "boolean"
        ? parsed.supported
        : citations.length > 0;

    return NextResponse.json(
      {
        answer: supported
          ? answer
          : `${answer}\n\nThe archive's records do not establish more than this; the citations above are the exact entries consulted.`,
        tags: normalizeTags(parsed.tags),
        followUps: normalizeStrings(parsed.followUps).slice(0, 3),
        citations,
        confidence,
        matchedId: citations[0]?.id ?? fallback.matchedId,
        mode: "llm",
      } satisfies GuideAnswer
    );
  } catch (error) {
    console.error("[guide] Gemini generation failed, falling back offline:", error);
    return NextResponse.json(offlineAnswer(query));
  }
}