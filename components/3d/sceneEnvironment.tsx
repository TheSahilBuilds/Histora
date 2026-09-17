"use client";

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
      <hemisphereLight args={["#e8dcc4", "#5c4630", 0.6]} />
      <directionalLight
        position={[18, 26, 12]}
        color="#ffd9a0"
        intensity={shadowsOn ? 1.8 : 1.35}
        castShadow={shadowsOn}
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={1}
        shadow-camera-far={80}
        shadow-camera-left={-36}
        shadow-camera-right={36}
        shadow-camera-top={36}
        shadow-camera-bottom={-36}
        shadow-bias={-0.0004}
        shadow-normalBias={0.02}
      />
      <directionalLight position={[-16, 8, -20]} color="#d9cdb2" intensity={0.35} />
    </>
  );
}

interface Peak {
  r: number;
  angle: number;
  height: number;
  width: number;
}

const PEAK_RINGS: Peak[][] = [
  { r: 128, count: 16, h: [16, 30], w: [9, 16] },
  { r: 160, count: 14, h: [20, 36], w: [11, 19] },
  { r: 195, count: 12, h: [24, 40], w: [13, 22] },
].map(({ r, count, h, w }) => {
  const rng = mulberry32(r);
  return Array.from({ length: count }, (_, i) => ({
    r: r + (rng() - 0.5) * 14,
    angle: (i / count) * Math.PI * 2 + rng() * 0.4,
    height: h[0] + rng() * (h[1] - h[0]),
    width: w[0] + rng() * (w[1] - w[0]),
  }));
});

function DistantGhats() {
  return (
    <group>
      {PEAK_RINGS.flat().map((peak: Peak, i: number) => (
        <mesh
          key={i}
          position={[
            Math.cos(peak.angle) * peak.r,
            -4 + peak.height / 2,
            Math.sin(peak.angle) * peak.r,
          ]}
          scale={[peak.width, peak.height, peak.width]}
          frustumCulled={false}
        >
          <coneGeometry args={[1, 1, 7, 1]} />
          <meshStandardMaterial
            color={i % 3 === 0 ? "#6e5a3f" : i % 3 === 1 ? "#7a6849" : "#635133"}
            roughness={1}
            flatShading
            transparent
            opacity={0.95}
            depthWrite={false}
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