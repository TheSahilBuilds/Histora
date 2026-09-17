import type {
  Period,
  Event,
  Person,
  Location,
  Scenario,
  Source,
  GuideQA,
  Mode,
  PovId,
  EvidenceClass,
  StoryCategory,
  Region,
  RegionState,
  Era,
  Story,
  PovRole,
  TimelineItem,
  MapMarker,
  StoryPerson,
} from "@/lib/types";

import periodsData from "@/data/periods.json";
import eventsData from "@/data/events.json";
import peopleData from "@/data/people.json";
import locationsData from "@/data/locations.json";
import scenariosData from "@/data/scenarios.json";
import sourcesData from "@/data/sources.json";
import guideData from "@/data/guide.json";
import regionsData from "@/data/regions.json";
import statesData from "@/data/states.json";
import erasData from "@/data/eras.json";
import storiesData from "@/data/stories.json";
import perspectivesData from "@/data/perspectives.json";

export const periods = periodsData as Period[];
export const events = eventsData as Event[];
export const people = peopleData as Person[];
export const locations = locationsData as Location[];
export const scenarios = scenariosData as Scenario[];
export const sources = sourcesData as Source[];
export const guideQA = guideData as GuideQA[];
export const regions = regionsData as Region[];
export const states = statesData as RegionState[];
export const eras = erasData as Era[];
export const stories = storiesData as Story[];
export const perspectives = perspectivesData as PovRole[];

export const PERIOD_ID = "india-1857";

export function getPeriod(id: string = PERIOD_ID): Period {
  return periods.find((p) => p.id === id) ?? periods[0];
}

export function getPeriods(): Period[] {
  return periods;
}

export function getEvents(periodId: string = PERIOD_ID): Event[] {
  return events.filter((e) => e.periodId === periodId);
}

export function getEvent(id: string): Event | undefined {
  return events.find((e) => e.id === id);
}

export function getPeople(periodId: string = PERIOD_ID): Person[] {
  return people.filter((p) => p.periodId === periodId);
}

export function getPerson(id: string): Person | undefined {
  return people.find((p) => p.id === id);
}

export function getLocations(): Location[] {
  return locations;
}

export function getLocation(id: string): Location | undefined {
  return locations.find((l) => l.id === id);
}

export function getScenario(id: string): Scenario | undefined {
  return scenarios.find((s) => s.id === id);
}

export function getScenarioByPerspective(perspectiveId: string): Scenario | undefined {
  return scenarios.find((s) => s.perspectiveId === perspectiveId);
}

export function getScenariosByPerspective(perspectiveId: string): Scenario[] {
  return scenarios.filter((s) => s.perspectiveId === perspectiveId);
}

export function getScenarioForStoryAndPerspective(
  storyId: string,
  perspectiveId: string
): Scenario | undefined {
  return (
    scenarios.find((s) => s.storyId === storyId && s.perspectiveId === perspectiveId) ??
    scenarios.find((s) => s.perspectiveId === perspectiveId)
  );
}

export function getScenarios(): Scenario[] {
  return scenarios;
}

export function getSource(id?: string): Source | undefined {
  if (!id) return undefined;
  return sources.find((s) => s.id === id);
}

export function getSources(): Source[] {
  return sources;
}

export function getSourceByEvent(eventId: string): Source | undefined {
  const ev = events.find((e) => e.id === eventId);
  if (!ev?.sourceId) return undefined;
  return sources.find((s) => s.id === ev.sourceId);
}

export function getEventSources(eventId: string): Source[] {
  return sources.filter((s) => s.relatedEventIds.includes(eventId));
}

export function getEventsForLocation(locationId: string): Event[] {
  return events.filter((e) => e.locationId === locationId);
}

export function getRegions(): Region[] {
  return regions;
}

export function getRegion(id?: string): Region | undefined {
  if (!id) return undefined;
  return regions.find((r) => r.id === id);
}

export function getStates(): RegionState[] {
  return states;
}

