import ArchiveHeader from "@/components/ui/ArchiveHeader";
import AtlasExplorer from "@/components/explore/AtlasExplorer";
import { getRegions, getEras, getPeriods, stories } from "@/lib/data";

export default function ExplorePage() {
  const regions = getRegions();
  const eras = getEras();
  const periods = getPeriods();

  return (
    <>
      <ArchiveHeader
        kicker="Choose your way in"
        title="Explore the Atlas"
        subtitle="An archive you can walk into — region by region, era by era. Maharashtra and the rise of Swarajya are open; the rest of the atlas joins as it is built."
      />

      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <AtlasExplorer regions={regions} eras={eras} periods={periods} stories={stories} />
      </section>
    </>
  );
}