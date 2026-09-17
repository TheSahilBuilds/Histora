"use client";

import { ExternalLink } from "lucide-react";

export interface SceneFallbackSource {
  title: string;
  verified: boolean;
  href: string;
}

export interface SceneFallbackProps {
  title: string;
  locationLabel?: string;
  dateText?: string;
  description: string;
  contextText?: string;
  sources: SceneFallbackSource[];
  className?: string;
}

function DioramaSvg() {
  return (
    <svg
      viewBox="0 0 800 500"
      preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 h-full w-full"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="fallback-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#e9dec4" />
          <stop offset="100%" stopColor="#cfc3a2" stopOpacity="0.35" />
        </linearGradient>
        <linearGradient id="fallback-hill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#8f7d5c" />
          <stop offset="100%" stopColor="#6e5a3f" />
        </linearGradient>
      </defs>
      <rect width="800" height="500" fill="url(#fallback-sky)" />
      <g fill="#7a6849" opacity="0.5">
        <path d="M-40 240 L40 120 L110 238 M140 235 L210 130 L280 240 M700 235 L770 110 L850 235" />
      </g>
      <g fill="url(#fallback-hill)" opacity="0.9">
        <path d="M60 190 L150 95 L250 165 L330 130 L420 190 L520 120 L640 180 L800 150 L800 500 L60 500 Z" />
      </g>
      <g fill="#6e5a3f">
        <path d="M120 230 L210 160 L310 230 L395 180 L470 235 M380 470 L250 300 L330 250 L420 300 L520 470 Z" opacity="0.55" />
        <path d="M60 175 L110 130 L170 172 M640 150 L700 100 L770 160" opacity="0.8" />
      </g>
      <g fill="none" stroke="#7a6849" strokeWidth="2" opacity="0.6">
        <path d="M120 280 q40 -8 80 0 q40 8 90 0 M360 300 q50 -10 110 0 M420 340 q40 -6 80 0" />
      </g>
      <g fill="#e8dcc4" stroke="#a3927a" strokeWidth="1.5">
        <path d="M250 320 L320 250 L390 250 L430 320 L250 320 Z" />
        <path d="M250 320 L430 320 L410 360 L260 360 Z" />
        <rect x="322" y="180" width="48" height="70" />
        <rect x="300" y="150" width="95" height="20" />
        <rect x="335" y="70" width="24" height="80" />
      </g>
      <g stroke="#a3927a" strokeWidth="2.5" opacity="0.8">
        <path d="M370 250 L330 330 L340 390" fill="none" />
        <path d="M330 330 q-30 20 -60 30" fill="none" />
        <path d="M340 390 q30 16 70 24" fill="none" />
      </g>
      <g fill="#c9bda6">
        <circle cx="620" cy="90" r="14" opacity="0.5" />
        <circle cx="250" cy="130" r="10" opacity="0.35" />
      </g>
    </svg>
  );
}

export default function SceneFallback({
  title,
  locationLabel,
  dateText,
  description,
  contextText,
  sources,
  className,
}: SceneFallbackProps) {
  return (
    <div className={className}>
      <div className="scene-stage relative">
        <DioramaSvg />

        <div className="absolute inset-0 grid place-items-center p-4 sm:p-6">
          <div className="max-w-md border border-ink-soft/30 bg-paper/95 p-5 text-center shadow-paper-lg sm:p-6">
            <p className="text-[0.55rem] font-bold uppercase tracking-[0.28em] text-bronze">
              {title.toUpperCase()} · the place
            </p>
            <h3 className="font-display mt-2 text-2xl font-semibold leading-tight text-ink">
              3D VISUALIZATION UNAVAILABLE
            </h3>
            <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">
              The historical record is still available below.
            </p>

            <div className="mx-auto mt-4 h-px max-w-xs bg-ink-line/50" />

            <p className="mt-4 text-sm leading-relaxed text-ink-soft">{description}</p>
            <p className="mt-2 text-[0.6rem] uppercase tracking-[0.16em] text-ink-muted">
              {locationLabel}
              {locationLabel && dateText ? " · " : ""}
              {dateText ?? ""}
            </p>

            {contextText ? (
              <p className="mt-4 border-l-2 border-bronze/50 pl-3 text-left text-xs leading-relaxed text-ink-muted">
                {contextText}
              </p>
            ) : null}

            {sources.length ? (
              <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
                {sources.map((s, i) => (
                  <a
                    key={`${s.title}-${i}`}
                    href={s.href}
                    className="historical-link inline-flex items-center gap-1.5 text-[0.58rem] font-semibold uppercase tracking-[0.18em] text-bronze hover:text-ink"
                  >
                    {s.title}
                    <ExternalLink className="h-3 w-3" strokeWidth={1.6} />
                  </a>
                ))}
              </div>
            ) : null}
          </div>
        </div>

        <span className="absolute bottom-3 left-3 z-10 bg-paper/70 px-2 py-1 text-[0.55rem] font-semibold uppercase tracking-[0.22em] text-ink-muted">
          Static archival illustration
        </span>
      </div>
    </div>
  );
}