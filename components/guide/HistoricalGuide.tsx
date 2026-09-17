"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import Link from "next/link";
import { askGuide, guideSourceHint, type GuideResponse } from "@/lib/guide-engine";
import { getSource } from "@/lib/data";
import type { GuideQA } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Send, Sparkles, Landmark, Quote, CornerDownRight } from "lucide-react";

type Role = "user" | "guide";

interface Message {
  id: string;
  role: Role;
  text: string;
  tags?: GuideQA["tags"];
  followUps?: string[];
  sourceId?: string;
  confidence?: number;
  matchedQuestion?: string;
}

function TagPills({ tags }: { tags: GuideQA["tags"] }) {
  return (
    <div className="mt-2.5 flex flex-wrap gap-1.5">
      {tags.map((t) => (
        <span
          key={t}
          className={cn(
            "border px-1.5 py-0.5 text-[0.55rem] font-semibold uppercase tracking-[0.16em]",
            t === "Documented fact" && "border-bronze/50 text-bronze",
            t === "Interpretation" && "border-ink-soft/40 text-ink-soft",
            t === "Fictional reconstruction" && "border-ink/40 text-ink"
          )}
        >
          {t}
        </span>
      ))}
    </div>
  );
}

function Certainty({ confidence }: { confidence: number }) {
  const level =
    confidence >= 0.7 ? "High" : confidence >= 0.4 ? "Medium" : "Low";
  return (
    <span className="inline-flex items-center gap-1.5 text-[0.55rem] font-semibold uppercase tracking-[0.16em] text-ink-muted">
      Certainty: {level}
      <span className="inline-flex gap-0.5">
        {[1, 2, 3].map((i) => (
          <span
            key={i}
            className={cn(
              "h-1.5 w-3",
              (level === "High" && i === 1) || (level === "Medium" && i <= 2) || (level === "Low" && i === 1)
                ? "bg-bronze"
                : i === 1 && level === "Low"
                  ? "bg-bronze"
                  : "bg-ink-soft/25"
            )}
          />
        ))}
      </span>
    </span>
  );
}

interface HistoricalGuideProps {
  starters: { question: string }[];
}

