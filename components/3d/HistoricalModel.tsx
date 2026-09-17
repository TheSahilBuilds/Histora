"use client";

import { Component, Suspense, useLayoutEffect, type ReactNode } from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { siteTerrainHeight } from "./sceneUtils";
import type { ModelTransform } from "@/lib/sites";

interface HistoricalModelProps {
  path: string;
  transform?: ModelTransform;
  onReady: () => void;
  onError: () => void;
}

function applyModelTransform(scene: THREE.Group, transform: ModelTransform | undefined) {
  if (!transform) return;

  if (transform.excludePrefixes?.length) {
    for (const node of [...scene.children]) {
      const name = node.name || "";
      if (transform.excludePrefixes.some((prefix) => name.startsWith(prefix))) {
        scene.remove(node);
        node.traverse((obj) => {
          const mesh = obj as THREE.Mesh;
          if (mesh.isMesh) {
            mesh.geometry?.dispose();
            const mat = mesh.material as THREE.Material | THREE.Material[] | undefined;
            if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
            else mat?.dispose();
          }
        });
      }
    }
  }

  if (transform.rotationY) {
    scene.rotation.y = (transform.rotationY * Math.PI) / 180;
  }

  if (transform.targetHeight) {
    const box = new THREE.Box3().setFromObject(scene);
    const height = box.max.y - box.min.y;
    if (height > 0) {
      const ratio = transform.targetHeight / height;
      scene.scale.setScalar(scene.scale.x * ratio);
      scene.updateWorldMatrix(true, true);
    }
  }

  const box = new THREE.Box3().setFromObject(scene);
  const cx = (box.min.x + box.max.x) / 2;
  const cz = (box.min.z + box.max.z) / 2;
  const base = box.min.y;
  const restY = transform.restOnTerrain
    ? siteTerrainHeight(0, 0) - (transform.embed ?? 0)
    : 0;
  scene.position.x -= cx;
  scene.position.y += restY - base;
  scene.position.z -= cz;
}

function ModelView({
  path,
  transform,
  onReady,
}: {
  path: string;
  transform?: ModelTransform;
  onReady: () => void;
}) {
  const gltf = useGLTF(path);

  useLayoutEffect(() => {
    applyModelTransform(gltf.scene, transform);
    gltf.scene.traverse((node) => {
      const mesh = node as THREE.Mesh;
      if (mesh.isMesh) {
        mesh.castShadow = true;
        mesh.receiveShadow = true;
      }
    });
  }, [gltf, transform]);

  useLayoutEffect(() => {
    onReady();
  }, [onReady]);

  return <primitive object={gltf.scene} />;
}

interface BoundaryProps {
  onError: () => void;
  children: ReactNode;
}

class ModelBoundary extends Component<BoundaryProps, { hasError: boolean }> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch() {
    this.props.onError();
  }

  render() {
    return this.state.hasError ? null : this.props.children;
  }
}

export default function HistoricalModel({ path, transform, onReady, onError }: HistoricalModelProps) {
  return (
    <ModelBoundary onError={onError}>
      <Suspense fallback={null}>
        <ModelView path={path} transform={transform} onReady={onReady} />
      </Suspense>
    </ModelBoundary>
  );
}