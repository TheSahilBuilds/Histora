"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Source } from "@/lib/types";
import SourceCard from "@/components/sources/SourceCard";
import DocumentViewer from "@/components/sources/DocumentViewer";
import { cn } from "@/lib/utils";

interface SourcesGridProps {
  sources: Source[];
  initialSourceId?: string;
  initialEventId?: string;
}

const TYPE_FILTERS = ["All", "Primary source", "Book", "Archive", "Academic source"];

export default function SourcesGrid({ sources, initialSourceId, initialEventId }: SourcesGridProps) {
  const router = useRouter();
  const [typeFilter, setTypeFilter] = useState("All");
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [eventFilter, setEventFilter] = useState<string | null>(initialEventId ?? null);
  const [active, setActive] = useState<Source | null>(() =>
    initialSourceId
      ? (sources.find((s) => s.id === initialSourceId) ?? null)
      : null
  );

  const filtered = useMemo(() => {
    return sources.filter((s) => {
      if (eventFilter && !s.relatedEventIds.includes(eventFilter) && !(s.relatedStoryIds ?? []).includes(eventFilter))
        return false;
      if (typeFilter !== "All" && s.type !== typeFilter) return false;
      if (verifiedOnly && !s.verified) return false;
      return true;
    });
  }, [sources, typeFilter, verifiedOnly, eventFilter]);

  function open(source: Source) {
    setActive(source);
    router.replace(`/sources?source=${source.id}`, { scroll: false });
  }

  function close() {
    setActive(null);
    router.replace("/sources", { scroll: false });
  }

  return (
    <>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          {TYPE_FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setTypeFilter(f)}
              className={cn(
                "border px-3.5 py-1.5 text-[0.64rem] font-semibold uppercase tracking-[0.18em] transition-colors",
                typeFilter === f
                  ? "border-ink bg-ink text-paper"
                  : "border-ink-soft/30 text-ink-soft hover:border-bronze hover:text-bronze"
              )}
            >
              {f}
            </button>
          ))}
          {eventFilter ? (
            <button
              type="button"
              onClick={() => {
                setEventFilter(null);
                router.replace("/sources", { scroll: false });
              }}
              className="flex items-center gap-1.5 border border-bronze bg-bronze/10 px-3.5 py-1.5 text-[0.64rem] font-semibold uppercase tracking-[0.18em] text-bronze hover:border-ink hover:text-ink"
            >
              Related to this record
              <span className="text-[0.8rem] leading-none">×</span>
            </button>
          ) : null}
        </div>
        <button
          type="button"
          onClick={() => setVerifiedOnly((v) => !v)}
          className={cn(
            "flex items-center gap-2 text-[0.64rem] font-semibold uppercase tracking-[0.18em] transition-colors",
            verifiedOnly ? "text-bronze" : "text-ink-muted hover:text-bronze"
          )}
        >
          <span
            className={cn(
              "flex h-4 w-4 items-center justify-center border",
              verifiedOnly ? "border-bronze bg-bronze text-paper" : "border-ink-soft/40"
            )}
          >
            {verifiedOnly ? "✓" : ""}
          </span>
          Verified only
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className="border border-ink-soft/25 p-8 text-center">
          <p className="text-sm text-ink-muted">
            No sources match this filter. Try clearing the &ldquo;verified only&rdquo; toggle or
            choosing another type.
          </p>
        </div>
      ) : null}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((s, i) => (
          <SourceCard key={s.id} source={s} index={i} onOpen={open} />
        ))}
      </div>

      <DocumentViewer source={active!} open={!!active} onClose={close} />
    </>
  );
}