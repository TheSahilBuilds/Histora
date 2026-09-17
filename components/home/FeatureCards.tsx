import Link from "next/link";
import HistoricalCard from "@/components/ui/HistoricalCard";
import SectionTitle from "@/components/ui/SectionTitle";
import { Map, MapPin, Clock3 } from "lucide-react";

const FEATURES = [
  {
    icon: Map,
    title: "Regions",
    blurb: "An atlas you can walk into — begin with a region and follow its eras.",
    href: "/explore",
    cta: "Open the atlas",
  },
  {
    icon: MapPin,
    title: "Places",
    blurb: "Forts, fields and ports — where the past was actually lived.",
    href: "/map",
    cta: "Open the map",
  },
  {
    icon: Clock3,
    title: "Moments",
    blurb: "Travel along a timeline of events and the stories inside them.",
    href: "/timeline",
    cta: "View the timeline",
  },
];

export default function FeatureCards() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <SectionTitle
        kicker="Three ways in"
        title="History is more than dates."
        subtitle="An archive of lived history — not only rulers and battles, but the places, moments and everyday people that made an age real on the ground."
      />

      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {FEATURES.map((f) => (
          <HistoricalCard key={f.title} interactive deckle className="p-7">
            <span className="flex h-12 w-12 items-center justify-center border border-bronze/50 text-bronze">
              <f.icon className="h-6 w-6" strokeWidth={1.4} />
            </span>
            <h3 className="font-display mt-5 text-2xl font-semibold text-ink">{f.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-muted">{f.blurb}</p>
            <Link
              href={f.href}
              className="mt-6 inline-flex items-center gap-2 text-[0.66rem] font-semibold uppercase tracking-[0.2em] text-bronze hover:text-ink-soft"
            >
              {f.cta}
              <span aria-hidden>→</span>
            </Link>
            <div className="pointer-events-none absolute bottom-4 right-5 text-[0.55rem] uppercase tracking-[0.22em] text-ink-faint">
              folio
            </div>
          </HistoricalCard>
        ))}
      </div>
    </section>
  );
}