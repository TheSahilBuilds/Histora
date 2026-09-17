"use client";

import { useEffect, useMemo, useRef, type ReactNode, type RefObject } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Html, Instances, Instance, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { mulberry32, siteTerrainHeight, siteTerrainSlope, PALETTE } from "./sceneUtils";
import { sceneTextures } from "./sceneTextures";
import SceneEnvironment from "./sceneEnvironment";
import HistoricalModel from "./HistoricalModel";
import ProceduralFort from "./ProceduralFort";
import { ExternalLink, X } from "lucide-react";
import type { HistoricalHotspot, ModelTransform } from "@/lib/sites";

export interface PratapgadSceneProps {
  mode: "probing" | "model" | "procedural";
  modelPath: string;
  transform?: ModelTransform;
  hotspots: HistoricalHotspot[];
  activeHotspotId: string | null;
  onSelectHotspot: (id: string | null) => void;
  driftEnabled: boolean;
  zoomInSignal: number;
  zoomOutSignal: number;
  resetSignal: number;
  reduced: boolean;
  quality: "full" | "reduced";
  recordHref?: string;
  onModelReady: () => void;
  onModelError: () => void;
}

const ROT_AMPLITUDE = 0.05;
const BASE_Y = siteTerrainHeight(0, 0);

function DriftRig({
  driftRef,
  enabled,
  children,
}: {
  driftRef: RefObject<boolean>;
  enabled: boolean;
  children: ReactNode;
}) {
  const group = useRef<THREE.Group>(null);
  useFrame((state, delta) => {
    const g = group.current;
    if (!g) return;
    const active = enabled && !driftRef.current;
    const target = active
      ? Math.sin(state.clock.elapsedTime * 0.09) * ROT_AMPLITUDE
      : 0;
    const k = Math.min(1, delta * 1.4);
    g.rotation.y += (target - g.rotation.y) * k;
  });
  return <group ref={group}>{children}</group>;
}

function CameraRig({
  zoomIn,
  zoomOut,
  reset,
}: {
  zoomIn: number;
  zoomOut: number;
  reset: number;
}) {
  const controls = useThree((s) => s.controls) as {
    target: THREE.Vector3;
    update: () => void;
  } | null;
  const camera = useThree((s) => s.camera);
  const home = useRef<{ pos: THREE.Vector3; tgt: THREE.Vector3 } | null>(null);

  useEffect(() => {
    if (!controls) return;
    if (!home.current) {
      home.current = {
        pos: camera.position.clone(),
        tgt: controls.target.clone(),
      };
    }
  }, [controls, camera]);

  useEffect(() => {
    if (!controls || zoomIn === 0) return;
    const dir = controls.target.clone().sub(camera.position).normalize();
    camera.position.addScaledVector(dir, 2.4);
    controls.update();
  }, [zoomIn, controls, camera]);

  useEffect(() => {
    if (!controls || zoomOut === 0) return;
    const dir = controls.target.clone().sub(camera.position).normalize();
    camera.position.addScaledVector(dir, -2.4);
    controls.update();
  }, [zoomOut, controls, camera]);

  useEffect(() => {
    if (!controls || !home.current || reset === 0) return;
    camera.position.copy(home.current.pos);
    controls.target.copy(home.current.tgt);
    controls.update();
  }, [reset, controls, camera]);

  return null;
}

