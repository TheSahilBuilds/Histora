"use client";

import { useMemo } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, ChevronDown, RotateCcw } from "lucide-react";
import { stories } from "@/lib/data";
import {
  DEFAULT_FILTERS,
  ERA_OPTIONS,
  REGION_OPTIONS,
  ROLE_OPTIONS,
  SCOPE_OPTIONS,
  buildQuery,
  eraLabel,
  filterStories,
  parseFilters,
  regionHasRecords,
  regionLabel,
  roleLabel,
  type ExploreFilters,
  type ExploreOption,
  type ScopeId,
} from "@/lib/explore";
import { OrnamentLine } from "@/components/ui/Ornament";
import TiltCard from "@/components/ui/TiltCard";

interface FilterFieldProps {
  id: string;
  label: string;
  value: string;
  options: ExploreOption[];
  onChange: (value: string) => void;
}

function FilterField({ id, label, value, options, onChange }: FilterFieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor={id}
        className="text-[0.6rem] font-semibold uppercase tracking-[0.26em] text-bronze"
      >
        {label}
      </label>
      <div className="relative">
        <select
          id={id}
          name={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="select-archive"
        >
          {options.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown
          className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-bronze"
          strokeWidth={1.5}
          aria-hidden="true"
        />
      </div>
    </div>
  );
}

export default function ExploreFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const filters = useMemo(
    () => parseFilters(new URLSearchParams(searchParams.toString())),
    [searchParams]
  );

  const results = useMemo(() => filterStories(stories, filters), [filters]);

  const applyFilters = (next: ExploreFilters) => {
    router.replace(`${pathname}?${buildQuery(next)}`, { scroll: false });
  };

  const changeField = (field: keyof ExploreFilters, value: string) => {
    const next = { ...filters, [field]: value };
    if (field === "scope") {
      const scope = value as ScopeId;
      next.region = REGION_OPTIONS[scope][0]?.id ?? DEFAULT_FILTERS.region;
    }
    applyFilters(next);
  };

  const resetFilters = () => applyFilters(DEFAULT_FILTERS);

  const roleActive = filters.role !== "all";
  const region = regionLabel(filters.scope, filters.region);
  const regionRecords = regionHasRecords(stories, filters.scope, filters.region);

  const countLabel = roleActive
    ? `${results.length} ${results.length === 1 ? "STORY" : "STORIES"} · ${roleLabel(filters.role).toUpperCase()} PERSPECTIVE`
    : `${results.length} ${results.length === 1 ? "HISTORICAL STORY" : "HISTORICAL STORIES"}`;

  const intro =
    filters.region === "maharashtra"
      ? "Stories of a changing Maharashtra, its forts, campaigns, people and political world."
      : `A selection of the archive's records for ${region}.`;

  const emptyMessage = regionRecords
    ? {
        title: "No records found",
        body: "The archive does not yet contain a record matching this combination of place, era and perspective. Try changing one of the filters.",
      }
    : {
        title: "The archive is still growing",
        body:
          filters.region === "maharashtra"
            ? "Histora currently has detailed prototype records for Maharashtra. More regions will be added to the archive."
            : `Histora currently has detailed prototype records for Maharashtra. Historical records for ${region} are coming to the archive.`,
      };

  return (
    <div>
      <section
        aria-labelledby="explore-filters-title"
        className="parchment parchment-deckle p-6 sm:p-8"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h2
              id="explore-filters-title"
              className="text-[0.62rem] font-semibold uppercase tracking-[0.3em] text-bronze"
            >
              Explore the Archive
            </h2>
            <span className="hidden h-px w-10 bg-bronze/40 sm:block" aria-hidden="true" />
          </div>
          <button
            type="button"
            onClick={resetFilters}
            className="group inline-flex items-center gap-1.5 border-b border-bronze/50 pb-1 text-[0.62rem] font-semibold uppercase tracking-[0.22em] text-bronze transition-colors hover:border-ink hover:text-ink"
          >
            <RotateCcw className="h-3.5 w-3.5" strokeWidth={1.5} />
            Reset filters
          </button>
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <FilterField
            id="explore-scope"
            label="Scope"
            value={filters.scope}
            options={SCOPE_OPTIONS}
            onChange={(v) => changeField("scope", v)}
          />
          <FilterField
            id="explore-region"
            label="Region"
            value={filters.region}
            options={REGION_OPTIONS[filters.scope]}
            onChange={(v) => changeField("region", v)}
          />
          <FilterField
            id="explore-era"
            label="Era"
            value={filters.era}
            options={ERA_OPTIONS}
            onChange={(v) => changeField("era", v)}
          />
          <FilterField
            id="explore-role"
            label="Perspective"
            value={filters.role}
            options={ROLE_OPTIONS}
            onChange={(v) => changeField("role", v)}
          />
        </div>
      </section>

      {results.length > 0 ? (
        <section aria-label="Matching records" aria-live="polite" className="mt-12">
          <header className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <span className="text-[0.6rem] font-semibold uppercase tracking-[0.3em] text-bronze">
                {region.toUpperCase()} · {eraLabel(filters.era).toUpperCase()}
              </span>
              <h2 className="font-display mt-2 text-3xl font-semibold leading-tight text-ink sm:text-4xl">
                {countLabel}
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-muted">{intro}</p>
            </div>
          </header>

          <OrnamentLine className="mt-6" />

          <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {results.map((s) => (
              <TiltCard key={s.id}>
                <Link
                  href={`/story/${s.id}`}
                  className="parchment group flex h-full flex-col p-6 transition-transform duration-300 hover:-translate-y-1 hover:shadow-paper-lg"
                >
                <div className="flex items-start justify-between gap-3">
                  <span className="stamp stamp-bronze">{s.century.toUpperCase()}</span>
                  {roleActive ? (
                    <span className="stamp stamp-faint">
                      {roleLabel(filters.role).toUpperCase()} perspective
                    </span>
                  ) : null}
                </div>
                <span className="mt-4 text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-bronze">
                  {s.displayDate}
                </span>
                <span className="mt-1 text-[0.6rem] uppercase tracking-[0.18em] text-ink-muted">
                  {s.location}
                </span>
                <h3 className="font-display mt-1.5 text-2xl font-semibold leading-snug text-ink transition-colors group-hover:text-bronze">
                  {s.title}
                </h3>
                <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-ink-muted">
                  {s.shortDescription}
                </p>
                <div className="mt-auto flex items-center justify-between gap-3 pt-6">
                  <span className="text-[0.6rem] uppercase tracking-[0.18em] text-ink-muted">
                    {s.povs.length} {s.povs.length === 1 ? "PERSPECTIVE" : "PERSPECTIVES"}
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-bronze">
                    Explore record
                    <ArrowRight
                      className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1"
                      strokeWidth={1.5}
                    />
                  </span>
                </div>
                </Link>
              </TiltCard>
            ))}
          </div>
        </section>
      ) : (
        <section aria-live="polite" className="mt-12 border border-ink-soft/25 p-10 text-center sm:p-14">
          <p className="font-display text-xl italic text-ink">{emptyMessage.title}</p>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-ink-muted">
            {emptyMessage.body}
          </p>
        </section>
      )}
    </div>
  );
}