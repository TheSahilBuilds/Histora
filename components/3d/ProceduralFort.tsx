"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { mulberry32, siteTerrainHeight, PALETTE } from "./sceneUtils";
import { sceneTextures } from "./sceneTextures";

interface ProceduralFortProps {
  baseY: number;
  shadowsOn: boolean;
}

const N = 10;
const R = 7.6;

interface Anchor {
  x: number;
  z: number;
  a: number;
  r: number;
}

function anchorsFor(seed: number): Anchor[] {
  const rng = mulberry32(seed);
  return Array.from({ length: N }, (_, i) => {
    const a0 = (i / N) * Math.PI * 2;
    const j = rng();
    const a = a0 + (j - 0.5) * 0.7;
    const r = R + (j - 0.5) * 1.7;
    return { x: r * Math.cos(a), z: r * Math.sin(a), a, r };
  });
}

function angularDistance(a: number, b: number): number {
  let d = Math.abs(a - b);
  d = d % (Math.PI * 2);
  return d > Math.PI ? Math.PI * 2 - d : d;
}

function wallShape(L: number, hA: number, hB: number): THREE.Shape {
  const s = new THREE.Shape();
  s.moveTo(-L / 2, 0);
  s.lineTo(L / 2, 0);
  s.lineTo(L / 2, hB);
  s.lineTo(0, hB + 0.35);
  s.lineTo(-L / 2, hA + 0.2);
  s.closePath();
  return s;
}

const extrudeOpts = {
  depth: 0.6,
  bevelEnabled: true,
  bevelThickness: 0.08,
  bevelSize: 0.08,
  bevelSegments: 1,
  steps: 1,
  curveSegments: 3,
};

function irregularPolygon(radius: number, sides: number, seed: number): THREE.Shape {
  const rng = mulberry32(seed);
  const s = new THREE.Shape();
  for (let i = 0; i < sides; i += 1) {
    const a = (i / sides) * Math.PI * 2;
    const rr = radius * (0.72 + rng() * 0.56);
    const x = Math.cos(a) * rr;
    const y = Math.sin(a) * rr;
    if (i === 0) s.moveTo(x, y);
    else s.lineTo(x, y);
  }
  s.closePath();
  return s;
}

