import ArchiveHeader from "@/components/ui/ArchiveHeader";
import LiveHub from "@/components/live/LiveHub";
import {
  getPerspectives,
  getScenarios,
  getStory,
} from "@/lib/data";

export default async function LivePage(props: PageProps<"/live">) {
  const searchParams = await props.searchParams;
  const roleParam = typeof searchParams.role === "string" ? searchParams.role : undefined;
  const allScenarios = getScenarios();
  const perspectives = getPerspectives();

  const roles = perspectives.map((p) => ({
    id: p.id,
    role: p.role,
    tagline: p.tagline,
    momentCount: allScenarios.filter((s) => s.perspectiveId === p.id).length,
  }));

  const validRole = perspectives.find((p) => p.id === roleParam)?.id;

  const moments = validRole
    ? allScenarios
        .filter((s) => s.perspectiveId === validRole)
        .map((s) => {
          const story = s.storyId ? getStory(s.storyId) : undefined;
          return {
            scenarioId: s.id,
            scenarioTitle: s.title,
            scenarioTagline: s.tagline,
            disclaimer: s.disclaimer,
            storyId: s.storyId,
            storyTitle: story?.title,
            displayDate: story?.displayDate,
            location: story?.location,
          };
        })
    : [];

  return (
    <>
      <ArchiveHeader
        kicker="Live Through History"
        title="Whose life will you enter?"
        subtitle="Six lives, twelve moments. Choose a perspective, then a moment in time — and live it."
      />
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <LiveHub roles={roles} moments={moments} initialRole={validRole} />
      </section>
    </>
  );
}