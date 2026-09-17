import ArchiveHeader from "@/components/ui/ArchiveHeader";
import SourcesGrid from "@/components/sources/SourcesGrid";
import { getSources } from "@/lib/data";
import { BadgeCheck, AlertTriangle, FlaskConical } from "lucide-react";

export default async function SourcesPage(props: PageProps<"/sources">) {
  const searchParams = await props.searchParams;
  const source = typeof searchParams.source === "string" ? searchParams.source : undefined;
  const event = typeof searchParams.event === "string" ? searchParams.event : undefined;
  const sources = getSources();

  return (
    <>
      <ArchiveHeader
        kicker="Evidence before interpretation"
        title="Sources & Evidence"
        subtitle="Every claim in Histora traces back to a source. Some records are verified; some are placeholders awaiting exact archive references; one is a demonstration document so you can see the viewer at work."
      />

      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="mb-10 flex flex-wrap justify-center gap-3">
          <span className="flex items-center gap-2 border border-bronze/50 px-3 py-2 text-[0.64rem] font-semibold uppercase tracking-[0.18em] text-ink-soft">
            <BadgeCheck className="h-4 w-4 text-bronze" strokeWidth={1.5} />
            Verified sources
          </span>
          <span className="flex items-center gap-2 border border-ink-soft/30 px-3 py-2 text-[0.64rem] font-semibold uppercase tracking-[0.18em] text-ink-muted">
            <AlertTriangle className="h-4 w-4 text-bronze" strokeWidth={1.5} />
            Placeholder references
          </span>
          <span className="flex items-center gap-2 border border-ink-soft/30 px-3 py-2 text-[0.64rem] font-semibold uppercase tracking-[0.18em] text-ink-muted">
            <FlaskConical className="h-4 w-4 text-bronze" strokeWidth={1.5} />
            Demonstration document
          </span>
        </div>

        <SourcesGrid sources={sources} initialSourceId={source} initialEventId={event} />

        <div className="mt-12 border border-ink-soft/25 bg-paper/60 p-6 sm:p-8">
          <h2 className="font-display text-2xl font-semibold text-ink">A note on sources</h2>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-ink-muted">
            Histora distinguishes at every step between <strong className="text-ink-soft">documented
            fact</strong> (claims anchored in cited evidence), <strong className="text-ink-soft">interpretation</strong>{" "}
            (how historians read that evidence, which can differ), and{" "}
            <strong className="text-ink-soft">fictional reconstruction</strong> (the lives in
            &ldquo;Live Through History,&rdquo; invented persons placed inside documented
            conditions). This prototype carries a few records marked as placeholders so nothing is
            ever presented as verified before it truly is.
          </p>
        </div>
      </section>
    </>
  );
}