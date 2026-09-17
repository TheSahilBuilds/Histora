import ArchiveHeader from "@/components/ui/ArchiveHeader";
import MapLoader from "@/components/map/MapLoader";
import { getLocationMarkers, getStoryMarkers, getStory, getLocation } from "@/lib/data";

export default async function MapPage(props: PageProps<"/map">) {
  const searchParams = await props.searchParams;
  const loc = typeof searchParams.loc === "string" ? searchParams.loc : undefined;
  const event = typeof searchParams.event === "string" ? searchParams.event : undefined;

  const placeMarkers = getLocationMarkers();
  const storyMarkers = getStoryMarkers();
  const markers = [...placeMarkers, ...storyMarkers];

  const initialMarkerId = event ?? loc;
  const subject = event ? getStory(event) : loc ? getLocation(loc) : undefined;

  return (
    <>
      <ArchiveHeader
        kicker="Geography frames the story"
        title="The Historical Map"
        subtitle="Fortresses, cities and the moments that became stories. Click a marker to open its record — stories, perspectives and timeline connections."
      />

      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <MapLoader markers={markers} initialMarkerId={initialMarkerId} center={[19.2, 75.6]} zoom={5} />
      </section>

      {subject ? (
        <section className="mx-auto max-w-6xl px-4 pb-8 sm:px-6">
          <div className="parchment parchment-deckle p-6">
            <p className="text-[0.6rem] uppercase tracking-[0.26em] text-bronze">Focused record</p>
            {"title" in subject ? (
              <>
                <h3 className="font-display mt-1 text-2xl font-semibold text-ink">{subject.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted">{subject.shortDescription}</p>
                <p className="mt-3 text-[0.62rem] uppercase tracking-[0.2em] text-ink-soft">
                  {subject.displayDate} · {subject.location}
                </p>
              </>
            ) : (
              <>
                <h3 className="font-display mt-1 text-2xl font-semibold text-ink">{subject.name}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted">{subject.description}</p>
                <p className="mt-3 text-[0.62rem] uppercase tracking-[0.2em] text-ink-soft">
                  {subject.region} · {subject.tagline}
                </p>
              </>
            )}
          </div>
        </section>
      ) : null}

      <section className="mx-auto max-w-4xl px-4 pb-8 text-center sm:px-6">
        <p className="text-xs leading-relaxed text-ink-muted">
          The map is a simplified period layout: it places documented places and story
          locations on a modern geographic base and colours it like an archival map. It
          is a teaching instrument, not a reconstruction of seventeenth-century or
          mid-nineteenth-century cartography.
        </p>
      </section>
    </>
  );
}