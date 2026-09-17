"use client";

import { useEffect } from "react";
import Link from "next/link";
import {
  Landmark,
  Shield,
  Wheat,
  Scale,
  Hammer,
  House,
  ArrowRight,
  Eye,
  ShieldAlert,
  ScrollText,
  Compass,
  BookOpen,
} from "lucide-react";
import type { PovId, PovRole } from "@/lib/types";
import { useJourney } from "@/lib/store";
import { OrnamentLine } from "@/components/ui/Ornament";
import { cn } from "@/lib/utils";

const ICON_MAP: Record<string, typeof Wheat> = {
  ruler: Landmark,
  soldier: Shield,
  farmer: Wheat,
  merchant: Scale,
  artisan: Hammer,
  commoner: House,
};

interface StoryPovPanelProps {
  storyId: string;
  storyTitle: string;
  povIds: PovId[];
  selectedPov?: PovRole;
  liveHref?: string;
}

export default function StoryPovPanel({
  storyId,
  storyTitle,
  povIds,
  selectedPov,
  liveHref,
}: StoryPovPanelProps) {
  const markEventExplored = useJourney((s) => s.markEventExplored);
  const markPerspectiveExplored = useJourney((s) => s.markPerspectiveExplored);

  useEffect(() => {
    if (!selectedPov) return;
    const t = window.setTimeout(() => {
      markEventExplored(storyId);
      markPerspectiveExplored(selectedPov.id);
    }, 400);
    return () => window.clearTimeout(t);
  }, [selectedPov, storyId, markEventExplored, markPerspectiveExplored]);

  return (
    <div className="parchment parchment-deckle p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-[0.6rem] font-semibold uppercase tracking-[0.28em] text-bronze">
          What was it like?
        </span>
        <span className="text-[0.55rem] uppercase tracking-[0.2em] text-ink-muted">
          stays on this page
        </span>
      </div>

      {!selectedPov ? (
        <div className="mt-5">
          <p className="font-display text-2xl leading-snug text-ink">
            Choose a point of view into this moment.
          </p>
          <p className="mt-2 text-sm leading-relaxed text-ink-muted">
            {storyTitle} was lived differently — a worker&apos;s eyes saw a ruler&apos;s hopes, a
            commoner&apos;s streets saw a soldier&apos;s war.
          </p>
          <div className="mt-5 space-y-2.5">
            {povIds.map((p) => {
              const Icon = ICON_MAP[p] ?? Wheat;
              return (
                <Link
                  key={p}
                  href={`?perspective=${p}`}
                  className="group flex items-center gap-4 border border-ink-soft/25 px-4 py-3 transition-colors hover:border-bronze/60 hover:bg-paper"
                >
                  <span className="flex h-9 w-9 items-center justify-center border border-bronze/50 text-bronze">
                    <Icon className="h-4 w-4" strokeWidth={1.5} />
                  </span>
                  <span className="font-display text-lg capitalize text-ink">{p}</span>
                  <span className="ml-auto text-[0.6rem] uppercase tracking-[0.2em] text-ink-muted opacity-0 transition-opacity group-hover:opacity-100">
                    View →
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="mt-5">
          <div className="relative border border-bronze/40 bg-ink/95 p-5">
            <span className="absolute right-3 top-3 rotate-6 border border-paper/40 px-2 py-1 text-[0.5rem] font-semibold uppercase tracking-[0.2em] text-paper/50">
              Fictional reconstruction
            </span>
            <span className="flex items-center gap-2 text-[0.6rem] font-semibold uppercase tracking-[0.28em] text-bronze">
              <span className="flex h-8 w-8 items-center justify-center border border-bronze/60">
                {(() => {
                  const Icon = ICON_MAP[selectedPov.id] ?? Wheat;
                  return <Icon className="h-4 w-4" strokeWidth={1.5} />;
                })()}
              </span>
              You are
            </span>
            <h3 className="font-display mt-3 text-3xl font-semibold text-paper">
              {selectedPov.role}
            </h3>
            <p className="mt-1 text-xs italic text-bronze">{selectedPov.tagline}</p>
          </div>

          <div className="mt-5 space-y-5 text-sm leading-relaxed text-ink-muted">
            <p className="drop-cap">{selectedPov.experience}</p>

            <div>
              <p className="flex items-center gap-1.5 text-[0.6rem] font-semibold uppercase tracking-[0.22em] text-ink">
                <Eye className="h-3.5 w-3.5 text-bronze" strokeWidth={1.8} /> What you see
              </p>
              <p className="mt-1.5">{selectedPov.sees}</p>
            </div>

            <div>
              <p className="flex items-center gap-1.5 text-[0.6rem] font-semibold uppercase tracking-[0.22em] text-ink">
                <ScrollText className="h-3.5 w-3.5 text-bronze" strokeWidth={1.8} /> What you know
              </p>
              <ul className="mt-1.5 space-y-1.5">
                {selectedPov.knows.map((k, i) => (
                  <li key={i} className="flex gap-2.5">
                    <span className="mt-2 h-1 w-3 shrink-0 bg-bronze/70" />
                    {k}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="flex items-center gap-1.5 text-[0.6rem] font-semibold uppercase tracking-[0.22em] text-ink">
                <ShieldAlert className="h-3.5 w-3.5 text-bronze" strokeWidth={1.8} /> Concerns
              </p>
              <ul className="mt-1.5 space-y-1.5">
                {selectedPov.concerns.map((c, i) => (
                  <li key={i} className="flex gap-2.5">
                    <span className="mt-2 h-1 w-3 shrink-0 bg-bronze/70" />
                    {c}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="flex items-center gap-1.5 text-[0.6rem] font-semibold uppercase tracking-[0.22em] text-ink">
                <Compass className="h-3.5 w-3.5 text-bronze" strokeWidth={1.8} /> Documented context
              </p>
              <p className="mt-1.5">{selectedPov.context}</p>
            </div>
          </div>

          {liveHref ? (
            <div className="mt-6">
              <OrnamentLine className="!mb-4" />
              <Link
                href={liveHref}
                className="inline-flex w-full items-center justify-center gap-2 border border-ink bg-ink px-5 py-3 text-[0.66rem] font-semibold uppercase tracking-[0.22em] text-paper transition-colors hover:bg-ink-soft"
              >
                <BookOpen className="h-4 w-4" strokeWidth={1.5} />
                Live this moment
                <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
              </Link>
            </div>
          ) : null}

          <div className="mt-4 flex flex-wrap gap-2">
            {povIds.map((p) => (
              <Link
                key={p}
                href={`?perspective=${p}`}
                className={cn(
                  "border px-2.5 py-1 text-[0.58rem] uppercase tracking-[0.16em] transition-colors",
                  p === selectedPov.id
                    ? "border-bronze/60 bg-bronze/10 text-bronze"
                    : "border-ink-soft/40 text-ink-soft hover:border-bronze/60 hover:text-bronze"
                )}
              >
                {p}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}