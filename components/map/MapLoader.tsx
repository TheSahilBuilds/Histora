"use client";

import dynamic from "next/dynamic";
import type { MapMarker } from "@/lib/types";

const HistoricalMap = dynamic(() => import("@/components/map/HistoricalMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[440px] items-center justify-center border border-ink-soft/30 bg-paper sm:h-[540px]">
      <p className="flex items-center gap-3 text-[0.68rem] uppercase tracking-[0.26em] text-ink-muted">
        <span className="inline-block h-3 w-3 animate-spin rounded-full border border-bronze border-t-transparent" />
        Surveying the map...
      </p>
    </div>
  ),
});

interface MapLoaderProps {
  markers: MapMarker[];
  initialMarkerId?: string;
  center?: [number, number];
  zoom?: number;
  compact?: boolean;
}

export default function MapLoader({
  markers,
  initialMarkerId,
  center,
  zoom,
  compact = false,
}: MapLoaderProps) {
  return (
    <HistoricalMap
      markers={markers}
      initialMarkerId={initialMarkerId}
      center={center}
      zoom={zoom}
      compact={compact}
    />
  );
}