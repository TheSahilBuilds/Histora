"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useReducedMotion } from "motion/react";
import * as THREE from "three";
import { PALETTE, detectQuality, terrainHeight } from "./sceneUtils";

function Ridges() {
  const reduced = useReducedMotion();
  const ref = useRef<THREE.Group>(null);

  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(48, 48, 46, 46);
    const pos = geo.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < pos.count; i += 1) {
      const worldX = pos.getX(i);
      const worldZ = -pos.getY(i);
      let h = terrainHeight(worldX, worldZ) * 0.85;
      h += 0.9 * Math.exp(-(((worldX + 15) / 10) ** 2 + ((worldZ - 6) / 9) ** 2));
      h += 0.55 * Math.exp(-(((worldX - 14) / 11) ** 2 + ((worldZ + 12) / 10) ** 2));
      pos.setZ(i, Math.max(h, -0.9));
    }
    geo.computeVertexNormals();
    return geo;
  }, []);

  useFrame(({ clock }) => {
    if (!ref.current || reduced) return;
    const t = clock.getElapsedTime();
    ref.current.rotation.y = Math.sin(t * 0.05) * 0.04;
    ref.current.position.y = Math.sin(t * 0.11) * 0.05;
  });

  return (
    <group ref={ref}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, -2]} geometry={geometry}>
        <meshStandardMaterial color="#4a3a28" roughness={1} metalness={0} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.4, -18]} scale={2}>
        <boxGeometry args={[30, 0.6, 26]} />
        <meshStandardMaterial color="#3c2e20" roughness={1} metalness={0} />
      </mesh>
    </group>
  );
}

function FortSilhouette() {
  const base = terrainHeight(0, 2) * 0.85 + 0.05;
  const walls = Array.from({ length: 6 }, (_, i) => {
    const angle = i * (Math.PI / 3);
    return {
      x: Math.sin(angle) * 1.7,
      z: Math.cos(angle) * 1.7,
      rot: -angle,
    };
  });
  return (
    <group position={[0, 0, 2]}>
      {walls.map((w, i) => (
        <mesh key={`hw-${i}`} position={[w.x, base + 0.6, w.z]} rotation={[0, w.rot, 0]}>
          <boxGeometry args={[1.8, 1.2, 0.34]} />
          <meshStandardMaterial color="#2e2317" roughness={1} metalness={0} />
        </mesh>
      ))}
      <mesh position={[0, base + 1.25, 0]}>
        <boxGeometry args={[1.1, 1.1, 0.9]} />
        <meshStandardMaterial color="#2a1f13" roughness={1} metalness={0} />
      </mesh>
      <mesh position={[0, base + 2.05, 0]}>
        <cylinderGeometry args={[0.18, 0.24, 0.75, 6]} />
        <meshStandardMaterial color="#241b10" roughness={1} metalness={0} />
      </mesh>
    </group>
  );
}

export default function HeroCanvas() {
  const reduced = useReducedMotion();
  const quality = detectQuality();

  return (
    <Canvas
      camera={{ position: [0, 6.2, 17], fov: 44 }}
      dpr={quality === "reduced" ? [1, 1.3] : [1, 1.6]}
      frameloop={reduced ? "demand" : "always"}
      gl={{ antialias: true, alpha: true }}
    >
      <ambientLight intensity={0.3} />
      <hemisphereLight args={[PALETTE.parchment, PALETTE.ink, 0.7]} />
      <directionalLight position={[8, 14, 10]} intensity={1.3} color={PALETTE.paper} />

      <Ridges />
      <FortSilhouette />
    </Canvas>
  );
}