export function getState(id?: string): RegionState | undefined {
  if (!id) return undefined;
  return states.find((s) => s.id === id);
}

export function getEras(): Era[] {
  return eras;
}

export function getEra(id?: string): Era | undefined {
  if (!id) return undefined;
  return eras.find((e) => e.id === id);
}

export function getStories(periodId: string = PERIOD_ID): Story[] {
  return stories.filter((s) => s.periodId === periodId);
}

export function getStory(id?: string): Story | undefined {
  if (!id) return undefined;
  return stories.find((s) => s.id === id);
}

export function getStoriesForLocation(locationId: string): Story[] {
  return stories.filter((s) => s.locationIds.includes(locationId));
}

export function getPerspectives(): PovRole[] {
  return perspectives;
}

export function getPerspective(povId?: string): PovRole | undefined {
  if (!povId) return undefined;
  return perspectives.find((p) => p.id === povId);
}

export function getSourcesForStory(storyId: string): Source[] {
  const story = getStory(storyId);
  if (!story) return [];
  return story.sourceIds
    .map(getSource)
    .filter((s): s is Source => Boolean(s));
}

export function getStoryPeople(storyId: string): StoryPerson[] {
  return getStory(storyId)?.people ?? [];
}

export function getPeriodByRegionAndEra(regionId: string, eraId: string): Period | undefined {
  return periods.find((p) => p.regionId === regionId && p.eraId === eraId);
}

const STORY_CATEGORY_ICON: Record<Story["category"], MapMarker["icon"]> = {
  birth: "fort",
  rise: "fort",
  fort: "fort",
  battle: "battle",
  siege: "battle",
  escape: "pass",
  campaign: "city",
  coronation: "fort",
  recovery: "fort",
};

export function getStoryMarkers(): MapMarker[] {
  return stories.map((s) => ({
    id: s.id,
    title: s.title,
    sub: `${s.displayDate} · ${s.location}`,
    description: s.shortDescription,
    lat: s.latitude,
    lng: s.longitude,
    icon: STORY_CATEGORY_ICON[s.category] ?? "fort",
    href: `/story/${s.id}`,
    relatedStoryIds: s.relatedStories,
    locationId: s.locationIds[0],
    perspectives: s.povs,
  }));
}

export function getLocationMarkers(): MapMarker[] {
  return locations.map((l) => ({
    id: l.id,
    title: l.name,
    sub: l.region,
    description: l.description,
    lat: l.lat,
    lng: l.lng,
    icon: l.icon,
    locationId: l.id,
    relatedStoryIds: l.relatedStoryIds,
    eventLinks: l.events
      .map((eid) => {
        const ev = getEvent(eid);
        return ev ? { href: `/timeline?event=${ev.id}`, label: `${ev.displayDate} — ${ev.title}` } : undefined;
      })
      .filter((e): e is NonNullable<typeof e> => !!e),
    people: l.relatedPeople
      .map((pid) => getPerson(pid)?.role)
      .filter((r): r is string => Boolean(r)),
  }));
}

export function getTimelineItems(): TimelineItem[] {
  const storyItems: TimelineItem[] = stories.map((s) => ({
    id: s.id,
    displayDate: s.displayDate,
    title: s.title,
    location: s.location,
    description: s.shortDescription,
    category: s.category,
    href: `/story/${s.id}`,
    kind: "story",
  }));
  const eventItems: TimelineItem[] = events.map((e) => ({
    id: e.id,
    displayDate: e.displayDate,
    title: e.title,
    location: e.location,
    description: e.description,
    category: e.category,
    href: `/explore?event=${e.id}`,
    kind: "event",
  }));
  return [...storyItems, ...eventItems];
}

export type {
  Period,
  Event,
  Person,
  Location,
  Scenario,
  Source,
  GuideQA,
  Mode,
  PovId,
  EvidenceClass,
  StoryCategory,
  Region,
  RegionState,
  Era,
  Story,
  PovRole,
  TimelineItem,
  MapMarker,
  StoryPerson,
};