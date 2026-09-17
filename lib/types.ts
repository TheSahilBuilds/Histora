export type StateKey = "safety" | "resources" | "information" | "mobility" | "connections";

export type StateDelta = Partial<Record<StateKey, number>>;

export type Mode = "state" | "national" | "international";

export type PovId = "ruler" | "soldier" | "farmer" | "merchant" | "artisan" | "commoner";

export type EvidenceClass = "documented-fact" | "interpretation" | "fictional-reconstruction";

export type StoryCategory =
  | "birth"
  | "rise"
  | "fort"
  | "battle"
  | "escape"
  | "campaign"
  | "siege"
  | "coronation"
  | "recovery";

export interface Period {
  id: string;
  title: string;
  shortTitle: string;
  year: string;
  era: string;
  subtitle: string;
  description: string;
  tagline: string;
  regionId?: string;
  stateId?: string;
  eraId?: string;
  century?: string;
  mode?: Mode;
  subjectName?: string;
  subjectDescription?: string;
  overview: {
    importantEvents: string[];
    majorRegions: string[];
    socialGroups: string[];
    context: string[];
  };
}

export interface Region {
  id: string;
  name: string;
  region: string;
  available: boolean;
  periodId?: string;
  note: string;
}

export interface RegionState {
  id: string;
  regionId: string;
  name: string;
  code: string;
  mode: Mode;
  available: boolean;
  note: string;
}

export interface Era {
  id: string;
  label: string;
  title: string;
  description: string;
  subjectPeriodId?: string;
}

export interface StoryPerson {
  id: string;
  name: string;
  role: string;
  note: string;
}

export interface Story {
  id: string;
  periodId: string;
  regionId: string;
  stateId: string;
  category: StoryCategory;
  title: string;
  date: string;
  displayDate: string;
  century: string;
  period: string;
  state: string;
  region: string;
  district: string;
  location: string;
  latitude: number;
  longitude: number;
  shortDescription: string;
  description: string;
  significance: string;
  people: StoryPerson[];
  relatedStories: string[];
  locationIds: string[];
  sourceIds: string[];
  evidence: EvidenceClass;
  povs: PovId[];
}

export interface PovRole {
  id: PovId;
  role: string;
  tagline: string;
  icon: string;
  knows: string[];
  sees: string;
  concerns: string[];
  risks: string[];
  resources: string[];
  experience: string;
  context: string;
}

export interface TimelineItem {
  id: string;
  displayDate: string;
  title: string;
  location: string;
  description: string;
  category: string;
  href: string;
  kind: "story" | "event";
}

export interface MapMarker {
  id: string;
  title: string;
  sub: string;
  description: string;
  lat: number;
  lng: number;
  icon: "fort" | "city" | "town" | "pass" | "battle";
  href?: string;
  relatedStoryIds?: string[];
  locationId?: string;
  eventLinks?: { href: string; label: string }[];
  people?: string[];
  perspectives?: PovId[];
}

export interface Event {
  id: string;
  periodId: string;
  date: string;
  displayDate: string;
  title: string;
  location: string;
  locationId?: string;
  category: "tension" | "uprising" | "response" | "aftermath" | "context";
  description: string;
  significance: string;
  sourceId?: string;
}

export interface Person {
  id: string;
  periodId: string;
  role: string;
  tagline: string;
  context: string;
  concerns: string[];
  scenarioId?: string;
  icon: "soldier" | "farmer" | "artisan" | "merchant" | "student" | "ruler" | "commoner";
  featured?: boolean;
}

export interface Location {
  id: string;
  name: string;
  lat: number;
  lng: number;
  region: string;
  tagline: string;
  description: string;
  events: string[];
  relatedPeople: string[];
  relatedStoryIds?: string[];
  timelineNote: string;
  sourceIds: string[];
  icon: "city" | "fort" | "town";
}

export interface ScenarioChoice {
  id: string;
  label: string;
  summary: string;
  consequence: string;
  stateDelta: StateDelta;
  historicalContext: string;
  sourceId?: string;
  nextStageId?: string;
  end?: boolean;
}

export interface ScenarioStage {
  id: string;
  day: string;
  title: string;
  description: string;
  choices: ScenarioChoice[];
}

export interface ScenarioIntro {
  youAre: string;
  where: string;
  when: string;
  context: string;
}

export interface Scenario {
  id: string;
  periodId: string;
  perspectiveId: string;
  storyId?: string;
  roleLabel: string;
  title: string;
  tagline: string;
  disclaimer: string;
  intro: ScenarioIntro;
  narrative: string[];
  stages: ScenarioStage[];
  ending: {
    title: string;
    text: string;
    lessons: string[];
  };
  variablesMeta: {
    key: StateKey;
    label: string;
    description: string;
  }[];
}

export interface Source {
  id: string;
  title: string;
  author: string;
  institution?: string;
  year: string;
  type: "Primary source" | "Secondary source" | "Archive" | "Book" | "Museum" | "Academic source";
  category: string;
  description: string;
  context: string;
  relatedEventIds: string[];
  relatedStoryIds?: string[];
  verified: boolean;
  placeholder?: string;
  demoDocument?: string;
}

export interface GuideQA {
  id: string;
  question: string;
  keywords: string[];
  answer: string;
  tags: Array<"Documented fact" | "Interpretation" | "Fictional reconstruction">;
  followUp: string[];
}

export interface PlaythroughRecord {
  scenarioId: string;
  perspectiveId: string;
  title: string;
  decisions: string[];
  completedAt: string;
}

export interface JourneyState {
  exploredEvents: string[];
  exploredLocations: string[];
  exploredPerspectives: string[];
  playthroughs: PlaythroughRecord[];
  timelineRead: boolean;
}

export type GameState = Record<StateKey, number>;