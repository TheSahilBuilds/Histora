import Link from "next/link";
import { Landmark } from "lucide-react";
import { OrnamentLine } from "@/components/ui/Ornament";
import { getSources } from "@/lib/data";

const COLUMNS = [
  {
    heading: "Explore",
    links: [
      { label: "Explore the Atlas", href: "/explore" },
      { label: "Historical Map", href: "/map" },
      { label: "Timeline", href: "/timeline" },
      { label: "Perspectives", href: "/perspectives" },
    ],
  },
  {
    heading: "Learn",
    links: [
      { label: "Live Through History", href: "/live" },
      { label: "Historical Guide", href: "/guide" },
      { label: "Sources & Evidence", href: "/sources" },
    ],
  },
];

export default function Footer() {
  const documentedSourceCount = getSources().filter((s) => s.verified).length;

  return (
    <footer className="relative z-10 border-t border-ink-soft/30 bg-ink text-paper">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center border border-bronze/70 text-bronze">
                <Landmark className="h-4.5 w-4.5" strokeWidth={1.5} />
              </span>
              <span className="flex flex-col leading-none">
                <span className="font-display text-xl font-semibold text-paper">
                  Histora
                </span>
                <span className="text-[0.54rem] uppercase tracking-[0.3em] text-paper/50">
                  History from below
                </span>
              </span>
            </Link>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-paper/70">
              An interactive historical atlas. Begin with Maharashtra and the
              rise of Swarajya in the seventeenth century — then step into India
              1857 — through timelines, maps, personal perspectives, evidence,
              and interactive stories. Documented fact, interpretation, and
              clearly-labelled fiction are always kept apart.
            </p>
            <p className="mt-3 text-[0.68rem] uppercase tracking-[0.18em] text-paper/45">
              {documentedSourceCount} curated sources · prototype build
            </p>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.heading}>
              <h3 className="text-[0.62rem] font-semibold uppercase tracking-[0.3em] text-bronze">
                {col.heading}
              </h3>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-paper/70 transition-colors hover:text-paper"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <OrnamentLine className="my-8" />

        <div className="flex flex-col gap-2 text-[0.68rem] leading-relaxed text-paper/45 sm:flex-row sm:items-center sm:justify-between">
          <p>
            &ldquo;History is not only what happened. It is what people
            experienced.&rdquo;
          </p>
          <p>Histora — an educational prototype. Reconstructions are labelled.</p>
        </div>
      </div>
    </footer>
  );
}