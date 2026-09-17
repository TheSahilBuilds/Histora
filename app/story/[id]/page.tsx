import { notFound } from "next/navigation";
import Link from "next/link";
import { MapPin, ArrowLeft, ArrowRight, Users2, BookOpen, FileText, Box } from "lucide-react";
import {
  getStory,
  getStories,
  getPerspective,
  getLocation,
  getSourcesForStory,
  getScenarioForStoryAndPerspective,
} from "@/lib/data";
import StoryPovPanel from "@/components/story/StoryPovPanel";
import EvidenceStamp from "@/components/story/EvidenceStamp";
import MapLoader from "@/components/map/MapLoader";
import HistoricalScene from "@/components/3d/HistoricalScene";
import { getSiteForStory } from "@/lib/sites";
import { Chip, Tag } from "@/components/ui/Chip";

export const dynamic = "force-dynamic";

export default async function StoryPage(props: PageProps<"/story/[id]">) {
  const { id } = await props.params;
  const searchParams = await props.searchParams;
  const story = getStory(id);
  if (!story) notFound();

  const perspectiveParam =
    typeof searchParams.perspective === "string" ? searchParams.perspective : undefined;
  const selectedPov =
    story.povs.find((p) => p === perspectiveParam) ?? undefined;
  const pov = selectedPov ? getPerspective(selectedPov) : undefined;

  const periodStories = getStories(story.periodId);
  const idx = periodStories.findIndex((s) => s.id === story.id);
  const prevStory = idx > 0 ? periodStories[idx - 1] : undefined;
  const nextStory = idx >= 0 && idx < periodStories.length - 1 ? periodStories[idx + 1] : undefined;

  const primaryLocation = story.locationIds
    .map((lid) => getLocation(lid))
    .find((l): l is NonNullable<typeof l> => Boolean(l));

  const sources = getSourcesForStory(story.id);
  const liveHref = pov ? getScenarioForStoryAndPerspective(story.id, pov.id)?.id : undefined;

  const site = getSiteForStory(story.id);

  const placeDescription = primaryLocation?.description ?? story.shortDescription;

  return (
    <>
      <section className="relative overflow-hidden parchment-deep">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 10%, rgba(154,107,63,0.22), transparent 55%), radial-gradient(circle at 85% 90%, rgba(154,107,63,0.12), transparent 50%)",
          }}
        />
        <div className="relative mx-auto max-w-5xl px-4 pb-14 pt-28 sm:px-6 sm:pt-32">
          <nav className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[0.6rem] uppercase tracking-[0.22em] text-paper/50">
            <Link href="/explore" className="historical-link text-paper/60 hover:text-paper">
              Explore
            </Link>
            <span>/</span>
            <span>{story.region}</span>
            <span>/</span>
            <span>{story.century}</span>
          </nav>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Chip tone="paper">{story.period}</Chip>
            <Tag>{story.category}</Tag>
          </div>

          <h1 className="font-display mt-6 text-4xl font-semibold leading-tight text-paper sm:text-5xl">
            {story.title}
          </h1>
          <p className="font-display mt-3 max-w-2xl text-lg italic text-paper/80 sm:text-xl">
            {story.shortDescription}
          </p>

          <div className="mt-8 flex flex-wrap items-end justify-between gap-6">
            <div className="flex flex-wrap gap-x-8 gap-y-3 text-[0.62rem] uppercase tracking-[0.18em] text-paper/60">
              <span className="flex flex-col gap-1">
                <span className="text-paper/40">Date</span>
                <span className="text-paper">{story.displayDate}</span>
              </span>
              <span className="flex flex-col gap-1">
                <span className="text-paper/40">Place</span>
                <span className="text-paper">{story.location}</span>
              </span>
              <span className="flex flex-col gap-1">
                <span className="text-paper/40">District</span>
                <span className="text-paper">{story.district}</span>
              </span>
              <span className="flex flex-col gap-1">
                <span className="text-paper/40">Experienced by</span>
                <span className="text-paper capitalize">{story.povs.join(" · ")}</span>
              </span>
            </div>
            <EvidenceStamp evidence={story.evidence} tone="paper" />
          </div>
        </div>
      </section>

      {site ? (
        <section
          aria-label="The place in three dimensions"
          className="mx-auto w-full max-w-6xl scroll-mt-24 px-4 pb-2 pt-12 sm:px-6"
        >
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <span className="flex items-center gap-1.5 text-[0.6rem] font-semibold uppercase tracking-[0.28em] text-bronze">
                <Box className="h-3.5 w-3.5" strokeWidth={1.8} /> The place
              </span>
              <h2 className="font-display mt-2 text-3xl font-semibold leading-tight text-ink sm:text-4xl">
                {site.title.toUpperCase()}
              </h2>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">
                Explore the location where this historical moment unfolded.
              </p>
            </div>
            <p className="text-[0.62rem] uppercase tracking-[0.18em] text-ink-muted">
              {site.date} · {site.location}
            </p>
          </div>

          <HistoricalScene
            className="mt-6"
            title={site.title}
            location={site.location}
            dateText={site.date}
            description={story.shortDescription}
            contextText={placeDescription}
            sources={sources.map((s) => ({
              title: s.title,
              verified: s.verified,
              href: `/sources?event=${story.id}`,
            }))}
            modelPath={site.model}
            transform={site.transform}
            hotspots={site.hotspots}
            recordHref={`/sources?event=${story.id}`}
          />

          <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
            <p className="max-w-2xl text-sm leading-relaxed text-ink-muted">{placeDescription}</p>
            <a
              href="#explore-this-moment"
              className="btn-archive justify-center bg-bronze text-ink-dark hover:bg-bronze/90 sm:text-[0.78rem]"
            >
              Explore this moment
              <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
            </a>
          </div>
        </section>
      ) : null}

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
          <div className="space-y-12">
            <div>
              <span className="text-[0.6rem] font-semibold uppercase tracking-[0.28em] text-bronze">
                In brief
              </span>
              <p className="drop-cap mt-4 max-w-3xl text-base leading-[1.85] text-ink-muted">
                {story.description}
              </p>
            </div>

            <div className="border-t border-ink-soft/20 pt-8">
              <span className="text-[0.6rem] font-semibold uppercase tracking-[0.28em] text-bronze">
                Why it mattered
              </span>
              <p className="mt-4 max-w-3xl text-base leading-[1.85] text-ink-muted">
                {story.significance}
              </p>
            </div>

            <div className="border-t border-ink-soft/20 pt-8">
              <span className="flex items-center gap-2 text-[0.6rem] font-semibold uppercase tracking-[0.28em] text-bronze">
                <Users2 className="h-3.5 w-3.5" strokeWidth={1.8} /> The people
              </span>
              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                {story.people.map((person) => (
                  <div key={person.id} className="parchment p-5">
                    <p className="font-display text-xl font-semibold text-ink">{person.name}</p>
                    <p className="mt-0.5 text-[0.62rem] uppercase tracking-[0.18em] text-bronze">
                      {person.role}
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-ink-muted">{person.note}</p>
                  </div>
                ))}
              </div>
            </div>

            {story.relatedStories.length ? (
              <div className="border-t border-ink-soft/20 pt-8">
                <span className="flex items-center gap-2 text-[0.6rem] font-semibold uppercase tracking-[0.28em] text-bronze">
                  <BookOpen className="h-3.5 w-3.5" strokeWidth={1.8} /> Continuing the thread
                </span>
                <div className="mt-5 flex flex-wrap gap-3">
                  {story.relatedStories.map((rid) => {
                    const s = getStory(rid);
                    if (!s) return null;
                    return (
                      <Link
                        key={rid}
                        href={`/story/${s.id}`}
                        className="group inline-flex items-center gap-3 border border-ink-soft/30 px-4 py-3 transition-colors hover:border-bronze/60 hover:bg-paper"
                      >
                        <span className="font-display text-base text-ink group-hover:text-ink-soft">
                          {s.title}
                        </span>
                        <span className="text-[0.58rem] uppercase tracking-[0.16em] text-ink-muted">
                          {s.displayDate}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ) : null}

            <div className="border-t border-ink-soft/20 pt-8">
              <span className="flex items-center gap-2 text-[0.6rem] font-semibold uppercase tracking-[0.28em] text-bronze">
                <FileText className="h-3.5 w-3.5" strokeWidth={1.8} /> Sources &amp; evidence
              </span>
              <p className="mt-3 max-w-3xl text-xs leading-relaxed text-ink-muted">
                This story is built on the sources below. Sources marked as placeholders
                need verified references before citation.
              </p>
              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                {sources.map((s) => (
                  <div key={s.id} className="border border-ink-soft/25 p-5">
                    <div className="flex items-start justify-between gap-3">
                      <p className="font-display text-lg leading-snug text-ink">{s.title}</p>
                      {s.verified ? (
                        <Chip tone="bronze">Verified</Chip>
                      ) : (
                        <Chip tone="muted">Placeholder</Chip>
                      )}
                    </div>
                    <p className="mt-2 text-[0.62rem] uppercase tracking-[0.16em] text-ink-soft">
                      {s.author} · {s.year}
                    </p>
                    <p className="mt-2.5 text-[0.62rem] uppercase tracking-[0.16em] text-bronze">
                      {s.type} — {s.category}
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-ink-muted">{s.description}</p>
                    {s.placeholder ? (
                      <p className="mt-3 border-l-2 border-bronze/50 pl-3 text-xs leading-relaxed text-ink-muted">
                        {s.placeholder}
                      </p>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <aside id="explore-this-moment" className="scroll-mt-24 space-y-8 lg:sticky lg:top-24">
            <StoryPovPanel
              storyId={story.id}
              storyTitle={story.title}
              povIds={story.povs}
              selectedPov={pov}
              liveHref={liveHref ? `/scenario/${liveHref}` : undefined}
            />

            {primaryLocation ? (
              <div>
                <div className="mb-3 flex items-end justify-between gap-3">
                  <div>
                    <span className="flex items-center gap-1.5 text-[0.6rem] font-semibold uppercase tracking-[0.28em] text-bronze">
                      <MapPin className="h-3.5 w-3.5" strokeWidth={1.8} /> The place
                    </span>
                    <h3 className="font-display mt-1 text-2xl font-semibold text-ink">
                      {primaryLocation.name}
                    </h3>
                  </div>
                  <Link
                    href={`/map?event=${story.id}`}
                    className="historical-link text-[0.6rem] uppercase tracking-[0.18em] text-bronze hover:text-ink-soft"
                  >
                    On the map →
                  </Link>
                </div>
                <MapLoader
                  markers={[
                    {
                      id: primaryLocation.id,
                      title: primaryLocation.name,
                      sub: primaryLocation.tagline,
                      description: primaryLocation.description,
                      lat: primaryLocation.lat,
                      lng: primaryLocation.lng,
                      icon: primaryLocation.icon,
                      locationId: primaryLocation.id,
                      relatedStoryIds: [story.id],
                    },
                  ]}
                  initialMarkerId={primaryLocation.id}
                  center={[primaryLocation.lat, primaryLocation.lng]}
                  zoom={10}
                  compact
                />
              </div>
            ) : null}
          </aside>
        </div>
      </section>

      <section className="border-t border-ink-soft/20 bg-ink text-paper">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-10 sm:px-6 md:grid-cols-2">
          {prevStory ? (
            <Link
              href={`/story/${prevStory.id}`}
              className="group flex flex-col gap-1 border border-paper/15 p-5 transition-colors hover:border-bronze/60"
            >
              <span className="flex items-center gap-2 text-[0.58rem] uppercase tracking-[0.22em] text-paper/45">
                <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.8} /> Earlier
              </span>
              <span className="font-display text-2xl text-paper group-hover:text-bronze">
                {prevStory.title}
              </span>
              <span className="text-[0.62rem] uppercase tracking-[0.16em] text-paper/50">
                {prevStory.displayDate}
              </span>
            </Link>
          ) : (
            <span />
          )}
          {nextStory ? (
            <Link
              href={`/story/${nextStory.id}`}
              className="group flex flex-col items-end gap-1 border border-paper/15 p-5 text-right transition-colors hover:border-bronze/60"
            >
              <span className="flex items-center gap-2 text-[0.58rem] uppercase tracking-[0.22em] text-paper/45">
                Later <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.8} />
              </span>
              <span className="font-display text-2xl text-paper group-hover:text-bronze">
                {nextStory.title}
              </span>
              <span className="text-[0.62rem] uppercase tracking-[0.16em] text-paper/50">
                {nextStory.displayDate}
              </span>
            </Link>
          ) : (
            <span />
          )}
        </div>
      </section>
    </>
  );
}