export default function ProceduralFort({ baseY, shadowsOn }: ProceduralFortProps) {
  const anchors = useMemo(() => anchorsFor(0x70617274), []);
  const gateIndex = useMemo(() => {
    let best = 0;
    let bestD = Infinity;
    for (let i = 0; i < N; i += 1) {
      const d = angularDistance(anchors[i].a, 0.5);
      if (d < bestD) {
        bestD = d;
        best = i;
      }
    }
    return best;
  }, [anchors]);

  const materials = useMemo(
    () => ({
      stoneA: new THREE.MeshStandardMaterial({
        color: "#a08a66",
        map: sceneTextures.stoneColor(),
        bumpMap: sceneTextures.stoneHeight(),
        bumpScale: 0.7,
        roughness: 0.95,
        roughnessMap: sceneTextures.roughness(),
      }),
      stoneB: new THREE.MeshStandardMaterial({
        color: "#8f7a58",
        map: sceneTextures.stoneColor(),
        bumpMap: sceneTextures.stoneHeight(),
        bumpScale: 0.7,
        roughness: 1,
        roughnessMap: sceneTextures.roughness(),
      }),
      wood: new THREE.MeshStandardMaterial({
        color: "#4a332a",
        roughness: 1,
        bumpMap: sceneTextures.stoneHeight(),
        bumpScale: 0.15,
      }),
      roof: new THREE.MeshStandardMaterial({
        color: "#3f2f22",
        roughness: 0.9,
        bumpMap: sceneTextures.stoneHeight(),
        bumpScale: 0.2,
      }),
      dark: new THREE.MeshStandardMaterial({
        color: PALETTE.ink,
        roughness: 0.6,
        metalness: 0.05,
      }),
      dirt: new THREE.MeshStandardMaterial({
        color: PALETTE.stoneDark,
        roughness: 1,
        bumpMap: sceneTextures.stoneHeight(),
        bumpScale: 0.3,
      }),
    }),
    []
  );

  const walls = useMemo(() => {
    const rng = mulberry32(0x77616cca);
    const list: {
      pos: [number, number, number];
      rotY: number;
      mat: THREE.MeshStandardMaterial;
      geom: THREE.ExtrudeGeometry;
    }[] = [];
    for (let i = 0; i < N; i += 1) {
      if (i === gateIndex || i === (gateIndex + 1) % N) continue;
      const p1 = anchors[i];
      const p2 = anchors[(i + 1) % N];
      const mx = (p1.x + p2.x) / 2;
      const mz = (p1.z + p2.z) / 2;
      const dx = p2.x - p1.x;
      const dz = p2.z - p1.z;
      const L = Math.hypot(dx, dz);
      const hA = 2.2 + rng() * 0.8;
      const hB = 2.3 + rng() * 0.9;
      const geom = new THREE.ExtrudeGeometry(wallShape(L, hA, hB), extrudeOpts);
      list.push({
        pos: [mx, baseY - 0.18, mz],
        rotY: Math.atan2(-dz, dx),
        mat: i % 2 === 0 ? materials.stoneA : materials.stoneB,
        geom,
      });
    }
    return list;
  }, [anchors, baseY, gateIndex, materials]);

  const bastions = useMemo(() => {
    const seeds = [(gateIndex + 3) % N, (gateIndex + 5) % N, (gateIndex + 7) % N];
    const rng = mulberry32(0x62617374);
    return seeds.map((bi, idx) => {
      const a = anchors[bi];
      const yaw = Math.atan2(Math.cos(a.a), Math.sin(a.a));
      const rBase = 2.1 + rng() * 0.5;
      const lower = new THREE.ExtrudeGeometry(irregularPolygon(rBase, 8, rng() * 0xffff), {
        depth: 2.6,
        bevelEnabled: true,
        bevelThickness: 0.12,
        bevelSize: 0.12,
        bevelSegments: 1,
        steps: 1,
        curveSegments: 3,
      });
      const upper = new THREE.ExtrudeGeometry(irregularPolygon(rBase * 0.72, 8, rng() * 0xffff), {
        depth: 1.5,
        bevelEnabled: true,
        bevelThickness: 0.1,
        bevelSize: 0.1,
        bevelSegments: 1,
        steps: 1,
        curveSegments: 3,
      });
      const merlonPos = Array.from({ length: 4 }, (_, k) => {
        const ma = (k / 4) * Math.PI * 2 + rng() * 0.4;
        const mr = rBase * 0.9;
        return [Math.cos(ma) * mr, Math.sin(ma) * mr];
      });
      return {
        a,
        yaw,
        lower,
        upper,
        merlons: merlonPos,
        mat: idx % 2 === 0 ? materials.stoneA : materials.stoneB,
      };
    });
  }, [anchors, gateIndex, materials]);

  const gateA = anchors[gateIndex].a;
  const gateYaw = Math.atan2(Math.cos(gateA), Math.sin(gateA));
  const outX = Math.cos(gateA);
  const outZ = Math.sin(gateA);

  const steps = useMemo(() => {
    return Array.from({ length: 9 }, (_, i) => {
      const d = 1.4 + i * 1.35;
      return {
        x: anchors[gateIndex].x + outX * d,
        z: anchors[gateIndex].z + outZ * d,
        y: siteTerrainHeight(anchors[gateIndex].x + outX * d, anchors[gateIndex].z + outZ * d) + 0.14,
        w: 2.6 - i * 0.12,
      };
    });
  }, [anchors, gateIndex, outX, outZ]);

  return (
    <group>
      {walls.map((w, i) => (
        <mesh
          key={`wall-${i}`}
          geometry={w.geom}
          material={w.mat}
          position={w.pos}
          rotation={[0, w.rotY, 0]}
          castShadow={shadowsOn}
          receiveShadow
        />
      ))}

      {bastions.map((b, i) => (
        <group key={`bastion-${i}`} position={[b.a.x, baseY, b.a.z]} rotation={[0, b.yaw, 0]}>
          <mesh geometry={b.lower} material={b.mat} castShadow={shadowsOn} receiveShadow />
          <mesh geometry={b.upper} material={b.mat} position={[0, 2.56, 0]} castShadow={shadowsOn} receiveShadow />
          <mesh position={[0, 4.18, 0]} castShadow={shadowsOn} receiveShadow>
            <cylinderGeometry args={[2.3, 2.3, 0.16, 8]} />
            <meshStandardMaterial color={PALETTE.stoneLight} roughness={0.95} />
          </mesh>
          {b.merlons.map(([mx, mz], k) => (
            <mesh key={k} position={[mx, 4.5, mz]} castShadow={shadowsOn}>
              <boxGeometry args={[0.42, 0.6, 0.42]} />
              <meshStandardMaterial color={PALETTE.stoneLight} roughness={1} />
            </mesh>
          ))}
        </group>
      ))}

      <group position={[anchors[gateIndex].x, baseY, anchors[gateIndex].z]} rotation={[0, gateYaw, 0]}>
        <mesh geometry={new THREE.ExtrudeGeometry(gateFrameShape(), extrudeOpts)} material={materials.stoneA} castShadow={shadowsOn} receiveShadow />
        <mesh position={[0, 1.95, 0.32]} material={materials.wood}>
          <planeGeometry args={[2.4, 3.3]} />
        </mesh>
        <mesh position={[0, 4.75, 0.15]} castShadow={shadowsOn}>
          <boxGeometry args={[4.4, 0.5, 0.7]} />
          <meshStandardMaterial color={PALETTE.stoneLight} roughness={0.9} />
        </mesh>
        <mesh position={[0, 5.25, 0.55]} castShadow={shadowsOn}>
          <boxGeometry args={[4.2, 0.22, 1.4]} />
          <meshStandardMaterial color={PALETTE.stone} roughness={1} />
        </mesh>
        {[-1.1, 0, 1.1].map((px, k) => (
          <mesh key={k} position={[px, 5.62, 0.62]} castShadow={shadowsOn}>
            <boxGeometry args={[0.5, 0.62, 0.4]} />
            <meshStandardMaterial color={PALETTE.stoneLight} roughness={1} />
          </mesh>
        ))}
        {[-3.4, 3.4].map((jx, k) => (
          <mesh key={k} position={[jx, 1.7, 0.28]} rotation={[0, 0, k === 0 ? 0.05 : -0.05]} castShadow={shadowsOn}>
            <boxGeometry args={[0.85, 3.4, 0.7]} />
            <meshStandardMaterial color={PALETTE.stone} roughness={1} bumpMap={sceneTextures.stoneHeight()} bumpScale={0.5} />
          </mesh>
        ))}
      </group>

      {steps.map((s, i) => (
        <mesh
          key={`step-${i}`}
          position={[s.x, s.y, s.z]}
          rotation={[0, gateYaw, 0]}
          castShadow={shadowsOn}
          receiveShadow
        >
          <boxGeometry args={[s.w, 0.3, 0.9]} />
          <primitive object={materials.dirt} attach="material" />
        </mesh>
      ))}

      <group position={[0.4, baseY, -0.5]}>
        <mesh position={[0, 0.5, 0]} castShadow={shadowsOn} receiveShadow>
          <cylinderGeometry args={[4.3, 4.3, 1, 8]} />
          <meshStandardMaterial color={PALETTE.stoneLight} roughness={1} flatShading bumpMap={sceneTextures.stoneHeight()} bumpScale={0.5} />
        </mesh>
        <mesh position={[0, 1.6, 0]} castShadow={shadowsOn} receiveShadow>
          <boxGeometry args={[4.6, 3.2, 3.4]} />
          <primitive object={materials.stoneB} attach="material" />
        </mesh>
        <mesh position={[0, 3.2, 0]} rotation={[0, 0, 0]} castShadow={shadowsOn}>
          <extrudeGeometry args={[roofShape(), { ...extrudeOpts, depth: 3.9 }]} />
          <primitive object={materials.roof} attach="material" />
        </mesh>
        {[
          [2.31, 0],
          [-2.31, 0],
          [0, 1.71],
        ].map(([wx, wz], k) => (
          <mesh key={k} position={[wx, 2.2, wz]} material={materials.dark}>
            <planeGeometry args={[0.9, 1.6]} />
          </mesh>
        ))}
        <mesh position={[2.7, 4.4, -1.1]} castShadow={shadowsOn}>
          <cylinderGeometry args={[0.05, 0.06, 3, 6]} />
          <meshStandardMaterial color={PALETTE.wood} roughness={0.8} />
        </mesh>
        <mesh position={[2.7, 5.9, -1.1]} castShadow={shadowsOn}>
          <planeGeometry args={[1.5, 0.8]} />
          <meshStandardMaterial color="#c68a3c" roughness={0.7} side={THREE.DoubleSide} />
        </mesh>
      </group>
    </group>
  );
}

function gateFrameShape(): THREE.Shape {
  const s = new THREE.Shape();
  s.moveTo(-1.8, 0);
  s.lineTo(1.8, 0);
  s.lineTo(1.8, 4.6);
  s.lineTo(-1.8, 4.6);
  s.closePath();
  const hole = new THREE.Path();
  hole.moveTo(-1.3, 0.4);
  hole.lineTo(1.3, 0.4);
  hole.lineTo(1.3, 3.8);
  hole.lineTo(-1.3, 3.8);
  hole.closePath();
  s.holes.push(hole);
  return s;
}

function roofShape(): THREE.Shape {
  const s = new THREE.Shape();
  s.moveTo(-2.5, 0);
  s.lineTo(2.5, 0);
  s.lineTo(2.5, 2.6);
  s.lineTo(0, 3.4);
  s.lineTo(-2.5, 2.6);
  s.closePath();
  return s;
}