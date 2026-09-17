"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { JourneyState, PlaythroughRecord } from "@/lib/types";

interface JourneyStore extends JourneyState {
  markEventExplored: (eventId: string) => void;
  markLocationExplored: (locationId: string) => void;
  markPerspectiveExplored: (perspectiveId: string) => void;
  completeScenario: (record: PlaythroughRecord) => void;
  setTimelineRead: (read: boolean) => void;
  resetJourney: () => void;
}

const initialState = {
  exploredEvents: [] as string[],
  exploredLocations: [] as string[],
  exploredPerspectives: [] as string[],
  playthroughs: [] as PlaythroughRecord[],
  timelineRead: false,
};

function pushUnique<T>(arr: T[], item: T): T[] {
  return arr.includes(item) ? arr : [...arr, item];
}

export const useJourney = create<JourneyStore>()(
  persist(
    (set) => ({
      ...initialState,
      markEventExplored: (eventId) =>
        set((s) => ({ exploredEvents: pushUnique(s.exploredEvents, eventId) })),
      markLocationExplored: (locationId) =>
        set((s) => ({ exploredLocations: pushUnique(s.exploredLocations, locationId) })),
      markPerspectiveExplored: (perspectiveId) =>
        set((s) => ({
          exploredPerspectives: pushUnique(s.exploredPerspectives, perspectiveId),
        })),
      completeScenario: (record) =>
        set((s) => ({
          playthroughs: [
            ...s.playthroughs.filter((p) => p.scenarioId !== record.scenarioId),
            record,
          ],
          exploredPerspectives: pushUnique(s.exploredPerspectives, record.perspectiveId),
        })),
      setTimelineRead: (read) => set({ timelineRead: read }),
      resetJourney: () => set(initialState),
    }),
    { name: "histora-journey" }
  )
);