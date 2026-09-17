import ArchiveHeader from "@/components/ui/ArchiveHeader";
import Timeline from "@/components/timeline/Timeline";
import { getStory, getStories, getEvents, getPeriod } from "@/lib/data";

export default async function TimelinePage(props: PageProps<"/timeline">) {
  const searchParams = await props.searchParams;
  const event = typeof searchParams.event === "string" ? searchParams.event : undefined;

  const maharashtra = getPeriod("maharashtra-17th-century");
  const india1857 = getPeriod("india-1857");

  const storyItems = getStories(maharashtra.id).map((s) => ({
    id: s.id,
    displayDate: s.displayDate,
    title: s.title,
    location: s.location,
    description: s.shortDescription,
    category: s.category,
    href: `/story/${s.id}`,
    kind: "story" as const,
  }));

  const eventItems = getEvents(india1857.id).map((e) => ({
    id: e.id,
    displayDate: e.displayDate,
    title: e.title,
    location: e.location,
    description: e.description,
    category: e.category,
    href: `/explore?event=${e.id}`,
    kind: "event" as const,
  }));

  const groups = [
    {
      id: maharashtra.id,
      label: "Chhatrapati Shivaji Maharaj",
      sublabel: "Maharashtra — 17th century",
      items: storyItems,
    },
    {
      id: india1857.id,
      label: "India, 1857",
      sublabel: "Nineteenth century — prototype",
      items: eventItems,
    },
  ];

  const initialGroupId = event
    ? getStory(event)
      ? maharashtra.id
      : india1857.id
    : undefined;

  return (
    <>
      <ArchiveHeader
        kicker="Research examines the record"
        title="The Timeline"
        subtitle="Events in the order they unfolded — from the rise of Swarajya to the upheaval of 1857 — each reconstructed from documented sources. Choose a period, then open any record."
      />

      <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
        <Timeline groups={groups} initialGroupId={initialGroupId} initialItemId={event} />
      </section>

      <section className="mx-auto max-w-4xl px-4 pb-16 text-center sm:px-6">
        <p className="text-xs leading-relaxed text-ink-muted">
          Each line is a curated moment, not an exhaustive history, and scholarly dates differ
          slightly at the margins. Every record links to a source so you can follow the evidence
          for yourself.
        </p>
      </section>
    </>
  );
}