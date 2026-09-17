import sitesData from "@/data/sites.json";

export interface HistoricalHotspot {
  id: string;
  title: string;
  description: string;
  position: [number, number, number];
}

export interface ModelTransform {
  excludePrefixes?: string[];
  targetHeight?: number;
  rotationY?: number;
  restOnTerrain?: boolean;
  embed?: number;
}

export interface HistoricalSite {
  id: string;
  storyId: string;
  model: string;
  title: string;
  location: string;
  century: string;
  date: string;
  ariaLabel: string;
  hotspots: HistoricalHotspot[];
  transform?: ModelTransform;
}

const registry = sitesData as HistoricalSite[];

export function getSiteForStory(storyId: string): HistoricalSite | undefined {
  return registry.find((site) => site.storyId === storyId);
}

export function getSite(id: string): HistoricalSite | undefined {
  return registry.find((site) => site.id === id);
}

export function listSites(): HistoricalSite[] {
  return registry;
}