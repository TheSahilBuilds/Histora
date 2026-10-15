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
  const rings = quality === "full" ? 92 : 64;
  const segs = quality === "full" ? 128 : 88;
  const radius = 78;
  const skirtSteps = 3;
  const skirtY = -44;

  const geometry = useMemo(() => {
    const totalRings = rings + skirtSteps;
    const size = (totalRings + 1) * (segs + 1);
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(size * 3);
    const uvs = new Float32Array(size * 2);
    const colors = new Float32Array(size * 3);
    const indices = new Uint32Array(totalRings * segs * 6);
    const rng = mulberry32(0x74657272);

    const earth = new THREE.Color(PALETTE.earth);
    const grass = new THREE.Color(PALETTE.grass);
    const rock = new THREE.Color(PALETTE.stoneDark);
    const scratch = new THREE.Color();

    for (let ri = 0; ri <= totalRings; ri += 1) {
      const inSkirt = ri > rings;
      const rr = inSkirt ? radius : (ri / rings) * radius;
      for (let si = 0; si <= segs; si += 1) {
        const ang = (si / segs) * Math.PI * 2;
        const x = Math.cos(ang) * rr;
        const z = Math.sin(ang) * rr;
        const i = ri * (segs + 1) + si;

        if (inSkirt) {
          const rimH = siteTerrainHeight(x, z);
          const t = (ri - rings) / skirtSteps;
          positions[i * 3 + 1] = rimH + (skirtY - rimH) * t;
        } else {
          positions[i * 3 + 1] = siteTerrainHeight(x, z);
        }
        positions[i * 3] = x;
        positions[i * 3 + 2] = z;
        uvs[i * 2] = (x + radius) / (2 * radius);
        uvs[i * 2 + 1] = (z + radius) / (2 * radius);

        if (inSkirt) {
          scratch.copy(rock).multiplyScalar(0.72 + rng() * 0.1);
        } else {
          const h = positions[i * 3 + 1];
          const slope = siteTerrainSlope(x, z);
          const veg = THREE.MathUtils.smoothstep(
            1.25 - slope * 1.7 - Math.max(0, h - 2.6) * 0.5,
            0.3,
            0.85
          );
          const rocky = THREE.MathUtils.smoothstep(slope - 0.45, 0.35, 0.8);
          scratch.copy(earth).lerp(grass, veg * 0.7).lerp(rock, rocky * 0.85);
          scratch.multiplyScalar(0.94 + rng() * 0.12);
        }
        colors[i * 3] = scratch.r;
        colors[i * 3 + 1] = scratch.g;
        colors[i * 3 + 2] = scratch.b;
      }
    }

    let k = 0;
    for (let ri = 0; ri < totalRings; ri += 1) {
      for (let si = 0; si < segs; si += 1) {
        const a = ri * (segs + 1) + si;
        const b = a + 1;
        const c = (ri + 1) * (segs + 1) + si;
        const d = c + 1;
        indices[k++] = a;
        indices[k++] = b;
        indices[k++] = c;
        indices[k++] = b;
        indices[k++] = d;
        indices[k++] = c;
      }
    }

    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("uv", new THREE.BufferAttribute(uvs, 2));
    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    geo.setIndex(new THREE.BufferAttribute(indices, 1));
    geo.computeVertexNormals();
    return geo;
  }, [rings, segs, radius, skirtSteps, skirtY]);

  const map = sceneTextures.terrainColor();
  map.repeat.set(18, 18);
  const bump = sceneTextures.terrainHeight();
  bump.repeat.set(18, 18);
  const rough = sceneTextures.roughness();
  rough.repeat.set(18, 18);

  return (
    <mesh geometry={geometry} receiveShadow>
      <meshStandardMaterial
        vertexColors
        map={map}
        bumpMap={bump}
        bumpScale={0.05}
        roughness={0.98}
        roughnessMap={rough}
        metalness={0}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

interface ScatterEntry {
  pos: [number, number, number];
  scale: [number, number, number];
  rot: [number, number, number];
  tint: string;
}

function scatter(
  count: number,
  seed: number,
  kind: "rock" | "scrub",
  { minR, maxR }: { minR: number; maxR: number }
): ScatterEntry[] {
  const rng = mulberry32(seed);
  const list: ScatterEntry[] = [];
  let guard = 0;
  while (list.length < count && guard < count * 20) {
    guard += 1;
    const a = rng() * Math.PI * 2;
    const r = minR + rng() * (maxR - minR);
    const x = Math.cos(a) * r;
    const z = Math.sin(a) * r;
    const y = siteTerrainHeight(x, z);
    const inFort = Math.abs(x) < 17 && Math.abs(z) < 40;
    const onApproach = Math.abs(z) > 24 && Math.abs(z) < 46 && Math.abs(x) < 26;
    if (inFort || onApproach) continue;
    const slope = siteTerrainSlope(x, z);
    if (y < 0.2 || y > 3.2 || slope > 0.7) continue;
    const away = Math.min(1, Math.max(0, r - 24) / 30);
    if (kind === "rock") {
      const s = (0.3 + rng() * 0.4) * (1 + away * 0.5);
      list.push({
        pos: [x, y - s * 0.35, z],
        scale: [s, s * (0.6 + rng() * 0.5), s],
        rot: [rng() * Math.PI, rng() * Math.PI * 2, rng() * Math.PI],
        tint: rng() < 0.5 ? "#7a6849" : "#6b5940",
      });
    } else {
      const s = (0.4 + rng() * 0.5) * (1 + away * 0.4);
      list.push({
        pos: [x, y - 0.05, z],
        scale: [s, s * (0.5 + rng() * 0.4), s],
        rot: [0, rng() * Math.PI * 2, 0],
        tint: rng() < 0.5 ? "#6f7d4f" : "#5f6b45",
      });
    }
  }
  return list;
}

function Scatter({ quality, shadowsOn }: { quality: "full" | "reduced"; shadowsOn: boolean }) {
  const fold = quality === "full" ? 1 : 0.5;
  const rocks = useMemo(
    () => scatter(Math.round(26 * fold), 0x726f636b, "rock", { minR: 18, maxR: 58 }),
    [fold]
  );
  const scrub = useMemo(
    () => scatter(Math.round(42 * fold), 0x73637275, "scrub", { minR: 20, maxR: 60 }),
    [fold]
  );

  return (
    <>
      <Instances limit={rocks.length} range={rocks.length} castShadow={shadowsOn}>
        <dodecahedronGeometry args={[1, 0]} />
        <meshStandardMaterial color="#7a6849" roughness={0.98} flatShading metalness={0} />
        {rocks.map((e, i) => (
          <Instance key={i} position={e.pos} rotation={e.rot} scale={e.scale} color={e.tint} />
        ))}
      </Instances>
      <Instances limit={scrub.length} range={scrub.length} castShadow={shadowsOn}>
        <sphereGeometry args={[1, 6, 5]} />
        <meshStandardMaterial color="#6f7d4f" roughness={1} flatShading metalness={0} />
        {scrub.map((e, i) => (
          <Instance key={i} position={e.pos} rotation={e.rot} scale={e.scale} color={e.tint} />
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
      shadows
      dpr={props.quality === "full" ? [1, 1.75] : [1, 1.25]}
      camera={{ position: [25, 15, 33], fov: 40, near: 0.1, far: 700 }}
      gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
      frameloop={continuous ? "always" : "demand"}
      onCreated={({ gl }) => {
        gl.setClearColor("#e9dfc6");
      }}
    >
      <fog attach="fog" args={["#e7dcc2", 72, 260]} />
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
        enablePan={false}
        minDistance={16}
        maxDistance={56}
        minPolarAngle={0.6}
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