import ArchiveHeader from "@/components/ui/ArchiveHeader";
import HistoricalGuide from "@/components/guide/HistoricalGuide";
import { guideQA } from "@/lib/data";

export default function GuidePage() {
  const starters = guideQA.slice(0, 6).map((q) => ({ question: q.question }));

  return (
    <>
      <ArchiveHeader
        kicker="Ask the archive"
        title="The Historical Guide"
        subtitle="A research companion for India 1857. It answers from this archive's curated dataset, distinguishes documented fact from interpretation, and always points you toward the sources."
      />

      <section className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <HistoricalGuide starters={starters} />
        <p className="mt-5 text-center text-xs leading-relaxed text-ink-muted">
          The Guide is a simulation built on a fixed set of verified answers. When a question has
          no confident match it says so, and suggests where to look instead.
        </p>
      </section>
    </>
  );
}