"use client";

import { useState } from "react";
import Link from "next/link";
import { Lock, ArrowRight, MapPin, Clock3, BookOpen } from "lucide-react";
import type { Region, Era, Story, Period, Mode } from "@/lib/types";
import { cn } from "@/lib/utils";
import { OrnamentLine } from "@/components/ui/Ornament";
import { Tag } from "@/components/ui/Chip";
import EvidenceStamp from "@/components/story/EvidenceStamp";

const MODE_LABEL: Record<Mode, string> = {
  state: "STATE",
  national: "NATIONAL",
  international: "INTERNATIONAL",
};

interface AtlasExplorerProps {
  regions: Region[];
  eras: Era[];
  periods: Period[];
  stories: Story[];
}

export default function AtlasExplorer({ regions, eras, periods, stories }: AtlasExplorerProps) {
  const [mode, setMode] = useState<Mode>("state");
  const [regionId, setRegionId] = useState<string>(regions.find((r) => r.available)?.id ?? "maharashtra");
  const [eraId, setEraId] = useState<string>(
    eras.find((e) => e.subjectPeriodId)?.id ?? "early-modern"
  );

  const selectedRegion = regions.find((r) => r.id === regionId);
  const selectedEra = eras.find((e) => e.id === eraId);
  const period = selectedEra?.subjectPeriodId
    ? periods.find((p) => p.id === selectedEra.subjectPeriodId)
    : undefined;
  const periodStories = period ? stories.filter((s) => s.periodId === period.id) : [];
  const lockedMode = mode !== "state";

  return (
    <div>
      <section>
        <span className="text-[0.6rem] font-semibold uppercase tracking-[0.3em] text-bronze">
          Step 1 — Region
        </span>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {regions.map((r) => {
            const active = r.available && r.id === regionId;
            return (
              <button
                key={r.id}
                type="button"
                disabled={!r.available}
                onClick={() => setRegionId(r.id)}
                className={cn(
                  "group border p-5 text-left transition-all",
                  active
                    ? "border-bronze bg-ink text-paper shadow-paper-lg"
                    : r.available
                      ? "parchment hover:-translate-y-0.5 hover:shadow-paper-lg"
                      : "cursor-not-allowed border-ink-soft/20 bg-paper/40 opacity-70"
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <h3
                    className={cn(
                      "font-display text-2xl font-semibold",
                      active ? "text-paper" : "text-ink"
                    )}
                  >
                    {r.name}
                  </h3>
                  {!r.available ? (
                    <Lock className="h-4 w-4 shrink-0 text-ink-faint" strokeWidth={1.5} />
                  ) : null}
                </div>
                <p className="mt-0.5 text-[0.6rem] uppercase tracking-[0.18em] text-bronze">
                  {r.region}
                </p>
                <p
                  className={cn(
                    "mt-3 text-xs leading-relaxed",
                    active ? "text-paper/65" : "text-ink-muted"
                  )}
                >
                  {r.available ? r.note : r.note}
                </p>
              </button>
            );
          })}
        </div>
      </section>

      <section className="mt-12">
        <span className="text-[0.6rem] font-semibold uppercase tracking-[0.3em] text-bronze">
          Step 2 — Scope
        </span>
        <div className="mt-4 flex flex-wrap gap-2">
          {(Object.keys(MODE_LABEL) as Mode[]).map((m) => {
            const active = m === mode;
            const locked = m !== "state";
            return (
              <button
                key={m}
                type="button"
                disabled={locked}
                onClick={() => setMode(m)}
                className={cn(
                  "flex items-center gap-2 border px-5 py-2.5 text-[0.66rem] font-semibold uppercase tracking-[0.22em] transition-colors",
                  active
                    ? "border-ink bg-ink text-paper"
                    : locked
                      ? "cursor-not-allowed border-ink-soft/20 text-ink-muted opacity-60"
                      : "border-ink-soft/30 text-ink-soft hover:border-bronze hover:text-bronze"
                )}
              >
                {MODE_LABEL[m]}
                {locked ? (
                  <span className="text-[0.55rem] uppercase tracking-[0.12em] text-ink-faint">
                    coming soon
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </section>

      <section className="mt-12">
        <span className="text-[0.6rem] font-semibold uppercase tracking-[0.3em] text-bronze">
          Step 3 — Era
        </span>
        <div className="mt-4 flex flex-wrap gap-2">
          {eras.map((e) => {
            const active = e.id === eraId;
            const locked = !e.subjectPeriodId;
            return (
              <button
                key={e.id}
                type="button"
                disabled={locked}
                onClick={() => setEraId(e.id)}
                className={cn(
                  "group flex flex-col border px-5 py-3 text-left transition-colors",
                  active
                    ? "border-bronze bg-bronze/10"
                    : locked
                      ? "cursor-not-allowed border-ink-soft/20 opacity-60"
                      : "border-ink-soft/30 hover:border-bronze"
                )}
              >
                <span
                  className={cn(
                    "text-[0.68rem] font-semibold uppercase tracking-[0.24em]",
                    active ? "text-bronze" : locked ? "text-ink-faint" : "text-ink-soft"
                  )}
                >
                  {e.label}
                </span>
                {locked ? (
                  <span className="mt-0.5 text-[0.55rem] uppercase tracking-[0.14em] text-ink-faint">
                    coming soon
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </section>

      {period && !lockedMode ? (
        <>
          <section className="mt-12 border border-bronze/40 bg-ink p-7 text-paper sm:p-9">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-[0.6rem] font-semibold uppercase tracking-[0.3em] text-bronze">
                  {selectedRegion?.name} · {selectedEra?.label} · {period.century}
                </span>
                <h2 className="font-display mt-2 text-3xl font-semibold leading-tight sm:text-4xl">
                  {period.title}
                </h2>
                <p className="font-display mt-1.5 text-base italic text-bronze">
                  {period.subjectName}
                </p>
                <p className="mt-3 max-w-3xl text-sm leading-relaxed text-paper/70">
                  {period.subjectDescription ?? period.description}
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <Link
                  href="/timeline"
                  className="inline-flex items-center gap-2 border border-bronze px-5 py-2.5 text-[0.66rem] font-semibold uppercase tracking-[0.22em] text-bronze transition-colors hover:bg-bronze hover:text-paper"
                >
                  <Clock3 className="h-3.5 w-3.5" strokeWidth={1.5} />
                  Timeline
                </Link>
                <Link
                  href="/map"
                  className="inline-flex items-center gap-2 border border-paper/40 px-5 py-2.5 text-[0.66rem] font-semibold uppercase tracking-[0.22em] text-paper transition-colors hover:bg-paper/10"
                >
                  <MapPin className="h-3.5 w-3.5" strokeWidth={1.5} />
                  Map
                </Link>
              </div>
            </div>
          </section>

          <section className="mt-12">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <span className="text-[0.6rem] font-semibold uppercase tracking-[0.3em] text-bronze">
                  The stories
                </span>
                <h2 className="font-display mt-1 text-3xl font-medium text-ink sm:text-4xl">
                  {periodStories.length} opening onto {period.subjectName}
                </h2>
              </div>
              <p className="max-w-xs text-xs leading-relaxed text-ink-muted">
                Each story pairs a documented event with a place, the evidence behind it, and the
                lives that experienced it.
              </p>
            </div>

            <OrnamentLine className="mt-6" />

            <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {periodStories.map((s) => (
                <Link
                  key={s.id}
                  href={`/story/${s.id}`}
                  className="parchment group flex flex-col p-6 transition-transform duration-300 hover:-translate-y-1 hover:shadow-paper-lg"
                >
                  <div className="flex items-start justify-between gap-3">
                    <Tag>{s.category}</Tag>
                    <span className="text-[0.55rem] uppercase tracking-[0.2em] text-ink-faint">
                      story
                    </span>
                  </div>
                  <span className="mt-4 text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-bronze">
                    {s.displayDate}
                  </span>
                  <h3 className="font-display mt-1.5 text-2xl font-semibold leading-snug text-ink transition-colors group-hover:text-bronze">
                    {s.title}
                  </h3>
                  <p className="mt-1 text-xs uppercase tracking-[0.16em] text-ink-muted">
                    {s.location}
                  </p>
                  <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-ink-muted">
                    {s.shortDescription}
                  </p>
                  <div className="mt-auto flex items-center justify-between gap-3 pt-6">
                    <EvidenceStamp evidence={s.evidence} />
                    <span className="inline-flex items-center gap-1.5 text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-bronze">
                      <BookOpen className="h-3.5 w-3.5" strokeWidth={1.5} />
                      Open story
                      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" strokeWidth={1.5} />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </>
      ) : (
        <section className="mt-12 border border-ink-soft/25 p-10 text-center">
          <p className="font-display text-xl italic text-ink">
            {lockedMode
              ? "National and international modes are not open yet."
              : "That era is not open yet."}
          </p>
          <p className="mt-2 text-sm text-ink-muted">
            The atlas grows one region at a time. Choose an era marked open, or return to a
            region that is ready.
          </p>
        </section>
      )}
    </div>
  );
}