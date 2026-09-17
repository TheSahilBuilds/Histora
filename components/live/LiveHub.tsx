"use client";

import Link from "next/link";
import {
  Landmark,
  Shield,
  Wheat,
  Scale,
  Hammer,
  House,
  ArrowRight,
  MapPin,
  Clock3,
  BookOpen,
} from "lucide-react";
import type { PovId } from "@/lib/types";
import { cn } from "@/lib/utils";
import { OrnamentLine } from "@/components/ui/Ornament";

const ICON_MAP: Record<PovId, typeof Wheat> = {
  ruler: Landmark,
  soldier: Shield,
  farmer: Wheat,
  merchant: Scale,
  artisan: Hammer,
  commoner: House,
};

export interface LiveMoment {
  scenarioId: string;
  scenarioTitle: string;
  scenarioTagline: string;
  disclaimer: string;
  storyId?: string;
  storyTitle?: string;
  displayDate?: string;
  location?: string;
}

export interface LiveRole {
  id: PovId;
  role: string;
  tagline: string;
  momentCount: number;
}

interface LiveHubProps {
  roles: LiveRole[];
  moments: LiveMoment[];
  initialRole?: PovId;
}

export default function LiveHub({ roles, moments, initialRole }: LiveHubProps) {
  const selectedRole = initialRole;
  const active = roles.find((r) => r.id === selectedRole);

  return (
    <div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {roles.map((r, idx) => {
          const Icon = ICON_MAP[r.id];
          const isActive = r.id === selectedRole;
          return (
            <Link
              key={r.id}
              href={isActive ? "/live" : `/live?role=${r.id}`}
              className={cn(
                "group relative flex flex-col border px-6 py-6 transition-all",
                isActive
                  ? "border-bronze bg-ink text-paper shadow-paper-lg"
                  : "parchment hover:-translate-y-1 hover:shadow-paper-lg"
              )}
            >
              <div className="flex items-start justify-between">
                <span
                  className={cn(
                    "flex h-12 w-12 items-center justify-center border",
                    isActive ? "border-bronze/60 text-bronze" : "border-bronze/50 text-bronze"
                  )}
                >
                  <Icon className="h-6 w-6" strokeWidth={1.4} />
                </span>
                <span
                  className={cn(
                    "text-[0.55rem] uppercase tracking-[0.26em]",
                    isActive ? "text-paper/45" : "text-ink-faint"
                  )}
                >
                  {String(idx + 1).padStart(2, "0")}
                </span>
              </div>
              <h3
                className={cn(
                  "font-display mt-5 text-2xl font-semibold",
                  isActive ? "text-paper" : "text-ink"
                )}
              >
                {r.role}
              </h3>
              <p
                className={cn(
                  "mt-1 text-xs leading-relaxed",
                  isActive ? "text-paper/65" : "text-ink-muted"
                )}
              >
                {r.tagline}
              </p>
              <div
                className={cn(
                  "mt-auto pt-6 text-[0.6rem] uppercase tracking-[0.22em]",
                  isActive ? "text-bronze" : "text-ink-soft"
                )}
              >
                {r.momentCount} live moments
              </div>
            </Link>
          );
        })}
      </div>

      {active ? (
        <div className="mt-14">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <span className="text-[0.6rem] font-semibold uppercase tracking-[0.3em] text-bronze">
                Choose a moment
              </span>
              <h2 className="font-display mt-2 text-3xl font-medium text-ink sm:text-4xl">
                {active.role} — when and where?
              </h2>
            </div>
            <p
              className={cn(
                "max-w-xs text-[0.62rem] uppercase leading-relaxed tracking-[0.16em]",
                moments.length === 0 ? "text-bronze" : "text-ink-soft"
              )}
            >
              {moments.length === 0
                ? "These lives are still being written — a moment is coming."
                : "Each moment is a fictional reconstruction built on documented sources."}
            </p>
          </div>

          <OrnamentLine className="mt-6" />

          {moments.length === 0 ? (
            <div className="parchment mt-6 p-10 text-center">
              <p className="font-display text-xl italic text-ink">
                No moments yet for the {active.role.toLowerCase()}.
              </p>
              <p className="mt-2 text-sm text-ink-muted">
                The archive is being built — a moment for this life is coming soon.
              </p>
            </div>
          ) : (
            <ul className="mt-2">
              {moments.map((m) => (
                <li
                  key={m.scenarioId}
                  className="relative border-b border-ink-soft/20 py-6 pl-10 lg:pl-16"
                >
                  <span className="absolute -left-1 top-8 hidden h-2.5 w-2.5 rotate-45 border border-bronze bg-paper lg:block" />
                  <div className="flex flex-wrap items-start gap-4 lg:justify-between">
                    <div className="max-w-2xl">
                      <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.62rem] uppercase tracking-[0.18em] text-ink-soft">
                        <span className="flex items-center gap-1.5">
                          <Clock3 className="h-3.5 w-3.5 text-bronze" strokeWidth={1.8} />
                          {m.displayDate ?? "date to be confirmed"}
                        </span>
                        {m.location ? (
                          <span className="flex items-center gap-1.5">
                            <MapPin className="h-3.5 w-3.5 text-bronze" strokeWidth={1.8} />
                            {m.location}
                          </span>
                        ) : null}
                      </p>
                      <h3 className="font-display mt-2 text-2xl font-semibold text-ink">
                        {m.scenarioTitle}
                      </h3>
                      <p className="font-display mt-0.5 text-sm italic text-bronze">
                        {m.scenarioTagline}
                      </p>
                      <p className="mt-2 text-sm leading-relaxed text-ink-muted">{m.disclaimer}</p>
                    </div>
                    <div className="flex flex-col items-start gap-2 lg:items-end">
                      <Link
                        href={`/scenario/${m.scenarioId}`}
                        className="inline-flex items-center gap-2 border border-ink bg-ink px-5 py-3 text-[0.66rem] font-semibold uppercase tracking-[0.22em] text-paper transition-colors hover:bg-ink-soft"
                      >
                        <BookOpen className="h-4 w-4" strokeWidth={1.5} />
                        Live it
                        <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
                      </Link>
                      {m.storyId ? (
                        <Link
                          href={`/story/${m.storyId}`}
                          className="historical-link text-[0.6rem] uppercase tracking-[0.18em] text-bronze hover:text-ink-soft"
                        >
                          Read the story behind · {m.storyTitle}
                        </Link>
                      ) : null}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <p className="mt-8 text-center text-[0.66rem] uppercase leading-relaxed tracking-[0.22em] text-ink-muted">
            Step into a life for an hour. Every choice is a gameplay device — a
            perspective, in the sense in which the archive means it, not a verdict.
          </p>
        </div>
      ) : null}
    </div>
  );
}