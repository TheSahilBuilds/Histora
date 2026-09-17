import { notFound } from "next/navigation";
import { getScenario, getScenarios } from "@/lib/data";
import ScenarioEngine from "@/components/scenario/ScenarioEngine";
import ArchiveHeader from "@/components/ui/ArchiveHeader";

export default async function ScenarioPage(props: PageProps<"/scenario/[id]">) {
  const { id } = await props.params;
  const scenario = getScenario(id);
  if (!scenario) notFound();

  return (
    <>
      <ArchiveHeader
        kicker="Live Through History"
        title={scenario.title}
        subtitle={scenario.tagline}
      />
      <section className="px-4 py-10 sm:px-6">
        <ScenarioEngine scenario={scenario} />
      </section>
    </>
  );
}

export async function generateStaticParams() {
  return getScenarios().map((s) => ({ id: s.id }));
}