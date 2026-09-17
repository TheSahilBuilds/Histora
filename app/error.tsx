"use client";

import { useEffect } from "react";
import ArchiveButton from "@/components/ui/ArchiveButton";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-2xl flex-col items-center justify-center px-6 text-center">
      <span className="text-[0.6rem] font-semibold uppercase tracking-[0.32em] text-bronze">
        Reading room fault
      </span>
      <h1 className="font-display mt-4 text-4xl font-semibold text-ink sm:text-5xl">
        The page could not be opened
      </h1>
      <p className="mt-4 max-w-md text-sm leading-relaxed text-ink-muted">
        Something misfiled while preparing this page. Try again — or return to the archive entrance.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <ArchiveButton onClick={reset}>Try again</ArchiveButton>
        <ArchiveButton href="/" variant="outline">
          Back to the archive
        </ArchiveButton>
      </div>
    </div>
  );
}