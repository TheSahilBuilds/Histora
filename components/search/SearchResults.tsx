"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Search,
  ArrowRight,
  X,
  BookOpen,
  Clock3,
  MapPin,
  Users2,
  ScrollText,
  Compass,
  Landmark,
} from "lucide-react";
import {
  searchArchive,
  SEARCH_KINDS,
  KIND_LABEL,
  EVIDENCE_LABEL,
  type SearchKind,
} from "@/lib/search";
import { cn } from "@/lib/utils";
import { OrnamentLine } from "@/components/ui/Ornament";

const KIND_ICON: Record<SearchKind, typeof BookOpen> = {
  story: BookOpen,
  event: Clock3,
  location: MapPin,
  person: Users2,
  source: ScrollText,
  perspective: Compass,
  period: Landmark,
};

const SUGGESTIONS = ["Shivaji", "Pratapgad", "1857", "Raigad", "sources on Delhi"];

export default function SearchResults() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState(() => searchParams.get("q") ?? "");
  const [kind, setKind] = useState<SearchKind | "all">(
    () => (searchParams.get("kind") as SearchKind | null) ?? "all"
  );
  const [searching, setSearching] = useState(false);
  const mounted = useRef(false);

  const results = useMemo(() => searchArchive(query, kind), [query, kind]);
  const trimmed = query.trim();

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    setSearching(true);
    const params = new URLSearchParams();
    if (trimmed) params.set("q", trimmed);
    if (kind !== "all") params.set("kind", kind);
    router.replace(`${pathname}${params.toString() ? `?${params}` : ""}`, { scroll: false });
    const timer = window.setTimeout(() => setSearching(false), 220);
    return () => window.clearTimeout(timer);
  }, [trimmed, kind, pathname, router]);

  return (
    <div>
      <section aria-labelledby="search-title" className="parchment parchment-deckle p-6 sm:p-8">
        <div className="flex items-center gap-3">
          <h2
            id="search-title"
            className="text-[0.62rem] font-semibold uppercase tracking-[0.3em] text-bronze"
          >
            Search the Archive
          </h2>
          <span className="hidden h-px w-10 bg-bronze/40 sm:block" aria-hidden="true" />
        </div>

        <form
          className="mt-6 flex items-center gap-3"
          onSubmit={(e) => e.preventDefault()}
          role="search"
        >
          <div className="relative min-w-0 flex-1">
            <Search
              className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-bronze"
              strokeWidth={1.5}
              aria-hidden="true"
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search stories, places, people, sources…"
              aria-label="Search the archive"
              autoFocus
              className="w-full border border-ink-soft/30 bg-paper py-3.5 pl-11 pr-11 text-sm text-ink placeholder:text-ink-muted focus:border-bronze focus:outline-none"
            />
            {query ? (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center text-ink-muted transition-colors hover:text-bronze"
              >
                <X className="h-4 w-4" strokeWidth={1.5} />
              </button>
            ) : null}
          </div>
        </form>

        <div className="mt-5 flex flex-wrap items-center gap-2">
          {SEARCH_KINDS.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => setKind(option.id)}
              className={cn(
                "border px-3.5 py-1.5 text-[0.62rem] font-semibold uppercase tracking-[0.18em] transition-colors",
                kind === option.id
                  ? "border-ink bg-ink text-paper"
                  : "border-ink-soft/30 text-ink-soft hover:border-bronze hover:text-bronze"
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </section>

      {!trimmed ? (
        <section aria-live="polite" className="mt-12 border border-ink-soft/25 p-10 text-center sm:p-14">
          <p className="font-display text-xl italic text-ink">Begin with a name, a place or a year.</p>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-ink-muted">
            Search across every story, event, place, person, source, perspective and period in the
            archive.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setQuery(s)}
                className="border border-ink-soft/25 px-3 py-1.5 text-[0.7rem] text-ink-soft transition-colors hover:border-bronze hover:text-bronze"
              >
                {s}
              </button>
            ))}
          </div>
        </section>
      ) : searching ? (
        <section aria-live="polite" className="mt-12 parchment p-10 text-center">
          <p className="inline-flex items-center gap-2 font-display text-lg italic text-ink-muted">
            <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border border-bronze border-t-transparent" />
            Searching the archive…
          </p>
        </section>
      ) : results.length === 0 ? (
        <section aria-live="polite" className="mt-12 border border-ink-soft/25 p-10 text-center sm:p-14">
          <p className="font-display text-xl italic text-ink">No records found.</p>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-ink-muted">
            The archive holds no entry matching &ldquo;{trimmed}&rdquo;. Try a broader term, a
            different spelling, or clear the type filter.
          </p>
        </section>
      ) : (
        <section aria-label="Search results" aria-live="polite" className="mt-12">
          <header className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <span className="text-[0.6rem] font-semibold uppercase tracking-[0.3em] text-bronze">
                {kind === "all" ? "Across the archive" : KIND_LABEL[kind]}
              </span>
              <h2 className="font-display mt-2 text-3xl font-semibold leading-tight text-ink sm:text-4xl">
                {results.length} {results.length === 1 ? "record" : "records"}
              </h2>
            </div>
            <p className="text-[0.62rem] uppercase tracking-[0.18em] text-ink-muted">
              matching &ldquo;{trimmed}&rdquo;
            </p>
          </header>

          <OrnamentLine className="mt-6" />

          <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {results.map((result) => {
              const Icon = KIND_ICON[result.kind];
              return (
                <Link
                  key={result.id}
                  href={result.href}
                  className="parchment group flex flex-col p-6 transition-transform duration-300 hover:-translate-y-1 hover:shadow-paper-lg"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="flex items-center gap-1.5 text-[0.55rem] uppercase tracking-[0.24em] text-ink-faint">
                      <Icon className="h-3.5 w-3.5 text-bronze" strokeWidth={1.5} />
                      {KIND_LABEL[result.kind]}
                    </span>
                    {result.meta ? (
                      <span className="stamp stamp-faint">{result.meta}</span>
                    ) : null}
                  </div>

                  <h3 className="font-display mt-3 text-xl font-semibold leading-snug text-ink transition-colors group-hover:text-bronze">
                    {result.title}
                  </h3>
                  <p className="mt-1 text-[0.62rem] uppercase tracking-[0.16em] text-ink-muted">
                    {result.subtitle}
                  </p>

                  <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-ink-muted">
                    {result.description}
                  </p>

                  <div className="mt-auto flex items-center justify-between gap-3 pt-5">
                    {result.evidence ? (
                      <span className="text-[0.55rem] uppercase tracking-[0.18em] text-bronze">
                        {EVIDENCE_LABEL[result.evidence]}
                      </span>
                    ) : (
                      <span />
                    )}
                    <span className="inline-flex items-center gap-1.5 text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-bronze">
                      Open
                      <ArrowRight
                        className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1"
                        strokeWidth={1.5}
                      />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
