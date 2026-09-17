import ArchiveHeader from "@/components/ui/ArchiveHeader";
import PerspectiveCard from "@/components/perspectives/PerspectiveCard";
import { getPerspectives } from "@/lib/data";
import { Shrink } from "lucide-react";

export default function PerspectivesPage() {
  const pvs = getPerspectives();

  return (
    <>
      <ArchiveHeader
        kicker="History from below"
        title="Six ways of reading the same events"
        subtitle="From the ruler's ramparts to the commoner's threshold — six social worlds through which the same history looks different. Every perspective is a fictional reconstruction built from documented conditions of the seventeenth-century Deccan, not a claim about a real individual."
      />

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {pvs.map((p, i) => (
            <PerspectiveCard key={p.id} pov={p} index={i} />
          ))}
        </div>

        <div className="mt-12 border border-bronze/40 bg-paper/60 p-6 sm:p-8">
          <h2 className="flex items-center gap-2.5 font-display text-2xl font-semibold text-ink">
            <Shrink className="h-5 w-5 text-bronze" strokeWidth={1.5} />
            How these lives work
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-ink-muted">
            Each perspective opens into &ldquo;Live Through History&rdquo; — moments across the
            story of Swarajya where you step into that life and make decisions. The decisions are
            fictional, but every situation — a fort seized, a siege endured, a port raided, a
            coronation witnessed — is drawn from documented conditions, and each is checked
            against sources and real outcomes. The persona is a tool for empathy and evidence,
            never a claim about a real individual.
          </p>
        </div>
      </section>
    </>
  );
}