export default function HistoricalGuide({ starters }: HistoricalGuideProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "guide",
      text: "Welcome to the Historical Guide. Ask me anything about India 1857 — events, places, people, or what changed afterwards. I'm a research companion trained on the sources held in this archive.",
      tags: ["Interpretation"],
    },
  ]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const endRef = useRef<HTMLDivElement | null>(null);
  const idRef = useRef(1);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, thinking]);

  async function ask(text: string) {
    const trimmed = text.trim();
    if (!trimmed || thinking) return;

    setMessages((m) => [
      ...m,
      { id: `u-${idRef.current++}`, role: "user", text: trimmed },
    ]);
    setInput("");
    setThinking(true);

    await new Promise((r) => setTimeout(r, 650));

    const response: GuideResponse = await Promise.resolve(askGuide(trimmed));
    const sourceId = guideSourceHint(response.matchedId);

    setMessages((m) => [
      ...m,
      {
        id: `g-${idRef.current++}`,
        role: "guide",
        text: response.answer,
        tags: response.tags,
        followUps: response.followUps.slice(0, 3),
        sourceId,
        confidence: response.confidence,
        matchedQuestion: response.matchedQuestion,
      },
    ]);
    setThinking(false);
  }

  return (
    <div className="overflow-hidden border border-ink-soft/30 bg-paper shadow-paper">
      <div className="border-b border-ink-soft/20 bg-ink px-6 py-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="flex items-center gap-2.5 font-display text-2xl font-semibold text-paper">
              <Sparkles className="h-5 w-5 text-bronze" strokeWidth={1.5} />
              The Historical Guide
            </h2>
            <p className="mt-1 text-xs leading-relaxed text-paper/70">
              A simulated research companion that answers from this archive&rsquo;s curated
              dataset and flags how certain each answer is.
            </p>
          </div>
          <span className="hidden shrink-0 text-[0.58rem] uppercase tracking-[0.2em] text-paper/50 sm:block">
            always cites its limits
          </span>
        </div>
      </div>

      <div className="max-h-[28rem] space-y-6 overflow-y-auto px-6 py-7">
        {messages.map((msg) =>
          msg.role === "user" ? (
            <div key={msg.id} className="flex justify-end">
              <div className="max-w-[80%] rounded border border-bronze/50 bg-parchment px-4 py-3">
                <p className="text-sm leading-relaxed text-ink">{msg.text}</p>
              </div>
            </div>
          ) : (
            <div key={msg.id} className="flex justify-start">
              <div className="max-w-[85%]">
                <div className="flex items-start gap-3">
                  <span className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center border border-bronze/60 text-bronze">
                    <Landmark className="h-3.5 w-3.5" strokeWidth={1.5} />
                  </span>
                  <div className="border-l-2 border-bronze/50 bg-paper/60 px-4 py-3">
                    {msg.matchedQuestion && msg.matchedQuestion !== "No entry in the archive" ? (
                      <p className="mb-1.5 text-[0.6rem] font-semibold uppercase tracking-[0.18em] text-ink-muted">
                        {msg.matchedQuestion}
                      </p>
                    ) : null}
                    <p className="text-sm leading-relaxed text-ink-soft">{msg.text}</p>

                    {msg.tags && msg.tags.length ? <TagPills tags={msg.tags} /> : null}

                    {typeof msg.confidence === "number" ? (
                      <div className="mt-2.5">
                        <Certainty confidence={msg.confidence} />
                      </div>
                    ) : null}

                    {msg.sourceId ? (
                      <Supplement sourceId={msg.sourceId} />
                    ) : null}

                    {msg.followUps && msg.followUps.length ? (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {msg.followUps.map((f) => (
                          <button
                            key={f}
                            type="button"
                            onClick={() => ask(f)}
                            className="flex items-center gap-1.5 border border-ink-soft/25 px-2.5 py-1 text-[0.66rem] text-ink-soft transition-colors hover:border-bronze hover:text-bronze"
                          >
                            <CornerDownRight className="h-3 w-3" strokeWidth={1.5} />
                            {f}
                          </button>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          )
        )}

        {thinking ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
            <span className="flex items-center gap-2 border-l-2 border-bronze/40 bg-paper/60 px-4 py-2.5 text-[0.66rem] italic text-ink-muted">
              <span className="inline-block h-3 w-3 animate-spin rounded-full border border-bronze border-t-transparent" />
              Consulting the archive...
            </span>
          </motion.div>
        ) : null}

        {messages.length === 1 && !thinking ? (
          <div>
            <p className="text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-ink-muted">
              Try asking
            </p>
            <div className="mt-2.5 flex flex-wrap gap-2">
              {starters.map((s) => (
                <button
                  key={s.question}
                  type="button"
                  onClick={() => ask(s.question)}
                  className="border border-ink-soft/25 px-3 py-1.5 text-[0.7rem] text-ink-soft transition-colors hover:border-bronze hover:text-bronze"
                >
                  {s.question}
                </button>
              ))}
            </div>
          </div>
        ) : null}
        <div ref={endRef} />
      </div>

      <div className="border-t border-ink-soft/20 bg-parchment px-6 py-4">
        <form
          className="flex items-center gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            ask(input);
          }}
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about 1857, e.g. Was it a national revolt?"
            className="min-w-0 flex-1 border border-ink-soft/30 bg-paper px-4 py-3 text-sm text-ink placeholder:text-ink-muted focus:border-bronze focus:outline-none"
            aria-label="Ask the Historical Guide"
          />
          <button
            type="submit"
            disabled={!input.trim() || thinking}
            className="btn-archive px-5 py-3 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Send className="h-4 w-4" strokeWidth={1.5} />
            <span className="sr-only sm:not-sr-only sm:ml-2">Ask</span>
          </button>
        </form>
        <p className="mt-2.5 text-[0.64rem] italic leading-relaxed text-ink-muted">
          The Guide answers from this archive&rsquo;s curated dataset.
          <AnimatePresence>
            <DisclaimerToggle />
          </AnimatePresence>
        </p>
      </div>
    </div>
  );
}

function Supplement({ sourceId }: { sourceId: string }) {
  const source = getSource(sourceId);
  if (!source) return null;
  return (
    <div className="mt-3 flex items-center gap-2 border-t border-ink-soft/15 pt-2.5">
      <Quote className="h-3.5 w-3.5 shrink-0 text-bronze" strokeWidth={1.5} />
      <p className="text-[0.7rem] leading-relaxed text-ink-muted">
        Related source:{" "}
        <Link
          href={`/sources?source=${source.id}`}
          className="historical-link text-bronze hover:text-ink-soft"
        >
          {source.title}
        </Link>{" "}
        — {source.author} ({source.year})
      </p>
    </div>
  );
}

function DisclaimerToggle() {
  return (
    <span className="block">
      For a production version, this simulated engine can be replaced by a verified AI
      assistant whose answers point to the same sources.
    </span>
  );
}