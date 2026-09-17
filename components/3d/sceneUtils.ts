import { useSyncExternalStore } from "react";

export const PALETTE = {
  paper: "#f3ebdd",
  parchment: "#e8dcc4",
  bronze: "#9a6b3f",
  ink: "#2b2118",
  inkSoft: "#5c4033",
  inkMuted: "#776957",
  inkLine: "#a3927a",
  inkFaint: "#c9bda6",
  earth: "#b7a37f",
  stone: "#8f7d5c",
  stoneDark: "#6e5a3f",
  stoneLight: "#a7956e",
  soil: "#83704f",
  grass: "#8f9c6a",
  scrub: "#6f7d4f",
  wood: "#4a332a",
  woodDark: "#35241d",
  skyTop: "#e7dcc0",
  haze: "#e7dcc2",
  sun: "#ffd9a0",
} as const;

export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function isWebGLAvailable(): boolean {
  if (typeof document === "undefined" || typeof window === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext("webgl2") || canvas.getContext("webgl"))
    );
  } catch {
    return false;
  }
}

export function detectQuality(): "full" | "reduced" {
  if (typeof window === "undefined") return "full";
  const coarse =
    window.matchMedia("(max-width: 640px)").matches ||
    window.matchMedia("(pointer: coarse)").matches;
  const cores = window.navigator.hardwareConcurrency || 8;
  return coarse || cores <= 4 ? "reduced" : "full";
}

function subscribeNever() {
  return () => {};
}

export function useIsWebGLAvailable(): boolean {
  return useSyncExternalStore(subscribeNever, isWebGLAvailable, () => false);
}

export function useSceneQuality(): "full" | "reduced" {
  return useSyncExternalStore(subscribeNever, detectQuality, () => "full");
}

function hash(ix: number, iy: number): number {
  const s = Math.sin(ix * 127.1 + iy * 311.7) * 43758.5453;
  return s - Math.floor(s);
}

function smoothstep(t: number): number {
  return t * t * (3 - 2 * t);
}

function noise2(x: number, y: number): number {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const fx = x - ix;
  const fy = y - iy;
  const a = hash(ix, iy);
  const b = hash(ix + 1, iy);
  const c = hash(ix, iy + 1);
  const d = hash(ix + 1, iy + 1);
  const u = smoothstep(fx);
  const v = smoothstep(fy);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}

function fbm(x: number, y: number): number {
  let value = 0;
  let amp = 0.55;
  let freq = 1;
  for (let i = 0; i < 3; i += 1) {
    value += amp * noise2(x * freq, y * freq);
    amp *= 0.5;
    freq *= 2.1;
  }
  return value;
}

export function terrainHeight(x: number, z: number): number {
  const ridge = Math.exp(-((x / 12) ** 2 + ((z - 3) / 13) ** 2) * 1.6);
  const spur = Math.exp(-(((x + 9) / 8) ** 2 + ((z + 9) / 7) ** 2)) * 0.9;
  const terrace = Math.exp(-(((x - 7) / 9) ** 2 + ((z - 6) / 11) ** 2)) * 0.5;
  let h = 3.15 * ridge + spur + terrace - 0.6;
  h += fbm(x * 0.16 + 4.2, z * 0.16);
  h += noise2(x * 0.5, z * 0.5) * 0.28;
  return Math.max(h, -0.05);
}

export function terrainSlope(x: number, z: number, delta = 0.4): number {
  const hx = terrainHeight(x + delta, z) - terrainHeight(x - delta, z);
  const hz = terrainHeight(x, z + delta) - terrainHeight(x, z - delta);
  return Math.sqrt(hx * hx + hz * hz) / (delta * 2);
}

function gauss(x: number, z: number, cx: number, cz: number, sx: number, sz: number): number {
  return Math.exp(-Math.pow((x - cx) / sx, 2) - Math.pow((z - cz) / sz, 2));
}

/**
 * Continuous fortress-mountain surface for the Pratapgad scene.
 *
 * Designed against the real GLB geometry (rotated +180°, centered, ~14-unit
 * target height): a single crown that rises to just below the wall footings
 * (~3.8), a raised rim under the fort's defensive terrace so the raw slab
 * underside is buried everywhere, then smooth shoulders falling to the valley.
 * THE INNER PAYOFF: no floating slabs, no exposed cuts, no disconnected plates —
 * everything is one connected mountain.
 */
export function siteTerrainHeight(x: number, z: number): number {
  const re = Math.sqrt(Math.pow(x / 16, 2) + Math.pow(z / 37, 2));
  const rim = 1.85 * Math.exp(-Math.pow((re - 1.12) / 0.17, 2));
  const interior = 2.45 * gauss(x, z, 0, -1, 22, 30);
  const front = 0.7 * gauss(x, z, 0, 36, 26, 18);
  const rear = 0.7 * gauss(x, z, 2, -34, 26, 30);
  const east = 0.35 * gauss(x, z, 16, 4, 14, 24);
  const west = 0.3 * gauss(x, z, -16, 2, 14, 24);
  const valley = 0.22 * Math.max(0, 1 - Math.min(1, Math.hypot(x, z) / 60));
  let h = rim + interior + front + rear + east + west + valley;
  h += fbm(x * 0.13 + 3.1, z * 0.13) * 0.14;
  h += noise2(x * 0.6, z * 0.6) * 0.05;
  return h;
}

export function siteTerrainSlope(x: number, z: number, delta = 0.5): number {
  const hx = siteTerrainHeight(x + delta, z) - siteTerrainHeight(x - delta, z);
  const hz = siteTerrainHeight(x, z + delta) - siteTerrainHeight(x, z - delta);
  return Math.sqrt(hx * hx + hz * hz) / (delta * 2);
}