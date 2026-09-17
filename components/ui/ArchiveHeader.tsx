import { cn } from "@/lib/utils";
import { OrnamentLine } from "@/components/ui/Ornament";

interface ArchiveHeaderProps {
  kicker?: string;
  title: string;
  subtitle?: string;
  tone?: "dark" | "paper";
  className?: string;
}

export default function ArchiveHeader({
  kicker,
  title,
  subtitle,
  tone = "dark",
  className,
}: ArchiveHeaderProps) {
  const dark = tone === "dark";
  return (
    <div className={cn("mx-auto max-w-4xl px-4 pt-28 text-center sm:px-6 sm:pt-32", className)}>
      {kicker ? (
        <span
          className={cn(
            "text-[0.64rem] font-semibold uppercase tracking-[0.32em]",
            dark ? "text-bronze" : "text-paper/70"
          )}
        >
          {kicker}
        </span>
      ) : null}
      <h1
        className={cn(
          "font-display mt-3 text-4xl font-semibold leading-tight sm:text-5xl",
          dark ? "text-ink" : "text-paper"
        )}
      >
        {title}
      </h1>
      {subtitle ? (
        <p
          className={cn(
            "mt-4 text-sm leading-relaxed sm:text-base",
            dark ? "text-ink-muted" : "text-paper/75"
          )}
        >
          {subtitle}
        </p>
      ) : null}
      <OrnamentLine className="mx-auto mt-7 max-w-xl" />
    </div>
  );
}