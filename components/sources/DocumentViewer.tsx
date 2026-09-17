import Link from "next/link";
import type { Source } from "@/lib/types";
import { motion } from "motion/react";
import Modal from "@/components/ui/Modal";
import { Chip } from "@/components/ui/Chip";
import { OrnamentLine } from "@/components/ui/Ornament";
import { getEvent } from "@/lib/data";
import {
  BadgeCheck,
  AlertTriangle,
  FlaskConical,
  Clock3,
  Archive,
  Landmark,
  StickyNote,
} from "lucide-react";

interface DocumentViewerProps {
  source: Source;
  open: boolean;
  onClose: () => void;
}

export default function DocumentViewer({ source, open, onClose }: DocumentViewerProps) {
  const events = source.relatedEventIds
    .map((eid) => getEvent(eid))
    .filter((e): e is NonNullable<typeof e> => !!e);

  return (
    <Modal open={open} onClose={onClose} wide labelledBy="source-modal-title">
      <div className="p-8 sm:p-10">
        <div className="flex flex-wrap items-center gap-2">
          <Chip tone="bronze">{source.type}</Chip>
          <Chip tone={source.verified ? "bronze" : "ink"}>{source.category}</Chip>
          {source.verified ? (
            <Chip tone="bronze">
              <BadgeCheck className="h-3.5 w-3.5" strokeWidth={1.5} /> Verified
            </Chip>
          ) : (
            <Chip tone="ink">
              <AlertTriangle className="h-3.5 w-3.5" strokeWidth={1.5} /> Unverified
            </Chip>
          )}
          {source.demoDocument ? (
            <Chip tone="ink">
              <FlaskConical className="h-3.5 w-3.5" strokeWidth={1.5} /> Demonstration
            </Chip>
          ) : null}
        </div>

        <h2 id="source-modal-title" className="font-display mt-4 text-3xl font-semibold leading-tight text-ink sm:text-4xl">
          {source.title}
        </h2>
        <p className="mt-2 text-sm text-ink-muted">
          {source.author}
          {source.institution ? <span className="text-ink-faint"> · {source.institution}</span> : null}
          <span className="text-ink-faint"> · {source.year}</span>
        </p>

        <div className="mt-6 h-px w-full bg-ink-soft/25" />

        <div className="parchment parchment-deckle mt-6 p-7 sm:p-8">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-[0.58rem] font-semibold uppercase tracking-[0.22em] text-ink-soft">
              <Archive className="h-4 w-4 text-bronze" strokeWidth={1.5} />
              Document folio
            </div>
            <span className="text-[0.55rem] uppercase tracking-[0.24em] text-ink-muted">
              No. {source.id}
            </span>
          </div>

          <div className="mt-5">
            <p className="text-[0.6rem] font-semibold uppercase tracking-[0.22em] text-bronze">
              What this document is
            </p>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">{source.description}</p>
          </div>

          <div className="mt-5">
            <p className="text-[0.6rem] font-semibold uppercase tracking-[0.22em] text-bronze">
              Historical note
            </p>
            <p className="mt-2 text-sm leading-relaxed text-ink-muted">{source.context}</p>
          </div>

          {source.placeholder ? (
            <div className="mt-5 flex items-start gap-3 border border-bronze/50 bg-paper px-4 py-3">
              <StickyNote className="mt-0.5 h-4 w-4 shrink-0 text-bronze" strokeWidth={1.5} />
              <p className="text-xs italic leading-relaxed text-ink-muted">{source.placeholder}</p>
            </div>
          ) : null}

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="mt-6 border border-ink-soft/40 bg-paper"
          >
            {source.demoDocument ? (
              <div className="relative overflow-hidden p-6 sm:p-8">
                <div className="absolute inset-0 paper-noise opacity-40" />
                <div className="absolute right-3 top-3 rotate-3 border border-bronze/40 px-3 py-1 text-[0.55rem] uppercase tracking-[0.26em] text-bronze">
                  Demonstration
                </div>
                <p className="text-[0.58rem] font-semibold uppercase tracking-[0.3em] text-ink-soft">
                  Histora — Archive specimen
                </p>
                <h3 className="font-display mt-2 text-2xl font-semibold text-ink">
                  Specimen of a Document
                </h3>
                <p className="mt-4 text-sm leading-relaxed text-ink-muted">
                  This pane is how an authentic archival document would appear inside Histora —
                  with the text rendered in folio form and its references linked to the timeline
                  and the perspectives that lived through it. This specimen carries no
                  historical content of its own.
                </p>
                <p className="mt-4 border-l-2 border-bronze/50 pl-4 text-sm italic leading-relaxed text-ink-soft">
                  &ldquo;An archive is not the past; it is the trail the past left behind. The
                  reader&rsquo;s task is to follow the trail, and to know when it disappears.&rdquo;
                </p>
                <div className="mt-6 grid gap-2 text-[0.62rem] text-ink-muted sm:grid-cols-2">
                  <span>Ref: HIS-DEMO-1857-001</span>
                  <span>Foil: 1 of 1</span>
                  <span>Ink: archival sepia</span>
                  <span>Status: specimen only</span>
                </div>
              </div>
            ) : (
              <div className="p-6 text-center">
                <p className="text-[0.66rem] uppercase tracking-[0.2em] text-ink-muted">
                  Scan / full text not included in this prototype
                </p>
                <p className="mx-auto mt-2 max-w-md text-xs italic text-ink-muted">
                  The record is real and verified; its digital image and full transcription will
                  be added to the archive later.
                </p>
              </div>
            )}
          </motion.div>

          {events.length ? (
            <div className="mt-6">
              <p className="flex items-center gap-2 text-[0.6rem] font-semibold uppercase tracking-[0.22em] text-ink-soft">
                <Clock3 className="h-3.5 w-3.5 text-bronze" strokeWidth={1.5} />
                Ties to the timeline
              </p>
              <ul className="mt-2.5 space-y-2">
                {events.map((e) => (
                  <li key={e.id}>
                    <Link
                      href={`/timeline?event=${e.id}`}
                      className="text-sm text-ink-soft underline decoration-bronze/50 underline-offset-2 hover:text-bronze"
                    >
                      {e.displayDate} — {e.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <OrnamentLine className="mt-7" />

          <div className="mt-5 flex flex-col gap-1.5 text-[0.68rem] text-ink-muted">
            <span className="flex items-center gap-2">
              <Landmark className="h-3.5 w-3.5 text-bronze" strokeWidth={1.5} />
              Citation: {source.author}. <em>{source.title}</em>. {source.year}.
            </span>
          </div>
        </div>
      </div>
    </Modal>
  );
}