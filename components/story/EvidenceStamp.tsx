import type { EvidenceClass } from "@/lib/types";
import { cn } from "@/lib/utils";

const EVIDENCE_LABEL: Record<EvidenceClass, string> = {
  "documented-fact": "Documented fact",
  interpretation: "Interpretation",
  "fictional-reconstruction": "Fictional reconstruction",
};

const EVIDENCE_NOTE: Record<EvidenceClass, string> = {
  "documented-fact": "Attested in contemporary records",
  interpretation: "Informed historical judgement",
  "fictional-reconstruction": "Imagined for experience, grounded in documented conditions",
};

interface EvidenceStampProps {
  evidence: EvidenceClass;
  tone?: "natural" | "paper";
  className?: string;
}

export default function EvidenceStamp({ evidence, tone = "natural", className }: EvidenceStampProps) {
  return (
    <div
      className={cn(
        "inline-flex rotate-0 flex-col items-center border-2 px-4 py-2 text-center",
        tone === "paper"
          ? "border-paper/40 text-paper/90"
          : evidence === "documented-fact"
            ? "border-bronze/50 text-bronze"
            : evidence === "interpretation"
              ? "border-ink-soft/50 text-ink-soft"
              : "border-ink-muted/40 text-ink-muted",
        className
      )}
    >
      <span className="text-[0.55rem] font-semibold uppercase tracking-[0.26em] opacity-90">
        {EVIDENCE_LABEL[evidence]}
      </span>
      <span className="mt-0.5 text-[0.5rem] uppercase tracking-[0.18em] opacity-70">
        {EVIDENCE_NOTE[evidence]}
      </span>
    </div>
  );
}