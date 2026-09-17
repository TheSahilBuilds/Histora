import { notFound } from "next/navigation";
import { getPeriod, getEvents, getPeople, getLocations } from "@/lib/data";
import ArchiveHeader from "@/components/ui/ArchiveHeader";
import HistoricalCard from "@/components/ui/HistoricalCard";
import ArchiveButton from "@/components/ui/ArchiveButton";
import JourneyPanel from "@/components/home/JourneyPanel";
import { Clock3, Map as MapIcon, Users2, Compass, Landmark, Film, Globe2, ScrollText } from "lucide-react";

export default async function PeriodPage(props: PageProps<"/period/[id]">) {
  const { id } = await props.params;
  const period = getPeriod(id);
  if (!period) notFound();

  const events = getEvents(id);
  const people = getPeople(id);
  const locations = getLocations();

  const sections = [
    {
      icon: Clock3,
      title: "Timeline",
      blurb: `${events.length} documented moments, each linked to evidence.`,
      cta: "View the timeline",
      href: "/timeline",
    },
    {
      icon: MapIcon,
      title: "Map",
      blurb: `${locations.length} places on a period map — click to see events and people.`,
      cta: "Open the map",
      href: "/map",
    },
    {
      icon: Users2,
      title: "People",
      blurb: `${people.length} social perspectives from soldier to ruler.`,
      cta: "Meet the people",
      href: "/perspectives",
    },
    {
      icon: Film,
      title: "Live Through History",
      blurb: "Interactive scenarios in which you make the decisions of a fictional person of the time.",
      cta: "Begin a scenario",
      href: "/perspectives",
    },
  ];

  const overview = [
    {
      icon: ScrollText,
      title: "Important events",
      items: period.overview.importantEvents,
    },
    {
      icon: Globe2,
      title: "Major regions",
      items: period.overview.majorRegions,
    },
    {
      icon: Users2,
      title: "Social groups",
      items: period.overview.socialGroups,
    },
    {
      icon: Landmark,
      title: "Historical context",
      items: period.overview.context,
    },
  ];

  return (
    <>
      <ArchiveHeader
        kicker={period.era}
        title={period.title}
        subtitle={period.subtitle}
      />

      <section className="mx-auto max-w-6xl px-4 pb-12 sm:px-6">
        <p className="mx-auto mt-8 max-w-2xl text-center text-sm italic leading-relaxed text-ink-muted">
          &ldquo;{period.tagline}&rdquo;
        </p>
        <p className="mx-auto mt-3 max-w-3xl text-center text-sm leading-relaxed text-ink-muted">
          {period.description}
        </p>

        <section className="mt-12 rounded grid gap-6 lg:grid-cols-2">
          {sections.map((s) => (
            <HistoricalCard key={s.title} interactive deckle className="p-7">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="flex h-11 w-11 items-center justify-center border border-bronze/50 text-bronze">
                    <s.icon className="h-5 w-5" strokeWidth={1.5} />
                  </span>
                  <h2 className="font-display mt-4 text-2xl font-semibold text-ink">{s.title}</h2>
                  <p className="mt-1.5 text-sm text-ink-muted">{s.blurb}</p>
                </div>
              </div>
              <div className="mt-5">
                <ArchiveButton href={s.href} variant="outline" size="sm">
                  {s.cta}
                </ArchiveButton>
              </div>
              <div className="pointer-events-none absolute left-6 top-6 text-[0.55rem] uppercase tracking-[0.24em] text-ink-faint">
                index
              </div>
            </HistoricalCard>
          ))}
        </section>
      </section>

      <section className="border-y border-ink-soft/20 bg-paper">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <h2 className="font-display text-center text-3xl font-semibold text-ink sm:text-4xl">
            Historical Overview
          </h2>
          <div className="mx-auto mt-2 h-px max-w-md bg-ink-soft/25" />
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {overview.map((blk) => (
              <HistoricalCard key={blk.title} className="p-6">
                <h3 className="flex items-center gap-2.5 text-[0.66rem] font-semibold uppercase tracking-[0.24em] text-bronze">
                  <blk.icon className="h-4 w-4" strokeWidth={1.5} />
                  {blk.title}
                </h3>
                <ul className="mt-4 space-y-3">
                  {blk.items.map((item, i) => (
                    <li key={i} className="flex gap-3 text-sm leading-relaxed text-ink-muted">
                      <span className="mt-[0.45rem] h-1.5 w-1.5 shrink-0 rotate-45 bg-bronze/70" />
                      {item}
                    </li>
                  ))}
                </ul>
              </HistoricalCard>
            ))}
          </div>

          <div className="mt-12 flex flex-wrap justify-center gap-4">
            <ArchiveButton href="/perspectives">
              <Compass className="h-4 w-4" strokeWidth={1.5} />
              Live Through History
            </ArchiveButton>
            <ArchiveButton href="/sources" variant="outline">
              Sources &amp; evidence
            </ArchiveButton>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <JourneyPanel />
      </section>
    </>
  );
}

export async function generateStaticParams() {
  return [{ id: "india-1857" }];
}