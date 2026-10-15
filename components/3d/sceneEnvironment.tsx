"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { mulberry32 } from "./sceneUtils";
import { sceneTextures } from "./sceneTextures";

function SkyDome() {
  return (
    <mesh>
      <sphereGeometry args={[420, 24, 12]} />
      <meshBasicMaterial
        map={sceneTextures.skyColor()}
        side={THREE.BackSide}
        fog={false}
        depthWrite={false}
      />
    </mesh>
  );
}

function SceneLights({ shadowsOn }: { shadowsOn: boolean }) {
  return (
    <>
      <hemisphereLight args={["#f0e6d0", "#6b563d", 0.85]} />
      <ambientLight intensity={0.18} color="#e8dcc4" />
      <directionalLight
        position={[20, 26, 14]}
        color="#ffe4bd"
        intensity={shadowsOn ? 1.15 : 0.95}
        castShadow={shadowsOn}
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={1}
        shadow-camera-far={110}
        shadow-camera-left={-40}
        shadow-camera-right={40}
        shadow-camera-top={40}
        shadow-camera-bottom={-40}
        shadow-bias={-0.0006}
        shadow-normalBias={0.035}
        shadow-radius={4}
      />
      <directionalLight position={[-18, 10, -22]} color="#d9cdb2" intensity={0.28} />
    </>
  );
}

interface RidgeLayer {
  radius: number;
  base: number;
  amplitude: number;
  segments: number;
  seed: number;
  color: string;
}

/**
 * Layered Sahyadri ridgelines used as atmospheric background depth. Each layer
 * is a closed, jagged silhouette ring (no pyramids, no flat-shaded cones) that
 * fades into the sepia haze via fog, so the fort stays the focal point.
 */
const RIDGE_LAYERS: RidgeLayer[] = [
  { radius: 150, base: 1, amplitude: 22, segments: 96, seed: 0x72696467, color: "#6f5d42" },
  { radius: 205, base: -3, amplitude: 30, segments: 84, seed: 0x72696467 + 7, color: "#83704f" },
  { radius: 258, base: -7, amplitude: 38, segments: 72, seed: 0x72696467 + 13, color: "#9a8768" },
];

function ridgeGeometry({ radius, base, amplitude, segments, seed }: RidgeLayer): THREE.BufferGeometry {
  const rng = mulberry32(seed);
  const positions: number[] = [];
  const indices: number[] = [];
  const bottom = base - 70;

  for (let i = 0; i <= segments; i += 1) {
    const a = (i / segments) * Math.PI * 2;
    const x = Math.cos(a) * radius;
    const z = Math.sin(a) * radius;
    const ridge =
      Math.sin(a * 3 + seed) * 0.5 +
      Math.sin(a * 7 + seed * 1.7) * 0.3 +
      Math.sin(a * 13 + seed * 0.3) * 0.2;
    const top = base + amplitude * (0.5 + 0.5 * (ridge * 0.5 + 0.5)) + rng() * 2;
    positions.push(x, top, z, x, bottom, z);
  }
  for (let i = 0; i < segments; i += 1) {
    const t0 = i * 2;
    const b0 = i * 2 + 1;
    const t1 = (i + 1) * 2;
    const b1 = (i + 1) * 2 + 1;
    indices.push(t0, b0, t1, b0, b1, t1);
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

function DistantGhats() {
  const layers = useMemo(() => RIDGE_LAYERS.map(ridgeGeometry), []);
  return (
    <group>
      {RIDGE_LAYERS.map((layer, i) => (
        <mesh key={layer.radius} geometry={layers[i]} frustumCulled={false}>
          <meshStandardMaterial
            color={layer.color}
            roughness={1}
            metalness={0}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  );
}

export default function SceneEnvironment({ shadowsOn }: { shadowsOn: boolean }) {
  return (
    <>
      <SkyDome />
      <SceneLights shadowsOn={shadowsOn} />
      <DistantGhats />
    </>
  );
}
