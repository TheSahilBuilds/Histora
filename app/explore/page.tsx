import { Suspense } from "react";
import ArchiveHeader from "@/components/ui/ArchiveHeader";
import ExploreFilters from "@/components/explore/ExploreFilters";

export default function ExplorePage() {
  return (
    <>
      <ArchiveHeader
        kicker="The Historical Atlas"
        title="Explore History"
        subtitle="Choose a place, an era and a perspective — then discover the stories that connect them."
      />

      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <Suspense
          fallback={
            <div className="parchment p-8 text-center">
              <p className="font-display text-lg italic text-ink-muted">Opening the archive…</p>
            </div>
          }
        >
          <ExploreFilters />
        </Suspense>
      </section>
    </>
  );
}