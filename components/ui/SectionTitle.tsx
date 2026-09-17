import { cn } from "@/lib/utils";
import { OrnamentLine, Flourish } from "@/components/ui/Ornament";

interface SectionTitleProps {
  kicker?: string;
  title: string;
  subtitle?: string;
  align?: "center" | "left";
  tone?: "dark" | "paper";
  className?: string;
}

export default function SectionTitle({
  kicker,
  title,
  subtitle,
  align = "center",
  tone = "dark",
  className,
}: SectionTitleProps) {
  const dark = tone === "dark";
  return (
    <div
      className={cn(
        "flex flex-col",
        align === "center" ? "items-center text-center" : "items-start text-left",
        className
      )}
    >
      {kicker ? (
        <span
          className={cn(
            "text-[0.62rem] font-semibold uppercase tracking-[0.32em]",
            dark ? "text-bronze" : "text-paper/70"
          )}
        >
          {kicker}
        </span>
      ) : null}
      <h2
        className={cn(
          "font-display mt-2 text-3xl font-medium leading-tight sm:text-4xl",
          dark ? "text-ink" : "text-paper"
        )}
      >
        {title}
      </h2>
      {subtitle ? (
        <p
          className={cn(
            "mt-3 max-w-2xl text-sm leading-relaxed sm:text-base",
            dark ? "text-ink-muted" : "text-paper/75"
          )}
        >
          {subtitle}
        </p>
      ) : null}
      {align === "center" ? <Flourish className="mt-4" /> : <OrnamentLine className="mt-4 w-48" />}
    </div>
  );
}