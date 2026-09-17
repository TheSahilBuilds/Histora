import { cn } from "@/lib/utils";

interface OrnamentProps {
  label?: string;
  className?: string;
}

export function OrnamentLine({ label, className }: OrnamentProps) {
  return (
    <div className={cn("ornament-line", className)}>
      {label ? (
        <span className="text-[0.62rem] font-semibold uppercase tracking-[0.3em] text-ink-muted">
          {label}
        </span>
      ) : null}
    </div>
  );
}

export function Flourish({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 24"
      className={cn("h-6 w-28 text-bronze", className)}
      aria-hidden="true"
    >
      <path
        d="M2 12h30m20-2-6 2 6 2m6-4 6 2-6 2m22 0h30"
        stroke="currentColor"
        strokeWidth="0.7"
        fill="none"
      />
      <circle cx="60" cy="12" r="2.4" fill="currentColor" />
      <circle cx="44" cy="12" r="1.1" fill="currentColor" opacity="0.6" />
      <circle cx="76" cy="12" r="1.1" fill="currentColor" opacity="0.6" />
    </svg>
  );
}