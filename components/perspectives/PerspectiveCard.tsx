import Link from "next/link";
import { Wheat, Landmark, Scale, Shield, Hammer, House, ArrowRight } from "lucide-react";
import type { PovRole } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Chip } from "@/components/ui/Chip";
import { OrnamentLine } from "@/components/ui/Ornament";

const ICON_MAP: Record<string, typeof Wheat> = {
  farmer: Wheat,
  ruler: Landmark,
  merchant: Scale,
  soldier: Shield,
  artisan: Hammer,
  commoner: House,
};

export default function PerspectiveCard({ pov, index = 0 }: { pov: PovRole; index?: number }) {
  const Icon = ICON_MAP[pov.icon] ?? Wheat;
  const dark = index % 2 === 1;

  return (
    <div
      className={cn(
        "group relative flex flex-col border border-ink-soft/25 transition-shadow duration-300 hover:shadow-paper-lg",
        dark ? "bg-ink text-paper" : "parchment"
      )}
    >
      <div className="flex items-start justify-between gap-4 px-7 pt-7">
        <span
          className={cn(
            "flex h-14 w-14 items-center justify-center border",
            dark ? "border-bronze/60 text-bronze" : "border-bronze/50 text-bronze"
          )}
        >
          <Icon className="h-7 w-7" strokeWidth={1.3} />
        </span>
        <div className="flex flex-col items-end gap-2">
          <Chip tone="bronze">Fictional reconstruction</Chip>
          <span
            className={cn(
              "text-[0.55rem] uppercase tracking-[0.28em]",
              dark ? "text-paper/40" : "text-ink-faint"
            )}
          >
            perspective {String(index + 1).padStart(2, "0")}
          </span>
        </div>
      </div>

      <div className="px-7 pt-5">
        <h3
          className={cn(
            "font-display text-3xl font-semibold",
            dark ? "text-paper" : "text-ink"
          )}
        >
          {pov.role}
        </h3>
        <p
          className={cn(
            "mt-1 text-xs font-medium italic",
            dark ? "text-paper/70" : "text-bronze"
          )}
        >
          {pov.tagline}
        </p>

        <p
          className={cn(
            "mt-4 text-sm leading-relaxed",
            dark ? "text-paper/75" : "text-ink-muted"
          )}
        >
          {pov.context}
        </p>
      </div>

      <div className="px-7 pt-5">
        <span
          className={cn(
            "text-[0.6rem] font-semibold uppercase tracking-[0.22em]",
            dark ? "text-paper/50" : "text-ink-soft"
          )}
        >
          Concerns at the time
        </span>
        <ul className="mt-3 space-y-2">
          {pov.concerns.slice(0, 3).map((c, i) => (
            <li
              key={i}
              className={cn(
                "flex gap-2.5 text-xs leading-relaxed",
                dark ? "text-paper/70" : "text-ink-muted"
              )}
            >
              <span className="mt-1.5 h-1 w-3 shrink-0 bg-bronze/70" />
              {c}
            </li>
          ))}
        </ul>
      </div>

      <div className={cn("mt-auto px-7 pb-7 pt-6")}>
        <OrnamentLine className="!mb-4" />
        <Link
          href={`/live?role=${pov.id}`}
          className={cn(
            "inline-flex w-full items-center justify-center gap-2 border px-5 py-3 text-[0.66rem] font-semibold uppercase tracking-[0.22em] transition-colors",
            dark
              ? "border-bronze text-bronze hover:bg-bronze hover:text-paper"
              : "border-ink text-ink hover:bg-ink hover:text-paper"
          )}
        >
          Enter this perspective
          <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
        </Link>
      </div>
    </div>
  );
}