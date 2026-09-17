"use client";

import dynamic from "next/dynamic";
import { useIsWebGLAvailable } from "./sceneUtils";

const HeroCanvas = dynamic(() => import("./HeroCanvas"), {
  ssr: false,
  loading: () => null,
});

export default function Hero3D() {
  const enabled = useIsWebGLAvailable();

  if (!enabled) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-[5] opacity-90"
    >
      <HeroCanvas />
    </div>
  );
}