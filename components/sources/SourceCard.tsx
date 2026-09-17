import type { Source } from "@/lib/types";
import { cn } from "@/lib/utils";
import { BadgeCheck, AlertTriangle, FlaskConical, BookOpen } from "lucide-react";

interface SourceCardProps {
  source: Source;
  index: number;
  onOpen: (source: Source) => void;
}

export default function SourceCard({ source, index, onOpen }: SourceCardProps) {
  return (
    <button
      type="button"
      onClick={() => onOpen(source)}
      className="parchment group relative flex flex-col p-6 text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-paper-lg"
    >
      <div className="flex items-center justify-between gap-3">
        <span className="text-[0.55rem] uppercase tracking-[0.24em] text-ink-faint">
          ref {String(index + 1).padStart(2, "0")} · {source.type}
        </span>
        <span className="flex items-center gap-1.5">
          {source.verified ? (
            <BadgeCheck className="h-3.5 w-3.5 text-bronze" strokeWidth={1.5} />
          ) : (
            <AlertTriangle className="h-3.5 w-3.5 text-ink-muted" strokeWidth={1.5} />
          )}
          {source.demoDocument ? (
            <FlaskConical className="h-3.5 w-3.5 text-ink-muted" strokeWidth={1.4} />
          ) : null}
        </span>
      </div>

      <h3 className="font-display mt-3 text-xl font-semibold leading-snug text-ink transition-colors group-hover:text-bronze">
        {source.title}
      </h3>
      <p className="mt-1.5 text-xs text-ink-muted">
        {source.author} <span className="text-ink-faint">·</span> {source.year}
      </p>

      <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-ink-muted">
        {source.description}
      </p>

      <span
        className={cn(
          "mt-4 inline-flex w-fit items-center gap-2 border px-3 py-1.5 text-[0.6rem] font-semibold uppercase tracking-[0.2em] transition-colors",
          "border-ink-soft/30 text-ink-soft group-hover:border-bronze group-hover:text-bronze"
        )}
      >
        <BookOpen className="h-3.5 w-3.5" strokeWidth={1.5} />
        Open document
      </span>

      <span className="pointer-events-none mt-4 border-t border-ink-soft/15 pt-2 text-[0.55rem] uppercase tracking-[0.2em] text-ink-faint">
        {source.category}
      </span>
    </button>
  );
}