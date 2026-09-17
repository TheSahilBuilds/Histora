import ArchiveButton from "@/components/ui/ArchiveButton";
import { OrnamentLine } from "@/components/ui/Ornament";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-2xl flex-col items-center justify-center px-6 text-center">
      <span className="text-[0.6rem] font-semibold uppercase tracking-[0.32em] text-bronze">
        Catalogue error
      </span>
      <h1 className="font-display mt-4 text-6xl font-semibold text-ink sm:text-7xl">404</h1>
      <p className="font-display mt-2 text-2xl font-medium text-ink-soft sm:text-3xl">
        This folio is missing from the archive
      </p>
      <p className="mt-4 max-w-md text-sm leading-relaxed text-ink-muted">
        The document you are looking for may have been misplaced, or the reference may be wrong.
        Return to the reading room or consult the catalogue.
      </p>
      <OrnamentLine className="mt-7" />
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <ArchiveButton href="/">Back to the archive</ArchiveButton>
        <ArchiveButton href="/explore" variant="outline">
          Explore catalogues
        </ArchiveButton>
      </div>
    </div>
  );
}