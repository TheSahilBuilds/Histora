import Link from "next/link";
import SectionTitle from "@/components/ui/SectionTitle";
import { ArrowDown } from "lucide-react";

const PERSPECTIVES = [
  { role: "The Ruler", pov: "ruler" },
  { role: "The Soldier", pov: "soldier" },
  { role: "The Farmer", pov: "farmer" },
  { role: "The Merchant", pov: "merchant" },
  { role: "The Artisan", pov: "artisan" },
  { role: "The Commoner", pov: "commoner" },
];

export default function SameEventSection() {
  return (
    <section className="border-y border-ink-soft/20 bg-ink text-paper">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <SectionTitle
          tone="paper"
          kicker="The heart of history from below"
          title="Same Moment. Different Experiences."
          subtitle="A fort seized or a coronation witnessed is lived one way on the ramparts, another in the fields and the streets."
        />

        <div className="mt-12 grid items-center gap-8 lg:grid-cols-[220px_1fr]">
          <div className="parchment flex flex-col items-center justify-center gap-2 py-10 text-center">
            <span className="text-[0.6rem] uppercase tracking-[0.3em] text-bronze">
              Maharashtra
            </span>
            <span className="font-display text-3xl font-semibold text-ink">Seventeenth Century</span>
            <span className="max-w-[170px] text-[0.66rem] leading-relaxed text-ink-muted">
              The rise of Swarajya — lived very differently by different people
            </span>
          </div>

          <div className="relative">
            <div className="absolute bottom-0 left-6 top-0 hidden w-px bg-bronze/40 sm:block" />
            <ul className="space-y-1">
              {PERSPECTIVES.map((p) => (
                <li key={p.pov}>
                  <Link
                    href={`/live?role=${p.pov}`}
                    className="group relative flex items-center gap-4 border-b border-paper/10 py-3.5 pl-0 transition-colors sm:pl-16"
                  >
                    <span className="absolute -left-4 hidden h-2 w-2 rotate-45 border border-bronze bg-paper sm:block" />
                    <span className="font-display text-2xl font-medium text-paper/90 transition-colors group-hover:text-bronze sm:text-3xl">
                      {p.role}
                    </span>
                    <span className="ml-auto text-[0.6rem] uppercase tracking-[0.2em] text-paper/40 opacity-0 transition-opacity group-hover:opacity-100">
                      Enter →
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-8 flex items-center gap-3 text-[0.66rem] uppercase tracking-[0.22em] text-paper/45">
              <ArrowDown className="h-4 w-4 text-bronze" strokeWidth={1.5} />
              Live each of these lives
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}