"use client";

import Link from "next/link";
import { useJourney } from "@/lib/store";
import { getStories, getPerspectives } from "@/lib/data";
import { BookOpen, ScrollText, UserRound, Compass } from "lucide-react";
import { cn } from "@/lib/utils";

const ACTIVE_PERIOD_ID = "maharashtra-17th-century";

export default function JourneyPanel({ compact = false }: { compact?: boolean }) {
  const { exploredEvents, exploredPerspectives, playthroughs, timelineRead } = useJourney();

  const stories = getStories(ACTIVE_PERIOD_ID);
  const perspectiveCount = getPerspectives().length;
  const momentsExplored = Array.from(
    new Set([...exploredEvents, ...(timelineRead ? stories.map((s) => s.id) : [])])
  ).length;
  const momentsPercent = Math.round((momentsExplored / Math.max(1, stories.length)) * 100);
  const perspectivesCount = Array.from(
    new Set([...exploredPerspectives, ...playthroughs.map((p) => p.perspectiveId)])
  ).length;

  const stats = [
    { icon: ScrollText, label: "Moments explored", value: String(momentsExplored) },
    { icon: UserRound, label: "Perspectives", value: `${perspectivesCount} / ${perspectiveCount}` },
    { icon: Compass, label: "Atlas", value: `${momentsPercent}%` },
    { icon: BookOpen, label: "Scenarios completed", value: String(playthroughs.length) },
  ];

  return (
    <div className={cn("parchment parchment-deckle p-6", compact && "p-5")}>
      <div className="flex items-center justify-between">
        <h3 className="font-display text-xl font-semibold text-ink">Your Journey</h3>
        <span className="text-[0.58rem] uppercase tracking-[0.26em] text-ink-muted">
          The archive remembers
        </span>
      </div>

      <div className={cn("mt-5 grid grid-cols-2 gap-4", !compact && "sm:grid-cols-4")}>
        {stats.map((s) => (
          <div key={s.label} className="border-l-2 border-bronze/50 pl-3">
            <s.icon className="h-4 w-4 text-bronze" strokeWidth={1.5} />
            <div className="mt-1.5 font-display text-2xl font-semibold text-ink">{s.value}</div>
            <div className="text-[0.58rem] uppercase tracking-[0.14em] text-ink-muted">
              {s.label}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 h-px w-full bg-ink-soft/20" />

      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
        <Link href="/timeline" className="historical-link text-[0.66rem] uppercase tracking-[0.2em] text-bronze hover:text-ink-soft">
          Continue the timeline
        </Link>
        <Link href="/live" className="historical-link text-[0.66rem] uppercase tracking-[0.2em] text-bronze hover:text-ink-soft">
          Live through history
        </Link>
      </div>
    </div>
  );
}