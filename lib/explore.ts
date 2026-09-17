import { perspectives } from "@/lib/data";
import type { Mode, PovId, Story } from "@/lib/types";

export type ScopeId = "states" | "national" | "international";

export interface ExploreOption {
  id: string;
  label: string;
}

export interface ExploreFilters {
  scope: ScopeId;
  region: string;
  era: string;
  role: PovId | "all";
}

export const SCOPE_OPTIONS: ExploreOption[] = [
  { id: "states", label: "States of India" },
  { id: "national", label: "National History" },
  { id: "international", label: "International History" },
];

export const REGION_OPTIONS: Record<ScopeId, ExploreOption[]> = {
  states: [
    { id: "maharashtra", label: "Maharashtra" },
    { id: "gujarat", label: "Gujarat" },
    { id: "rajasthan", label: "Rajasthan" },
    { id: "karnataka", label: "Karnataka" },
    { id: "tamil-nadu", label: "Tamil Nadu" },
    { id: "west-bengal", label: "West Bengal" },
    { id: "uttar-pradesh", label: "Uttar Pradesh" },
    { id: "madhya-pradesh", label: "Madhya Pradesh" },
    { id: "bihar", label: "Bihar" },
    { id: "odisha", label: "Odisha" },
    { id: "kerala", label: "Kerala" },
    { id: "andhra-pradesh", label: "Andhra Pradesh" },
    { id: "telangana", label: "Telangana" },
    { id: "punjab", label: "Punjab" },
    { id: "haryana", label: "Haryana" },
    { id: "himachal-pradesh", label: "Himachal Pradesh" },
    { id: "uttarakhand", label: "Uttarakhand" },
    { id: "assam", label: "Assam" },
    { id: "jharkhand", label: "Jharkhand" },
    { id: "chhattisgarh", label: "Chhattisgarh" },
    { id: "goa", label: "Goa" },
  ],
  national: [
    { id: "all-india", label: "All India" },
    { id: "north-india", label: "North India" },
    { id: "south-india", label: "South India" },
    { id: "east-india", label: "East India" },
    { id: "west-india", label: "West India" },
    { id: "central-india", label: "Central India" },
    { id: "northeast-india", label: "Northeast India" },
  ],
  international: [
    { id: "asia", label: "Asia" },
    { id: "europe", label: "Europe" },
    { id: "africa", label: "Africa" },
    { id: "middle-east", label: "Middle East" },
    { id: "north-america", label: "North America" },
    { id: "south-america", label: "South America" },
    { id: "oceania", label: "Oceania" },
  ],
};

export const ERA_OPTIONS: ExploreOption[] = [
  { id: "all", label: "All Eras" },
  { id: "ancient", label: "Ancient" },
  { id: "medieval", label: "Medieval" },
  { id: "17th-century", label: "17th Century" },
  { id: "18th-century", label: "18th Century" },
  { id: "19th-century", label: "19th Century" },
  { id: "20th-century", label: "20th Century" },
  { id: "modern", label: "Modern" },
];

const SCOPE_TO_MODE: Record<ScopeId, Mode> = {
  states: "state",
  national: "national",
  international: "international",
};

export const ROLE_OPTIONS: ExploreOption[] = [
  { id: "all", label: "Any Perspective" },
  ...perspectives.map((p) => ({ id: p.id, label: p.role.replace(/^The\s+/, "") })),
];

export const DEFAULT_FILTERS: ExploreFilters = {
  scope: "states",
  region: "maharashtra",
  era: "all",
  role: "all",
};

export function scopeLabel(scope: ScopeId): string {
  return SCOPE_OPTIONS.find((o) => o.id === scope)?.label ?? "States of India";
}

export function regionLabel(scope: ScopeId, regionId: string): string {
  return REGION_OPTIONS[scope].find((r) => r.id === regionId)?.label ?? regionId;
}

export function eraLabel(eraId: string): string {
  return ERA_OPTIONS.find((e) => e.id === eraId)?.label ?? "All Eras";
}

export function roleLabel(roleId: string): string {
  return ROLE_OPTIONS.find((r) => r.id === roleId)?.label ?? "Any Perspective";
}

export function parseFilters(raw: URLSearchParams): ExploreFilters {
  const scope = SCOPE_OPTIONS.some((o) => o.id === raw.get("scope"))
    ? (raw.get("scope") as ScopeId)
    : DEFAULT_FILTERS.scope;

  const regionOptions = REGION_OPTIONS[scope];
  const region = regionOptions.some((r) => r.id === raw.get("region"))
    ? (raw.get("region") as string)
    : (regionOptions[0]?.id ?? DEFAULT_FILTERS.region);

  const era = ERA_OPTIONS.some((e) => e.id === raw.get("era"))
    ? (raw.get("era") as string)
    : DEFAULT_FILTERS.era;

  const role = ROLE_OPTIONS.some((r) => r.id === raw.get("role"))
    ? (raw.get("role") as PovId | "all")
    : DEFAULT_FILTERS.role;

  return { scope, region, era, role };
}

export function buildQuery(filters: ExploreFilters): string {
  const params = new URLSearchParams();
  params.set("scope", filters.scope);
  params.set("region", filters.region);
  params.set("era", filters.era);
  params.set("role", filters.role);
  return params.toString();
}

function storyRegionKey(story: Story): string {
  return story.stateId ?? story.regionId ?? "";
}

export function regionHasRecords(stories: Story[], scope: ScopeId, regionId: string): boolean {
  const mode = SCOPE_TO_MODE[scope];
  return stories.some(
    (s) => (s.scope == null || s.scope === mode) && storyRegionKey(s) === regionId
  );
}

export function filterStories(stories: Story[], filters: ExploreFilters): Story[] {
  const mode = SCOPE_TO_MODE[filters.scope];
  return stories.filter((story) => {
    if (story.scope != null && story.scope !== mode) return false;
    if (storyRegionKey(story) !== filters.region) return false;
    if (filters.era !== "all" && (story.era ?? "") !== filters.era) return false;
    if (filters.role !== "all" && !story.povs.includes(filters.role)) return false;
    return true;
  });
}