function Terrain({ quality }: { quality: "full" | "reduced" }) {
  const segs = quality === "full" ? 104 : 72;
  const half = 66;

  const geometry = useMemo(() => {
    const size = segs + 1;
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(size * size * 3);
    const uvs = new Float32Array(size * size * 2);
    const colors = new Float32Array(size * size * 3);
    const indices = new Uint32Array(segs * segs * 6);
    const rng = mulberry32(0x74657272);

    const soil = new THREE.Color(PALETTE.soil);
    const grass = new THREE.Color(PALETTE.grass);
    const rock = new THREE.Color(PALETTE.stoneDark);
    const scratch = new THREE.Color();

    for (let gy = 0; gy < size; gy += 1) {
      for (let gx = 0; gx < size; gx += 1) {
        const i = gy * size + gx;
        const x = -half + ((2 * half) / segs) * gx;
        const z = -half + ((2 * half) / segs) * gy;
        const h = siteTerrainHeight(x, z);
        positions[i * 3] = x;
        positions[i * 3 + 1] = h;
        positions[i * 3 + 2] = z;
        uvs[i * 2] = gx / segs;
        uvs[i * 2 + 1] = gy / segs;

        const slope = siteTerrainSlope(x, z);
        const veg = THREE.MathUtils.smoothstep(
          1.35 - slope * 1.9 - Math.max(0, h - 2.2) * 0.45,
          0.35,
          0.8
        );
        const rocky = THREE.MathUtils.smoothstep(
          slope - 0.5 + Math.max(0, 1.6 - h) * 0.2,
          0.4,
          0.75
        );
        const cliff = THREE.MathUtils.smoothstep(slope, 0.95, 1.45);
        scratch.copy(soil).lerp(grass, veg * 0.8).lerp(rock, rocky).lerp(rock, cliff * 0.6);
        const j = rng();
        scratch.multiplyScalar(0.9 + j * 0.2);
        colors[i * 3] = scratch.r;
        colors[i * 3 + 1] = scratch.g;
        colors[i * 3 + 2] = scratch.b;
      }
    }

    let k = 0;
    for (let gy = 0; gy < segs; gy += 1) {
      for (let gx = 0; gx < segs; gx += 1) {
        const a = gy * size + gx;
        const b = a + 1;
        const c = a + size;
        const d = c + 1;
        indices[k++] = a;
        indices[k++] = c;
        indices[k++] = b;
        indices[k++] = b;
        indices[k++] = c;
        indices[k++] = d;
      }
    }

    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("uv", new THREE.BufferAttribute(uvs, 2));
    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    geo.setIndex(new THREE.BufferAttribute(indices, 1));
    geo.computeVertexNormals();
    return geo;
  }, [segs, half]);

  const map = sceneTextures.terrainColor();
  map.repeat.set(34, 34);
  const bump = sceneTextures.terrainHeight();
  bump.repeat.set(34, 34);
  const rough = sceneTextures.roughness();
  rough.repeat.set(34, 34);

  return (
    <mesh geometry={geometry} receiveShadow>
      <meshStandardMaterial
        vertexColors
        map={map}
        bumpMap={bump}
        bumpScale={0.02}
        roughness={1}
        roughnessMap={rough}
        metalness={0}
      />
    </mesh>
  );
}

interface ScatterEntry {
  pos: [number, number, number];
  scale: [number, number, number];
  rot: [number, number, number];
  tint: string;
  away: number;
}

function scatter(count: number, seed: number, { minR, maxR }: { minR: number; maxR: number }): ScatterEntry[] {
  const rng = mulberry32(seed);
  const list: ScatterEntry[] = [];
  let guard = 0;
  while (list.length < count && guard < count * 16) {
    guard += 1;
    const a = rng() * Math.PI * 2;
    const r = minR + rng() * (maxR - minR);
    const x = Math.cos(a) * r;
    const z = Math.sin(a) * r;
    const y = siteTerrainHeight(x, z);
    const inFort = Math.abs(x) < 16 && Math.abs(z) < 38;
    const onApproach = Math.abs(z) > 24 && Math.abs(z) < 44 && Math.abs(x) < 24;
    if (inFort || onApproach) continue;
    const slope = siteTerrainSlope(x, z);
    if (y < 0.35 || y > 2.9 || slope > 0.8) continue;
    const away = Math.min(1, Math.max(0, r - 20) / 24);
    const sway = (0.7 + rng() * 0.9) * (0.55 + away * 0.65);
    list.push({
      pos: [x, y, z],
      scale: [sway, sway * (0.65 + rng() * 0.9), sway],
      rot: [rng() * 0.5, rng() * Math.PI * 2, rng() * 0.5],
      tint: rng() < 0.45 ? "#6e5a3f" : "#7c6a4a",
      away,
    });
  }
  return list;
}

function Scatter({ quality, shadowsOn }: { quality: "full" | "reduced"; shadowsOn: boolean }) {
  const fold = quality === "full" ? 1 : 0.5;
  const rocks = useMemo(() => scatter(Math.round(48 * fold), 0x726f636b, { minR: 10, maxR: 42 }), [fold]);
  const scrub = useMemo(() => scatter(Math.round(74 * fold), 0x73637275, { minR: 13, maxR: 45 }), [fold]);

  return (
    <>
      <Instances limit={rocks.length} range={rocks.length} castShadow={shadowsOn}>
        <dodecahedronGeometry args={[1, 0]} />
        <meshStandardMaterial color="#7a6849" roughness={0.98} flatShading metalness={0} />
        {rocks.map((e, i) => (
          <Instance key={i} position={e.pos} rotation={e.rot} scale={e.scale} />
        ))}
      </Instances>
      <Instances limit={scrub.length} range={scrub.length} castShadow={shadowsOn}>
        <sphereGeometry args={[1, 6, 5]} />
        <meshStandardMaterial color="#6f7d4f" roughness={1} flatShading metalness={0} />
        {scrub.map((e, i) => (
          <Instance key={i} position={e.pos} rotation={e.rot} scale={e.scale} />
        ))}
      </Instances>
    </>
  );
}

