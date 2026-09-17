"use client";

import "leaflet/dist/leaflet.css";
import * as L from "leaflet";
import { MapContainer, TileLayer, Marker, Popup, ZoomControl, useMap } from "react-leaflet";
import { useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import type { MapMarker } from "@/lib/types";
import { getStory } from "@/lib/data";
import { useJourney } from "@/lib/store";
import { Clock3, Users2, Landmark, BookOpen, Eye } from "lucide-react";

const MARKER_COLORS: Record<MapMarker["icon"], string> = {
  fort: "#5C4033",
  city: "#9A6B3F",
  town: "#2B2118",
  pass: "#6B7A4F",
  battle: "#8A3324",
};

function MakeIcon(color: string) {
  return L.divIcon({
    className: "",
    html: `<div style="position:relative;width:26px;height:26px;">
      <div style="position:absolute;inset:0;transform:rotate(45deg);border:2px solid ${color};background:#F3EBDD;box-shadow:0 1px 3px rgba(36,28,21,0.45);"></div>
      <div style="position:absolute;inset:7px;background:${color};transform:rotate(45deg);"></div>
    </div>`,
    iconSize: [26, 26],
    iconAnchor: [13, 13],
    popupAnchor: [0, -16],
  });
}

function SelectedFocus({
  selectedId,
  markersRef,
}: {
  selectedId?: string;
  markersRef: React.MutableRefObject<Record<string, L.Marker>>;
}) {
  const map = useMap();
  useEffect(() => {
    if (!selectedId) return;
    const marker = markersRef.current[selectedId];
    if (!marker) return;
    const latlng = marker.getLatLng();
    map.flyTo(latlng, Math.max(map.getZoom(), 7), { duration: 1.1, easeLinearity: 0.25 });
    const t = window.setTimeout(() => marker.openPopup(), 800);
    return () => window.clearTimeout(t);
  }, [selectedId, map, markersRef]);
  return null;
}

interface HistoricalMapProps {
  markers: MapMarker[];
  initialMarkerId?: string;
  center?: [number, number];
  zoom?: number;
  compact?: boolean;
}

export default function HistoricalMap({
  markers,
  initialMarkerId,
  center = [18.9, 75.4],
  zoom = 6,
  compact = false,
}: HistoricalMapProps) {
  const markersRef = useRef<Record<string, L.Marker>>({});
  const markLocationExplored = useJourney((s) => s.markLocationExplored);

  const icons = useMemo(
    () =>
      Object.fromEntries(
        (Object.keys(MARKER_COLORS) as MapMarker["icon"][]).map((key) => [
          key,
          MakeIcon(MARKER_COLORS[key]),
        ])
      ) as Record<MapMarker["icon"], L.DivIcon>,
    []
  );

  return (
    <div className="relative border border-ink-soft/30 bg-paper shadow-paper">
      <div className={compact ? "historical-map-panel h-[300px] w-full" : "historical-map-panel h-[440px] w-full sm:h-[540px]"}>
        <MapContainer
          center={center}
          zoom={zoom}
          minZoom={5}
          scrollWheelZoom={false}
          className="h-full w-full"
          maxBounds={[
            [8, 68],
            [37, 97],
          ]}
          maxBoundsViscosity={0.9}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            subdomains="abcd"
          />
          {markers.map((m) => {
            const stories = (m.relatedStoryIds ?? [])
              .map((id) => getStory(id))
              .filter((s): s is NonNullable<typeof s> => !!s)
              .sort((a, b) => a.date.localeCompare(b.date, undefined, { numeric: true }));

            return (
              <Marker
                key={m.id}
                position={[m.lat, m.lng]}
                icon={icons[m.icon] ?? icons.town}
                ref={(node) => {
                  if (node) markersRef.current[m.id] = node;
                }}
                eventHandlers={{
                  popupopen: () => markLocationExplored(m.locationId ?? m.id),
                }}
              >
                <Popup closeButton={false} minWidth={260} maxWidth={320} autoPanPadding={[40, 40]}>
                  <div className="px-1 py-1" style={{ fontFamily: "var(--font-sans)" }}>
                    <p className="text-[0.55rem] uppercase tracking-[0.24em] text-bronze">
                      {m.locationId ? "Place" : "Story"} · {m.sub}
                    </p>
                    <h3 className="font-display text-xl font-semibold text-ink">{m.title}</h3>
                    <p className="mt-1 text-xs italic leading-relaxed text-ink-muted">{m.sub}</p>
                    <p className="mt-2 text-xs leading-relaxed text-ink-muted">{m.description}</p>

                    {m.perspectives && m.perspectives.length ? (
                      <div className="mt-3">
                        <p className="flex items-center gap-1.5 text-[0.58rem] font-semibold uppercase tracking-[0.2em] text-ink">
                          <Eye className="h-3 w-3 text-bronze" strokeWidth={1.8} />
                          Perspectives here
                        </p>
                        <div className="mt-1.5 flex flex-wrap gap-1.5">
                          {m.perspectives.map((p) => (
                            <span
                              key={p}
                              className="border border-ink-soft/40 px-2 py-0.5 text-[0.58rem] uppercase tracking-[0.14em] text-ink-soft"
                            >
                              {p}
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : null}

                    {stories.length ? (
                      <div className="mt-3">
                        <p className="flex items-center gap-1.5 text-[0.58rem] font-semibold uppercase tracking-[0.2em] text-ink">
                          <BookOpen className="h-3 w-3 text-bronze" strokeWidth={1.8} />
                          Stories at this place
                        </p>
                        <ul className="mt-1.5 space-y-1">
                          {stories.map((s) => (
                            <li key={s.id}>
                              <Link
                                href={`/story/${s.id}`}
                                className="text-xs text-ink-soft underline decoration-bronze/50 underline-offset-2 hover:text-bronze"
                              >
                                {s.displayDate} — {s.title}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null}

                    {m.eventLinks && m.eventLinks.length ? (
                      <div className="mt-3">
                        <p className="flex items-center gap-1.5 text-[0.58rem] font-semibold uppercase tracking-[0.2em] text-ink">
                          <Clock3 className="h-3 w-3 text-bronze" strokeWidth={1.8} />
                          Events here
                        </p>
                        <ul className="mt-1.5 space-y-1">
                          {m.eventLinks.map((e, i) => (
                            <li key={i}>
                              <Link
                                href={e.href}
                                className="text-xs text-ink-soft underline decoration-bronze/50 underline-offset-2 hover:text-bronze"
                              >
                                {e.label}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null}

                    {m.people && m.people.length ? (
                      <div className="mt-3">
                        <p className="flex items-center gap-1.5 text-[0.58rem] font-semibold uppercase tracking-[0.2em] text-ink">
                          <Users2 className="h-3 w-3 text-bronze" strokeWidth={1.8} />
                          Experienced here
                        </p>
                        <p className="mt-1 text-xs text-ink-muted">{m.people.join(" · ")}</p>
                      </div>
                    ) : null}

                    <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-ink-soft/15 pt-2">
                      {m.href ? (
                        <Link
                          href={m.href}
                          className="inline-flex items-center gap-1 text-[0.6rem] font-semibold uppercase tracking-[0.16em] text-bronze hover:text-ink-soft"
                        >
                          <BookOpen className="h-3 w-3" strokeWidth={1.8} /> Open the story
                        </Link>
                      ) : null}
                      {m.locationId ? (
                        <Link
                          href={`/map?loc=${m.locationId}`}
                          className="inline-flex items-center gap-1 text-[0.6rem] font-semibold uppercase tracking-[0.16em] text-bronze hover:text-ink-soft"
                        >
                          <Landmark className="h-3 w-3" strokeWidth={1.8} /> Location record
                        </Link>
                      ) : null}
                      <Link
                        href="/timeline"
                        className="inline-flex items-center gap-1 text-[0.6rem] font-semibold uppercase tracking-[0.16em] text-bronze hover:text-ink-soft"
                      >
                        <Clock3 className="h-3 w-3" strokeWidth={1.8} /> Timeline
                      </Link>
                      <Link
                        href="/sources"
                        className="inline-flex items-center gap-1 text-[0.6rem] font-semibold uppercase tracking-[0.16em] text-bronze hover:text-ink-soft"
                      >
                        <Landmark className="h-3 w-3" strokeWidth={1.8} /> Sources
                      </Link>
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}
          <SelectedFocus selectedId={initialMarkerId} markersRef={markersRef} />
          <ZoomControl position="bottomright" />
        </MapContainer>
      </div>

      {!compact ? (
        <div className="pointer-events-none absolute right-3 top-3 z-[500] hidden flex-col gap-2 border border-ink-soft/30 bg-paper/90 px-3 py-2.5 sm:flex">
          <span className="text-[0.55rem] font-semibold uppercase tracking-[0.22em] text-ink">Key</span>
          {(Object.keys(MARKER_COLORS) as MapMarker["icon"][]).map((key) => (
            <span key={key} className="flex items-center gap-2 text-[0.62rem] text-ink-muted">
              <span
                className="inline-block h-2.5 w-2.5 rotate-45 border border-ink-soft/50"
                style={{ background: MARKER_COLORS[key] }}
              />
              {key}
            </span>
          ))}
        </div>
      ) : null}

      <div className="pointer-events-none absolute left-3 top-3 z-[500] hidden text-bronze/80 sm:block">
        <svg viewBox="0 0 48 48" className="h-10 w-10" aria-hidden="true">
          <circle cx="24" cy="24" r="20" fill="none" stroke="currentColor" strokeWidth="1" />
          <circle cx="24" cy="24" r="11" fill="none" stroke="currentColor" strokeWidth="0.7" />
          <path
            d="M24 24 m-6 0 a6 6 0 1 0 12 0 a6 6 0 1 0 -12 0"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.7"
          />
          <path d="M24 22.5 L25.2 24 L24 25.5 L22.8 24 Z" fill="currentColor" />
          <path d="M24 6 V13 M24 35 V42 M6 24 H13 M35 24 H42" stroke="currentColor" strokeWidth="0.8" />
        </svg>
      </div>
    </div>
  );
}