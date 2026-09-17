"use client";

import * as THREE from "three";
import { mulberry32 } from "./sceneUtils";

function makeCanvas(size: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D unavailable");
  return [canvas, ctx];
}

function canvasTexture(
  canvas: HTMLCanvasElement,
  options: { repeat?: boolean } = {}
): THREE.CanvasTexture {
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = texture.wrapT = options.repeat
    ? THREE.RepeatWrapping
    : THREE.ClampToEdgeWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  texture.needsUpdate = true;
  return texture;
}

function stoneColorMap(): THREE.CanvasTexture {
  const [, ctx] = makeCanvas(256);
  ctx.fillStyle = "#9a8a6a";
  ctx.fillRect(0, 0, 256, 256);
  const rng = mulberry32(0x1a2b3c);
  for (let i = 0; i < 420; i += 1) {
    const tone = rng() < 0.5 ? "6f5f48" : "a7956e";
    ctx.fillStyle = `${tone}`;
    const x = rng() * 256;
    const y = rng() * 256;
    ctx.fillRect(x, y, 10 + rng() * 22, 1 + rng() * 2);
  }
  for (let i = 0; i < 90; i += 1) {
    ctx.fillStyle = rng() < 0.5 ? "rgba(43,33,24,0.18)" : "rgba(243,235,221,0.14)";
    const x = rng() * 256;
    const y = rng() * 256;
    ctx.beginPath();
    ctx.arc(x, y, 0.6 + rng() * 2.4, 0, Math.PI * 2);
    ctx.fill();
  }
  return canvasTexture(ctx.canvas, { repeat: true });
}

function stoneHeightMap(): THREE.CanvasTexture {
  const [, ctx] = makeCanvas(256);
  ctx.fillStyle = "#808080";
  ctx.fillRect(0, 0, 256, 256);
  const rng = mulberry32(0x77aa11);
  for (let i = 0; i < 380; i += 1) {
    const v = 92 + rng() * 70;
    ctx.strokeStyle = `rgb(${Math.round(v)},${Math.round(v)},${Math.round(v)})`;
    ctx.lineWidth = 1;
    const x = rng() * 256;
    const y = rng() * 256;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x - 6, y + 14);
    ctx.stroke();
  }
  for (let i = 0; i < 160; i += 1) {
    const v = 70 + rng() * 60;
    ctx.fillStyle = `rgba(${Math.round(v)},${Math.round(v)},${Math.round(v)},0.7)`;
    const x = rng() * 256;
    const y = rng() * 256;
    ctx.beginPath();
    ctx.arc(x, y, 0.7 + rng() * 1.8, 0, Math.PI * 2);
    ctx.fill();
  }
  return canvasTexture(ctx.canvas, { repeat: true });
}

function terrainColorMap(): THREE.CanvasTexture {
  const [, ctx] = makeCanvas(256);
  ctx.fillStyle = "#9c8a66";
  ctx.fillRect(0, 0, 256, 256);
  const rng = mulberry32(0x9911dd);
  for (let i = 0; i < 640; i += 1) {
    const t = rng();
    ctx.fillStyle =
      t < 0.42 ? "rgba(110,90,63,0.5)" : t < 0.8 ? "rgba(176,162,132,0.45)" : "rgba(47,60,38,0.4)";
    const x = rng() * 256;
    const y = rng() * 256;
    ctx.fillRect(x, y, 3 + rng() * 9, 2 + rng() * 5);
  }
  for (let i = 0; i < 70; i += 1) {
    ctx.fillStyle = "rgba(83,70,47,0.55)";
    ctx.beginPath();
    ctx.arc(rng() * 256, rng() * 256, 2 + rng() * 4, 0, Math.PI * 2);
    ctx.fill();
  }
  return canvasTexture(ctx.canvas, { repeat: true });
}

function terrainHeightMap(): THREE.CanvasTexture {
  const [, ctx] = makeCanvas(256);
  ctx.fillStyle = "#858585";
  ctx.fillRect(0, 0, 256, 256);
  const rng = mulberry32(0xabcde);
  for (let i = 0; i < 900; i += 1) {
    const v = 70 + rng() * 90;
    ctx.fillStyle = `rgba(${Math.round(v)},${Math.round(v)},${Math.round(v)},0.5)`;
    ctx.fillRect(rng() * 256, rng() * 256, 2 + rng() * 5, 2 + rng() * 5);
  }
  return canvasTexture(ctx.canvas, { repeat: true });
}

function roughnessMap(): THREE.CanvasTexture {
  const [, ctx] = makeCanvas(256);
  ctx.fillStyle = "#b8b8b8";
  ctx.fillRect(0, 0, 256, 256);
  const rng = mulberry32(0x51515);
  for (let i = 0; i < 520; i += 1) {
    const v = 120 + rng() * 80;
    ctx.fillStyle = `rgb(${Math.round(v)},${Math.round(v)},${Math.round(v)})`;
    ctx.fillRect(rng() * 256, rng() * 256, 4 + rng() * 14, 2 + rng() * 3);
  }
  return canvasTexture(ctx.canvas, { repeat: true });
}

function skyColorMap(): THREE.CanvasTexture {
  const [canvas, ctx] = makeCanvas(256);
  const gradient = ctx.createLinearGradient(0, 0, 0, 256);
  gradient.addColorStop(0, "#e9dec4");
  gradient.addColorStop(0.55, "#efe7d1");
  gradient.addColorStop(0.8, "#f3ebdd");
  gradient.addColorStop(1, "#eadfc5");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 256, 256);
  const rng = mulberry32(0x5e);
  for (let i = 0; i < 240; i += 1) {
    ctx.fillStyle = "rgba(243,235,221,0.35)";
    ctx.beginPath();
    ctx.arc(rng() * 256, 30 + rng() * 90, 1 + rng() * 3, 0, Math.PI * 2);
    ctx.fill();
  }
  return canvasTexture(canvas, { repeat: false });
}

const stoneColor = () => singleton("stoneColor", stoneColorMap);
const stoneHeight = () => singleton("stoneHeight", stoneHeightMap);
const terrainColor = () => singleton("terrainColor", terrainColorMap);
const terrainHeight = () => singleton("terrainHeight", terrainHeightMap);
const roughness = () => singleton("roughness", roughnessMap);
const skyColor = () => singleton("skyColor", skyColorMap);

const cache = new Map<string, THREE.CanvasTexture>();

function singleton(key: string, build: () => THREE.CanvasTexture): THREE.CanvasTexture {
  const existing = cache.get(key);
  if (existing) return existing;
  const texture = build();
  cache.set(key, texture);
  return texture;
}

export const sceneTextures = {
  stoneColor,
  stoneHeight,
  terrainColor,
  terrainHeight,
  roughness,
  skyColor,
};