function Hotspots({
  hotspots,
  activeId,
  onSelect,
  recordHref,
}: {
  hotspots: HistoricalHotspot[];
  activeId: string | null;
  onSelect: (id: string | null) => void;
  recordHref?: string;
}) {
  return (
    <>
      {hotspots.map((hp) => {
        const active = hp.id === activeId;
        return (
          <Html key={hp.id} position={hp.position} zIndexRange={[4, 8]} wrapperClass="pointer-events-none">
            {active ? (
              <div className="scene-hotspot-panel pointer-events-auto">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-[0.55rem] font-bold uppercase tracking-[0.22em] text-bronze">
                    {hp.title} · landmark
                  </p>
                  <button
                    type="button"
                    aria-label="Close landmark panel"
                    onClick={() => onSelect(null)}
                    className="scene-control"
                  >
                    <X className="h-3.5 w-3.5" strokeWidth={1.6} />
                  </button>
                </div>
                <p className="mt-1.5 font-display text-lg font-semibold leading-tight text-ink">
                  {hp.title}
                </p>
                <p className="mt-1.5 text-xs leading-relaxed text-ink-muted">{hp.description}</p>
                {recordHref ? (
                  <a
                    href={recordHref}
                    className="mt-2.5 inline-flex items-center gap-1.5 border-b border-bronze/60 pb-0.5 text-[0.6rem] font-semibold uppercase tracking-[0.18em] text-bronze hover:border-ink hover:text-ink"
                  >
                    Explore Record
                    <ExternalLink className="h-3 w-3" strokeWidth={1.6} />
                  </a>
                ) : null}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => onSelect(hp.id)}
                className="scene-chip pointer-events-auto"
              >
                <span className="scene-dot" aria-hidden="true" />
                {hp.title}
              </button>
            )}
          </Html>
        );
      })}
    </>
  );
}

export default function PratapgadScene(props: PratapgadSceneProps) {
  const shadowsOn = props.quality === "full";
  const driftRef = useRef(false);
  const continuous = props.driftEnabled && !props.reduced;

  return (
    <Canvas
      shadows="soft"
      dpr={props.quality === "full" ? [1, 1.75] : [1, 1.25]}
      camera={{ position: [24, 19, 36], fov: 42, near: 0.1, far: 700 }}
      gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
      frameloop={continuous ? "always" : "demand"}
      onCreated={({ gl }) => {
        gl.setClearColor("#e9dfc6");
      }}
    >
      <fog attach="fog" args={["#e7dcc2", 70, 250]} />
      <SceneEnvironment shadowsOn={shadowsOn} />

      <DriftRig driftRef={driftRef} enabled={props.driftEnabled}>
        <Terrain quality={props.quality} />
        <Scatter quality={props.quality} shadowsOn={shadowsOn} />
        {props.mode === "model" ? (
          <HistoricalModel
            path={props.modelPath}
            transform={props.transform}
            onReady={props.onModelReady}
            onError={props.onModelError}
          />
        ) : (
          <ProceduralFort baseY={BASE_Y} shadowsOn={shadowsOn} />
        )}
        <Hotspots
          hotspots={props.hotspots}
          activeId={props.activeHotspotId}
          onSelect={props.onSelectHotspot}
          recordHref={props.recordHref}
        />
      </DriftRig>

      <CameraRig
        zoomIn={props.zoomInSignal}
        zoomOut={props.zoomOutSignal}
        reset={props.resetSignal}
      />
      <OrbitControls
        makeDefault
        target={[0, BASE_Y + 0.8, 0]}
        enableDamping
        dampingFactor={0.08}
        minDistance={13}
        maxDistance={64}
        minPolarAngle={0.5}
        maxPolarAngle={1.2}
        onStart={() => {
          driftRef.current = true;
        }}
        onEnd={() => {
          window.setTimeout(() => {
            driftRef.current = false;
          }, 1600);
        }}
      />
    </Canvas>
  );
}