"use client";

import { Minus, Plus, Rotate3d, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SceneControlsProps {
  driftActive: boolean;
  driftDisabled: boolean;
  onToggleDrift: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
}

export default function SceneControls({
  driftActive,
  driftDisabled,
  onToggleDrift,
  onZoomIn,
  onZoomOut,
  onReset,
}: SceneControlsProps) {
  return (
    <div className="pointer-events-auto absolute right-3 top-3 z-20 flex flex-col gap-1.5">
      <button
        type="button"
        aria-pressed={driftActive}
        aria-label={driftActive ? "Pause slow drift" : "Start slow drift"}
        title="Rotate"
        disabled={driftDisabled}
        onClick={onToggleDrift}
        className={cn(
          "scene-control",
          driftActive && "border-bronze text-bronze",
          driftDisabled && "cursor-not-allowed opacity-40"
        )}
      >
        <Rotate3d className="h-4 w-4" strokeWidth={1.6} />
      </button>
      <button
        type="button"
        aria-label="Zoom in"
        title="Zoom in"
        onClick={onZoomIn}
        className="scene-control"
      >
        <Plus className="h-4 w-4" strokeWidth={1.6} />
      </button>
      <button
        type="button"
        aria-label="Zoom out"
        title="Zoom out"
        onClick={onZoomOut}
        className="scene-control"
      >
        <Minus className="h-4 w-4" strokeWidth={1.6} />
      </button>
      <button
        type="button"
        aria-label="Reset view"
        title="Reset view"
        onClick={onReset}
        className="scene-control"
      >
        <RotateCcw className="h-4 w-4" strokeWidth={1.6} />
      </button>
    </div>
  );
}