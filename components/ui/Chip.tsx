import { cn } from "@/lib/utils";

interface ChipProps {
  children: React.ReactNode;
  tone?: "bronze" | "ink" | "muted" | "paper";
  className?: string;
}

export function Chip({ children, tone = "bronze", className }: ChipProps) {
  const tones: Record<string, string> = {
    bronze: "border-bronze/50 text-bronze",
    ink: "border-ink-soft/60 text-ink-soft",
    muted: "border-ink-muted/40 text-ink-muted",
    paper: "border-paper/40 bg-paper/10 text-paper",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 border px-2.5 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.18em]",
        tones[tone],
        className
      )}
    >
      {children}
    </span>
  );
}

export function Tag({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center border border-ink-soft/40 px-2 py-0.5 text-[0.6rem] uppercase tracking-[0.16em] text-ink-soft",
        className
      )}
    >
      {children}
    </span>
  );
}