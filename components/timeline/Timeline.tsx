"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "motion/react";
import { MapPin, CalendarDays, Quote, ArrowRight, Landmark } from "lucide-react";
import type { TimelineItem } from "@/lib/types";
import { useJourney } from "@/lib/store";
import { getSource, getEventSources, getEvent } from "@/lib/data";
import { cn } from "@/lib/utils";
import Modal from "@/components/ui/Modal";
import { Chip } from "@/components/ui/Chip";
import ArchiveButton from "@/components/ui/ArchiveButton";
import { OrnamentLine } from "@/components/ui/Ornament";

const CATEGORY_LABEL: Record<string, string> = {
  tension: "Tension",
  uprising: "Uprising",
  response: "Response",
  aftermath: "Aftermath",
  context: "Context",
  birth: "Birth",
  rise: "Rise",
  fort: "Fort",
  battle: "Battle",
  siege: "Siege",
  escape: "Escape",
  campaign: "Campaign",
  coronation: "Coronation",
  recovery: "Recovery",
};

export interface TimelineGroup {
  id: string;
  label: string;
  sublabel: string;
  items: TimelineItem[];
}

interface TimelineProps {
  groups: TimelineGroup[];
  initialGroupId?: string;
  initialItemId?: string;
}

export default function Timeline({ groups, initialGroupId, initialItemId }: TimelineProps) {
  const router = useRouter();
  const [groupIndex, setGroupIndex] = useState(() => {
    const idx = groups.findIndex((g) => g.id === initialGroupId);
    return idx >= 0 ? idx : 0;
  });
  const [activeId, setActiveId] = useState<string | null>(() => initialItemId ?? null);
  const markEventExplored = useJourney((s) => s.markEventExplored);
  const setTimelineRead = useJourney((s) => s.setTimelineRead);

  const group = groups[groupIndex];
  const items = group?.items ?? [];

  useEffect(() => {
    setTimelineRead(true);
  }, [setTimelineRead]);

  const activeItem = items.find((i) => i.id === activeId) ?? null;
  const activeEvent = activeItem && activeItem.kind === "event" ? getEvent(activeItem.id) : undefined;

  const openEvent = (id: string) => {
    setActiveId(id);
    markEventExplored(id);
    router.replace(`/timeline?event=${id}`, { scroll: false });
  };

  const closeEvent = () => {
    setActiveId(null);
    router.replace("/timeline", { scroll: false });
  };

  const sourceRef = activeEvent ? getSource(activeEvent.sourceId) : undefined;
  const sourceList = activeEvent ? getEventSources(activeEvent.id) : [];

  return (
    <div>
      <div className="mb-12 flex flex-wrap items-center justify-center gap-3">
        {groups.map((g, i) => (
          <button
            key={g.id}
            type="button"
            onClick={() => setGroupIndex(i)}
            className={cn(
              "border px-5 py-2.5 text-left transition-colors",
              i === groupIndex
                ? "border-ink bg-ink text-paper"
                : "border-ink-soft/30 text-ink-soft hover:border-bronze hover:text-bronze"
            )}
          >
            <span className="block text-[0.64rem] font-semibold uppercase tracking-[0.2em]">
              {g.label}
            </span>
            <span
              className={cn(
                "mt-0.5 block text-[0.55rem] uppercase tracking-[0.16em]",
                i === groupIndex ? "text-paper/60" : "text-ink-muted"
              )}
            >
              {g.sublabel}
            </span>
          </button>
        ))}
      </div>

      <div className="relative">
        <div
          className="absolute bottom-0 left-[1.05rem] top-0 w-px md:left-1/2"
          style={{
            backgroundImage:
              "linear-gradient(to bottom, transparent, rgba(92,64,51,0.5) 30px, rgba(92,64,51,0.5) calc(100% - 30px), transparent)",
          }}
        />

        <ol className="space-y-10">
          {items.map((item, i) => {
            const ruleLabel = CATEGORY_LABEL[item.category] ?? "Record";
            const left = i % 2 === 0;
            const isStory = item.kind === "story";

            const cardInner = (
              <div className="parchment group block w-full p-6 text-left transition-transform duration-300 hover:-translate-y-1 hover:shadow-paper-lg">
                <div className={cn(left ? "flex justify-end" : "")}>
                  <span className="pointer-events-none text-[0.55rem] uppercase tracking-[0.24em] text-ink-faint">
                    {isStory ? "story" : "record"} {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                <h3 className="font-display mt-2 text-2xl font-semibold text-ink transition-colors group-hover:text-bronze">
                  {item.title}
                </h3>
                <p className="mt-1.5 text-xs uppercase tracking-[0.16em] text-ink-muted">
                  {item.location}
                </p>
                <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-ink-muted">
                  {item.description}
                </p>
                <span className="mt-4 inline-flex items-center gap-2 text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-bronze">
                  {isStory ? "Open the story" : "Open the record"}
                  <ArrowRight
                    className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1"
                    strokeWidth={1.5}
                  />
                </span>
              </div>
            );

            return (
              <li
                key={item.id}
                className="relative grid gap-4 pl-10 md:grid-cols-2 md:gap-8 md:pl-0 md:pt-2"
              >
                <span
                  className="absolute left-[0.6rem] top-3 z-10 h-2.5 w-2.5 rotate-45 border border-paper bg-bronze shadow-sm md:left-1/2 md:-translate-x-1/2"
                  aria-hidden="true"
                />

                <motion.div
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.5 }}
                  className={cn(
                    "md:pr-10",
                    left ? "md:col-start-1 md:text-right" : "md:col-start-2 md:pl-10 md:text-left"
                  )}
                >
                  <div className={cn(left ? "md:flex md:flex-col md:items-end" : "")}>
                    <span className="text-[0.62rem] font-semibold uppercase tracking-[0.24em] text-bronze">
                      {item.displayDate}
                    </span>
                    <span className="mt-1 block text-[0.58rem] uppercase tracking-[0.2em] text-ink-muted">
                      {ruleLabel}
                    </span>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.5, delay: 0.08 }}
                  className={cn(
                    left ? "md:col-start-2 md:pl-10" : "md:col-start-1 md:pr-10 md:text-left"
                  )}
                >
                  {isStory ? (
                    <Link
                      href={item.href}
                      onClick={() => markEventExplored(item.id)}
                      className="block"
                    >
                      {cardInner}
                    </Link>
                  ) : (
                    <button onClick={() => openEvent(item.id)} className="block w-full">
                      {cardInner}
                    </button>
                  )}
                </motion.div>
              </li>
            );
          })}
        </ol>

        <Modal open={!!activeEvent} onClose={closeEvent} wide labelledBy="event-modal-title">
          {activeEvent && activeItem ? (
            <div className="p-8 sm:p-10">
              <div className="flex flex-wrap items-center gap-3">
                <Chip tone="bronze">
                  {CATEGORY_LABEL[activeItem.category] ?? "Record"}
                </Chip>
                <span className="text-[0.6rem] uppercase tracking-[0.22em] text-ink-muted">
                  {activeItem.displayDate}
                </span>
              </div>
              <h2
                id="event-modal-title"
                className="font-display mt-4 text-3xl font-semibold leading-tight text-ink sm:text-4xl"
              >
                {activeItem.title}
              </h2>
              <p className="mt-2 flex items-center gap-2 text-sm text-ink-muted">
                <MapPin className="h-4 w-4 text-bronze" strokeWidth={1.5} />
                {activeItem.location}
                <span className="mx-2 text-ink-faint">·</span>
                <CalendarDays className="h-4 w-4 text-bronze" strokeWidth={1.5} />
                {activeItem.displayDate}
              </p>

              <div className="mt-6 h-px w-full bg-ink-soft/25" />

              <p className="drop-cap mt-6 text-[0.95rem] leading-relaxed text-ink dark:text-ink-dark">
                {activeEvent.description}
              </p>

              <div className="mt-6 border-l-2 border-bronze/60 bg-paper/70 p-5">
                <h4 className="flex items-center gap-2 text-[0.62rem] font-semibold uppercase tracking-[0.24em] text-bronze">
                  <Landmark className="h-4 w-4" strokeWidth={1.5} />
                  Historical significance
                </h4>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                  {activeEvent.significance}
                </p>
              </div>

              {sourceRef ? (
                <div className="mt-6 text-sm">
                  <span className="flex items-center gap-2 text-[0.62rem] font-semibold uppercase tracking-[0.24em] text-ink-muted">
                    <Quote className="h-3.5 w-3.5" strokeWidth={1.5} />
                    Related source
                  </span>
                  <p className="mt-2 text-ink-soft">
                    {sourceRef.title} — {sourceRef.author}{" "}
                    <span className="text-ink-muted">({sourceRef.year})</span>
                  </p>
                  {sourceRef.placeholder ? (
                    <p className="mt-1 text-xs italic text-ink-muted">{sourceRef.placeholder}</p>
                  ) : null}
                </div>
              ) : null}

              <OrnamentLine className="mt-7" />

              <div className="mt-6 flex flex-wrap gap-3">
                {sourceRef ? (
                  <ArchiveButton href={`/sources?source=${sourceRef.id}`}>
                    Explore the source
                  </ArchiveButton>
                ) : null}
                {sourceList.length > 0 ? (
                  <ArchiveButton href={`/sources?event=${activeEvent.id}`} variant="outline">
                    Related evidence
                  </ArchiveButton>
                ) : null}
                {activeEvent.locationId ? (
                  <Link
                    href={`/map?loc=${activeEvent.locationId}`}
                    className="historical-link inline-flex items-center gap-2 self-center text-[0.66rem] font-semibold uppercase tracking-[0.2em] text-bronze hover:text-ink-soft"
                  >
                    <MapPin className="h-3.5 w-3.5" strokeWidth={1.5} />
                    See it on the map
                  </Link>
                ) : null}
              </div>
            </div>
          ) : null}
        </Modal>
      </div>
    </div>
  );
}