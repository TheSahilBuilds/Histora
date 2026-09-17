"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import Link from "next/link";
import type { Scenario, ScenarioChoice, StateKey, GameState } from "@/lib/types";
import { useJourney } from "@/lib/store";
import { getSource } from "@/lib/data";
import { cn } from "@/lib/utils";
import DecisionCard from "@/components/scenario/DecisionCard";
import { OrnamentLine } from "@/components/ui/Ornament";
import ArchiveButton from "@/components/ui/ArchiveButton";
import { Chip } from "@/components/ui/Chip";
import {
  ShieldAlert,
  Package,
  Info,
  Footprints,
  Network,
  BookOpenText,
  ScrollText,
  Quote,
  RotateCcw,
} from "lucide-react";

const META_ICONS: Record<StateKey, typeof Package> = {
  safety: ShieldAlert,
  resources: Package,
  information: Info,
  mobility: Footprints,
  connections: Network,
};

const INITIAL_STATE: GameState = { safety: 10, resources: 10, information: 10, mobility: 10, connections: 10 };

function clamp(v: number, min = 0, max = 20) {
  return Math.max(min, Math.min(max, v));
}

type Phase = "intro" | "stage" | "consequence" | "ended";

export default function ScenarioEngine({ scenario }: { scenario: Scenario }) {
  const markPerspectiveExplored = useJourney((s) => s.markPerspectiveExplored);
  const completeScenario = useJourney((s) => s.completeScenario);

  const [phase, setPhase] = useState<Phase>("intro");
  const [stageIndex, setStageIndex] = useState(0);
  const [lastChoice, setLastChoice] = useState<ScenarioChoice | null>(null);
  const [gameState, setGameState] = useState<GameState>(INITIAL_STATE);
  const [decisions, setDecisions] = useState<string[]>([]);

  const stage = scenario.stages[stageIndex];
  const sourceRef = lastChoice?.sourceId ? getSource(lastChoice.sourceId) : undefined;

  useEffect(() => {
    if (phase !== "intro") return;
    const t = window.setTimeout(() => markPerspectiveExplored(scenario.perspectiveId), 400);
    return () => window.clearTimeout(t);
  }, [phase, markPerspectiveExplored, scenario.perspectiveId]);

  const meterMeta = useMemo(() => scenario.variablesMeta, [scenario.variablesMeta]);

  function begin() {
    setPhase("stage");
  }

  function choose(choice: ScenarioChoice) {
    setLastChoice(choice);
    setDecisions((d) => [...d, choice.label]);
    if (choice.stateDelta) {
      setGameState((g) => {
        const next = { ...g };
        (Object.keys(choice.stateDelta!) as StateKey[]).forEach((k) => {
          next[k] = clamp(next[k] + (choice.stateDelta![k] ?? 0));
        });
        return next;
      });
    }
    if (choice.end) {
      completeScenario({
        scenarioId: scenario.id,
        perspectiveId: scenario.perspectiveId,
        title: scenario.title,
        decisions: [...decisions, choice.label],
        completedAt: new Date().toISOString(),
      });
      setTimeout(() => setPhase("ended"), 250);
    } else {
      setPhase("consequence");
    }
  }

  function advance() {
    const next = stageIndex + 1;
    if (next >= scenario.stages.length) {
      setPhase("ended");
    } else {
      setStageIndex(next);
      setPhase("stage");
    }
  }

  function reset() {
    setPhase("intro");
    setStageIndex(0);
    setLastChoice(null);
    setGameState(INITIAL_STATE);
    setDecisions([]);
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3 border border-bronze/40 bg-paper/70 px-5 py-3">
        <p className="flex items-center gap-2 text-[0.6rem] font-semibold uppercase tracking-[0.2em] text-ink">
          <BookOpenText className="h-4 w-4 text-bronze" strokeWidth={1.5} />
          {scenario.roleLabel} <span className="text-ink-faint">·</span> {scenario.title}
        </p>
        <span className="text-[0.58rem] uppercase tracking-[0.2em] text-ink-muted">
          {scenario.tagline}
        </span>
      </div>

      <AnimatePresence mode="wait">
        {phase === "intro" ? (
          <motion.section
            key="intro"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="border border-bronze/50 bg-ink px-6 py-4">
              <p className="flex items-start gap-3 text-xs leading-relaxed text-paper">
                <ScrollText className="mt-0.5 h-4 w-4 shrink-0 text-bronze" strokeWidth={1.5} />
                {scenario.disclaimer}
              </p>
            </div>

            <div className="parchment parchment-deckle mt-8 p-8 sm:p-10">
              <h2 className="font-display text-3xl font-semibold text-ink sm:text-4xl">
                {scenario.title}
              </h2>
              <p className="mt-1 text-xs font-medium uppercase tracking-[0.22em] text-bronze">
                {scenario.tagline}
              </p>

              <div className="mt-7 grid gap-4 sm:grid-cols-2">
                {[
                  ["You are", scenario.intro.youAre],
                  ["Where", scenario.intro.where],
                  ["When", scenario.intro.when],
                  ["The situation", scenario.intro.context],
                ].map(([label, text]) => (
                  <div key={label} className={cn("p-4", label === "The situation" && "sm:col-span-2")}>
                    <span className="text-[0.58rem] font-semibold uppercase tracking-[0.24em] text-bronze">
                      {label}
                    </span>
                    <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">{text}</p>
                  </div>
                ))}
              </div>

              <div className="mt-2 border-t border-ink-soft/20 pt-5">
                {scenario.narrative.map((line, i) => (
                  <p key={i} className="mt-2.5 text-sm italic leading-relaxed text-ink-soft">
                    &ldquo;{line}&rdquo;
                  </p>
                ))}
              </div>

              <OrnamentLine className="mt-7" />

              <div className="mt-6">
                <p className="text-[0.58rem] font-semibold uppercase tracking-[0.24em] text-ink">
                  What the pressure points mean
                </p>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {meterMeta.map((m) => {
                    const Icon = META_ICONS[m.key] ?? Info;
                    return (
                      <div key={m.key} className="flex items-start gap-3 border border-ink-soft/15 p-3">
                        <Icon className="mt-0.5 h-4 w-4 shrink-0 text-bronze" strokeWidth={1.5} />
                        <div>
                          <span className="text-xs font-semibold text-ink">{m.label}</span>
                          <p className="text-[0.78rem] leading-relaxed text-ink-muted">{m.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <p className="mt-4 text-[0.68rem] italic leading-relaxed text-ink-muted">
                  The meters below are a gameplay device to show trade-offs — they are not an
                  attempt to score real history.
                </p>
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <ArchiveButton onClick={begin}>Begin the scenario</ArchiveButton>
                <ArchiveButton href="/perspectives" variant="outline">
                  Back to perspectives
                </ArchiveButton>
              </div>
            </div>
          </motion.section>
        ) : null}

        {phase === "stage" && stage ? (
          <motion.section
            key={`stage-${stage.id}`}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Chip tone="bronze">{stage.day}</Chip>
              <span className="text-[0.58rem] uppercase tracking-[0.2em] text-ink-muted">
                decision {stageIndex + 1} of {scenario.stages.length}
              </span>
            </div>

            <div className="parchment parchment-deckle mt-4 p-7 sm:p-9">
              <h2 className="font-display text-3xl font-semibold text-ink sm:text-4xl">
                {stage.title}
              </h2>
              <p className="mt-4 text-[0.92rem] leading-relaxed text-ink-soft">
                {stage.description}
              </p>
            </div>

            <div className="mt-8 grid gap-5 lg:grid-cols-3">
              {stage.choices.map((choice) => (
                <DecisionCard key={choice.id} choice={choice} onChoose={choose} />
              ))}
            </div>

            <div className="mt-8 grid grid-cols-[auto_1fr] gap-4 border border-ink-soft/20 p-5 sm:grid-cols-[1fr_auto]">
              <div className="grid grid-cols-2 gap-x-6 gap-y-2 sm:grid-cols-5">
                {meterMeta.map((m) => {
                  const Icon = META_ICONS[m.key] ?? Info;
                  return (
                    <div key={m.key} className="flex items-center gap-2">
                      <Icon className="h-3.5 w-3.5 text-bronze" strokeWidth={1.5} />
                      <span className="text-[0.66rem] text-ink-muted">{m.label}</span>
                      <span className="font-display text-sm font-semibold text-ink">
                        {gameState[m.key]}
                      </span>
                    </div>
                  );
                })}
              </div>
              <p className="col-span-2 text-[0.62rem] italic leading-relaxed text-ink-muted sm:col-span-1">
                Your position now. Choose carefully — every act has a consequence.
              </p>
            </div>
          </motion.section>
        ) : null}

        {phase === "consequence" && lastChoice ? (
          <motion.section
            key="consequence"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <div className="flex flex-wrap items-center gap-2">
              <Chip tone="ink">Consequence</Chip>
              <span className="text-[0.58rem] uppercase tracking-[0.2em] text-ink-muted">
                you chose — {lastChoice.label}
              </span>
            </div>

            <div className="parchment parchment-deckle mt-4 p-7 sm:p-9">
              <h2 className="font-display text-3xl font-semibold text-ink">
                What happens next
              </h2>
              <p className="mt-4 text-[0.92rem] leading-relaxed text-ink-soft">
                {lastChoice.consequence}
              </p>

              <div className="mt-6 border-l-2 border-bronze/60 bg-paper/70 p-5">
                <p className="text-[0.58rem] font-semibold uppercase tracking-[0.24em] text-bronze">
                  Historical context
                </p>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                  {lastChoice.historicalContext}
                </p>
              </div>

              {sourceRef ? (
                <div className="mt-5 flex items-start gap-3 text-sm">
                  <Quote className="mt-0.5 h-4 w-4 shrink-0 text-bronze" strokeWidth={1.5} />
                  <p className="text-ink-soft">
                    <span className="text-ink">Source:</span>{" "}
                    <Link href={`/sources?source=${sourceRef.id}`} className="historical-link text-bronze hover:text-ink-soft">
                      {sourceRef.title}
                    </Link>{" "}
                    — {sourceRef.author} ({sourceRef.year})
                  </p>
                </div>
              ) : null}

              <div className="mt-7 flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap gap-2">
                  {meterMeta.map((m) => {
                    const delta = lastChoice.stateDelta?.[m.key] ?? 0;
                    if (!delta) return null;
                    const Icon = META_ICONS[m.key] ?? Info;
                    return (
                      <span key={m.key} className="flex items-center gap-1.5 border border-ink-soft/20 px-2.5 py-1 text-[0.62rem] text-ink-soft">
                        <Icon className="h-3.5 w-3.5" strokeWidth={1.5} />
                        {m.label}{" "}
                        <span className={delta > 0 ? "text-bronze" : "text-ink"}>
                          {delta > 0 ? "+" : ""}
                          {delta}
                        </span>
                      </span>
                    );
                  })}
                </div>
              </div>

              <div className="mt-6">
                <ArchiveButton onClick={advance}>Continue</ArchiveButton>
              </div>
            </div>
          </motion.section>
        ) : null}

        {phase === "ended" ? (
          <motion.section
            key="ended"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="border border-bronze/60 bg-ink px-6 py-5 text-center">
              <h2 className="font-display text-3xl font-semibold text-paper sm:text-4xl">
                {scenario.ending.title}
              </h2>
            </div>

            <div className="parchment parchment-deckle mt-6 p-8 sm:p-10">
              <p className="text-[0.95rem] leading-relaxed text-ink-soft">
                {scenario.ending.text}
              </p>

              <OrnamentLine className="mt-7" />

              <div className="mt-6">
                <p className="text-[0.58rem] font-semibold uppercase tracking-[0.24em] text-bronze">
                  What this life can teach us
                </p>
                <ul className="mt-3 space-y-2.5">
                  {scenario.ending.lessons.map((l, i) => (
                    <li key={i} className="flex gap-3 text-sm leading-relaxed text-ink-muted">
                      <span className="mt-1 text-bronze">*</span>
                      {l}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-7 border-t border-ink-soft/20 pt-5">
                <p className="text-[0.58rem] font-semibold uppercase tracking-[0.24em] text-ink">
                  Your decisions
                </p>
                <ol className="mt-3 space-y-2">
                  {decisions.map((d, i) => (
                    <li key={i} className="flex gap-3 text-sm text-ink-soft">
                      <span className="font-display text-bronze">{String(i + 1).padStart(2, "0")}.</span>
                      {d}
                    </li>
                  ))}
                </ol>
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <ArchiveButton href="/perspectives">Try another perspective</ArchiveButton>
                <ArchiveButton href="/timeline" variant="outline">
                  Back to the timeline
                </ArchiveButton>
                <button
                  type="button"
                  onClick={reset}
                  className="inline-flex items-center gap-2 text-[0.66rem] font-semibold uppercase tracking-[0.2em] text-bronze hover:text-ink-soft"
                >
                  <RotateCcw className="h-3.5 w-3.5" strokeWidth={1.5} />
                  Play again
                </button>
              </div>
            </div>
          </motion.section>
        ) : null}
      </AnimatePresence>
    </div>
  );
}