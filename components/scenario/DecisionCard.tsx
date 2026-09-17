import { motion } from "motion/react";
import { ServerCrash } from "lucide-react";
import type { ScenarioChoice } from "@/lib/types";
import { cn } from "@/lib/utils";

interface DecisionCardProps {
  choice: ScenarioChoice;
  disabled?: boolean;
  onChoose: (choice: ScenarioChoice) => void;
}

export default function DecisionCard({ choice, disabled, onChoose }: DecisionCardProps) {
  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      disabled={disabled}
      onClick={() => onChoose(choice)}
      className={cn(
        "group relative flex flex-col border border-ink-soft/30 bg-paper/80 p-5 text-left transition-all duration-300",
        "hover:-translate-y-1 hover:border-bronze hover:shadow-paper",
        disabled && "pointer-events-none opacity-40"
      )}
    >
      <span className="pointer-events-none absolute right-4 top-4 flex h-8 w-8 rotate-45 items-center justify-center border border-bronze/60 text-bronze opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <span className="-rotate-45 font-display text-lg font-semibold">→</span>
      </span>

      <span className="text-[0.58rem] font-semibold uppercase tracking-[0.24em] text-bronze">
        Decision
      </span>
      <h4 className="font-display mt-1.5 text-xl font-semibold leading-snug text-ink">
        {choice.label}
      </h4>
      <p className="mt-2 text-sm leading-relaxed text-ink-muted">{choice.summary}</p>

      <span className="mt-4 flex flex-wrap gap-x-3 gap-y-1">
        {choice.stateDelta &&
          Object.entries(choice.stateDelta).map(([key, val]) => (
            <span
              key={key}
              className="text-[0.58rem] uppercase tracking-[0.16em] text-ink-muted"
            >
              {key}{" "}
              <span className={val > 0 ? "text-bronze" : "text-ink-soft"}>
                {val > 0 ? "+" : ""}
                {val}
              </span>
            </span>
          ))}
      </span>
      <ServerCrash className="absolute bottom-4 right-5 hidden h-4 w-4 text-ink-faint" />
    </motion.button>
  );
}