"use client";

import { useCallback, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useReducedMotion } from "motion/react";
import { Rotate3d } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsWebGLAvailable, useSceneQuality } from "./sceneUtils";
import SceneControls from "./SceneControls";
import SceneFallback, { type SceneFallbackSource } from "./SceneFallback";
import type { HistoricalHotspot, ModelTransform } from "@/lib/sites";

const PratapgadScene = dynamic(() => import("./PratapgadScene"), {
  ssr: false,
  loading: () => null,
});

export interface HistoricalSceneProps {
  title: string;
  location?: string;
  dateText?: string;
  description: string;
  contextText?: string;
  sources: SceneFallbackSource[];
  modelPath?: string;
  transform?: ModelTransform;
  hotspots: HistoricalHotspot[];
  recordHref?: string;
  className?: string;
}

type SceneMode = "probing" | "model" | "procedural";

async function probeModel(path: string): Promise<boolean> {
  try {
    if (typeof window === "undefined") return false;
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), 8000);
    const res = await fetch(path, { method: "HEAD", cache: "no-store", signal: controller.signal });
    window.clearTimeout(timer);
    return res.ok;
  } catch {
    return false;
  }
}

export default function HistoricalScene({
  title,
  location,
  dateText,
  description,
  contextText,
  sources,
  modelPath,
  transform,
  hotspots,
  recordHref,
  className,
}: HistoricalSceneProps) {
  const reduced = useReducedMotion();
  const webglOK = useIsWebGLAvailable();
  const quality = useSceneQuality();

  const [mode, setMode] = useState<SceneMode>(() =>
    modelPath ? "probing" : "procedural"
  );
  const [modelReady, setModelReady] = useState(false);
  const [drift, setDrift] = useState(true);
  const [zoomIn, setZoomIn] = useState(0);
  const [zoomOut, setZoomOut] = useState(0);
  const [reset, setReset] = useState(0);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    if (!modelPath) return;
    let live = true;
    (async () => {
      const ok = await probeModel(modelPath);
      if (!live) return;
      setMode(ok ? "model" : "procedural");
    })();
    return () => {
      live = false;
    };
  }, [modelPath]);

  const onModelReady = useCallback(() => setModelReady(true), []);
  const onModelError = useCallback(() => setMode("procedural"), []);
  const onSelectHotspot = useCallback((id: string | null) => {
    setActiveId((current) => (id === null ? null : current === id ? null : id));
  }, []);

  if (!webglOK) {
    return (
      <figure className={cn("scene-panel", className)}>
        <SceneFallback
          title={title}
          locationLabel={location}
          dateText={dateText}
          description={description}
          contextText={contextText}
          sources={sources}
        />
        <figcaption className="mt-2 flex items-start justify-between gap-4 text-[0.58rem] uppercase tracking-[0.2em] text-ink-muted">
          <span>
            Historical visualization — this 3D environment requires WebGL to render.
          </span>
          <span className="shrink-0">Illustration fallback</span>
        </figcaption>
      </figure>
    );
  }

  const driftEnabled = drift && !reduced;
  const surveying = mode === "model" && !modelReady;
  const fallbackNotice = mode === "procedural" && Boolean(modelPath);

  return (
    <figure className={cn("scene-panel", className)}>
      <div
        className="scene-stage relative"
        role="img"
        aria-label={`Interactive 3D view of ${title}. Use the controls to rotate, zoom and reset the view.`}
      >
        <PratapgadScene
          mode={mode}
          modelPath={modelPath ?? ""}
          transform={transform}
          hotspots={hotspots}
          activeHotspotId={activeId}
          onSelectHotspot={onSelectHotspot}
          driftEnabled={driftEnabled}
          zoomInSignal={zoomIn}
          zoomOutSignal={zoomOut}
          resetSignal={reset}
          reduced={Boolean(reduced)}
          quality={quality}
          recordHref={recordHref}
          onModelReady={onModelReady}
          onModelError={onModelError}
        />

        {surveying ? (
          <div className="absolute inset-0 z-30 grid place-items-center bg-paper/60">
            <div className="text-center">
              <p className="scene-survey">SURVEYING THE FORT···</p>
              <div className="scene-loadbar mx-auto mt-3" aria-hidden="true" />
            </div>
          </div>
        ) : null}

        <span className="pointer-events-none absolute left-3 top-3 z-10 flex items-center gap-1.5 bg-paper/70 px-2 py-1 text-[0.58rem] font-semibold uppercase tracking-[0.22em] text-ink-muted">
          <Rotate3d className="h-3 w-3" strokeWidth={1.6} />
          Drag to explore · scroll to zoom
        </span>

        <SceneControls
          driftActive={driftEnabled}
          driftDisabled={Boolean(reduced)}
          onToggleDrift={() => setDrift((v) => !v)}
          onZoomIn={() => setZoomIn((v) => v + 1)}
          onZoomOut={() => setZoomOut((v) => v + 1)}
          onReset={() => {
            setReset((v) => v + 1);
            setActiveId(null);
          }}
        />

        {fallbackNotice ? (
          <span className="absolute bottom-2 left-3 z-10 bg-bronze/15 px-2 py-1 text-[0.55rem] font-semibold uppercase tracking-[0.22em] text-bronze">
            Procedural fallback — awaiting pratapgad.glb
          </span>
        ) : null}
      </div>

      <figcaption className="mt-2 flex items-start justify-between gap-4 text-[0.58rem] uppercase tracking-[0.2em] text-ink-muted">
        <span>
          HISTORICAL VISUALIZATION · This 3D environment is a stylized visualization
          for learning and exploration. It is not presented as an archaeologically
          exact reconstruction.
        </span>
        {location && dateText ? (
          <span className="shrink-0">{dateText} · {location}</span>
        ) : null}
      </figcaption>
    </figure>
  );
}