import Hero from "@/components/home/Hero";
import FeatureCards from "@/components/home/FeatureCards";
import SameEventSection from "@/components/home/SameEventSection";
import JourneyPanel from "@/components/home/JourneyPanel";
import ArchiveButton from "@/components/ui/ArchiveButton";
import SectionTitle from "@/components/ui/SectionTitle";
import { getPeriod } from "@/lib/data";

export default function HomePage() {
  const period = getPeriod("maharashtra-17th-century");

  return (
    <>
      <Hero />

      <FeatureCards />

      <SameEventSection />

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
          <div>
            <SectionTitle
              align="left"
              kicker="Start exploring"
              title={period.title}
              subtitle={period.description}
            />
            <div className="mt-8 flex flex-wrap gap-4">
              <ArchiveButton href="/explore">Explore the atlas</ArchiveButton>
              <ArchiveButton href="/timeline" variant="outline">
                View the timeline
              </ArchiveButton>
            </div>
          </div>
          <JourneyPanel />
        </div>
      </section>

      <section className="border-t border-ink-soft/20 bg-ink text-paper">
        <div className="mx-auto max-w-6xl px-4 py-14 text-center sm:px-6">
          <SectionTitle
            tone="paper"
            kicker="How it works"
            title="A document you can step inside."
            subtitle="Traditional history asks: event, date, famous person. Histora asks: region, era, subject, place, perspective, experience and evidence."
          />
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            {[
              ["Region", "→"],
              ["Era", "→"],
              ["Subject", "→"],
              ["Place", "→"],
              ["Perspective", "→"],
              ["Evidence"],
            ].map(([label, arrow]) => (
              <span
                key={label}
                className="flex items-center gap-3 text-[0.68rem] uppercase tracking-[0.18em]"
              >
                <span className="border border-bronze/50 px-3 py-2 font-display text-sm tracking-wider text-paper">
                  {label}
                </span>
                {arrow ? <span className="text-bronze">{arrow}</span> : null}
              </span>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}