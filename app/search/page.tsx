import { Suspense } from "react";
import ArchiveHeader from "@/components/ui/ArchiveHeader";
import SearchResults from "@/components/search/SearchResults";

export default function SearchPage() {
  return (
    <>
      <ArchiveHeader
        kicker="Look across the archive"
        title="Search History"
        subtitle="Search every story, event, place, person, source, perspective and period held in this archive — then open any record to follow the evidence for yourself."
      />

      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <Suspense
          fallback={
            <div className="parchment p-8 text-center">
              <p className="font-display text-lg italic text-ink-muted">Searching the archive…</p>
            </div>
          }
        >
          <SearchResults />
        </Suspense>
      </section>
    </>
  );
}
