'use client';

import { useEffect, useMemo, useRef, type MutableRefObject } from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import {
  Color,
  DynamicDrawUsage,
  InstancedMesh,
  Matrix4,
  Mesh,
  Object3D,
  Vector3,
  type BufferGeometry,
  type Material,
} from 'three';
import { nearCameraVisibility, playerMovedBeyond, type WorldPlacement } from '@/components/world/archiveWorldOcclusion';
import type { GameDestination } from '@/components/world/archiveGameTypes';
import {
  TREE_CHUNK_SIZE,
  TREE_MAX_PER_VARIANT,
  TREE_RENDER_RADIUS,
  treePlacementsAround,
} from '@/components/world/archiveTreePlacements';

export const QUATERNIUS_NATURE_ROOT = '/archive-world/quaternius-nature';
export interface QuaterniusAssetPart {
  geometry: BufferGeometry;
  material: Material | Material[];
  localMatrix: Matrix4;
}

function fadedMaterial(material: Material) {
  const clone = material.clone();
  if ('color' in clone && clone.color instanceof Color) {
    clone.color.multiply(new Color('#a7b29a'));
  }
  if ('alphaTest' in clone && typeof clone.alphaTest === 'number' && clone.transparent) {
    clone.alphaTest = Math.max(0.36, clone.alphaTest);
  }
  clone.needsUpdate = true;
  return clone;
}

export function collectQuaterniusParts(root: Object3D): QuaterniusAssetPart[] {
  root.updateMatrixWorld(true);
  const parts: QuaterniusAssetPart[] = [];
  root.traverse((object) => {
    if (!(object instanceof Mesh)) return;
    const material = Array.isArray(object.material)
      ? object.material.map(fadedMaterial)
      : fadedMaterial(object.material);
    parts.push({
      geometry: object.geometry,
      material,
      localMatrix: object.matrixWorld.clone(),
    });
  });
  return parts;
}

export default function QuaterniusForest({
  playerPosition,
  destinations,
  clearings = [],
  heightAt,
}: {
  playerPosition: MutableRefObject<import('three').Vector3>;
  destinations: GameDestination[];
  clearings?: readonly (readonly [number, number, number])[];
  heightAt: (x: number, z: number) => number;
}) {
  const common1 = useGLTF(`${QUATERNIUS_NATURE_ROOT}/CommonTree_1.gltf`);
  const common2 = useGLTF(`${QUATERNIUS_NATURE_ROOT}/CommonTree_2.gltf`);
  const common4 = useGLTF(`${QUATERNIUS_NATURE_ROOT}/CommonTree_4.gltf`);
  const pine1 = useGLTF(`${QUATERNIUS_NATURE_ROOT}/Pine_1.gltf`);
  const pine3 = useGLTF(`${QUATERNIUS_NATURE_ROOT}/Pine_3.gltf`);
  const pine5 = useGLTF(`${QUATERNIUS_NATURE_ROOT}/Pine_5.gltf`);
  const twisted2 = useGLTF(`${QUATERNIUS_NATURE_ROOT}/TwistedTree_2.gltf`);
  const twisted5 = useGLTF(`${QUATERNIUS_NATURE_ROOT}/TwistedTree_5.gltf`);
  const partsByVariant = useMemo(
    () => [common1, common2, common4, pine1, pine3, pine5, twisted2, twisted5].map(
      (asset) => collectQuaterniusParts(asset.scene),
    ),
    [common1, common2, common4, pine1, pine3, pine5, twisted2, twisted5],
  );
  const meshes = useRef<Array<Array<InstancedMesh | null>>>([]);
  const placementsRef = useRef<Array<WorldPlacement[]>>([]);
  const lastChunk = useRef('');
  const lastVisibilityPosition = useMemo(() => new Vector3(Number.POSITIVE_INFINITY, 0, 0), []);
  const baseMatrix = useMemo(() => new Matrix4(), []);
  const finalMatrix = useMemo(() => new Matrix4(), []);
  const fadeScale = useMemo(() => new Vector3(), []);

  useFrame(() => {
    const centerX = Math.floor(playerPosition.current.x / TREE_CHUNK_SIZE);
    const centerZ = Math.floor(playerPosition.current.z / TREE_CHUNK_SIZE);
    const chunkKey = `${centerX}:${centerZ}`;
    if (meshes.current.length !== partsByVariant.length) return;
    const chunkChanged = chunkKey !== lastChunk.current;
    if (chunkChanged) {
      lastChunk.current = chunkKey;
      const placements = treePlacementsAround({
        centerX,
        centerZ,
        radius: TREE_RENDER_RADIUS,
        destinations,
        clearings,
        heightAt,
      });
      placementsRef.current = placements;
    }
    if (!chunkChanged && !playerMovedBeyond(playerPosition.current, lastVisibilityPosition, 0.35)) return;
    lastVisibilityPosition.set(playerPosition.current.x, 0, playerPosition.current.z);
    partsByVariant.forEach((parts, variantIndex) => {
      parts.forEach((part, partIndex) => {
        const mesh = meshes.current[variantIndex]?.[partIndex];
        if (!mesh) return;
        const activePlacements = placementsRef.current[variantIndex] ?? [];
        for (let index = 0; index < activePlacements.length; index += 1) {
          const placement = activePlacements[index];
          const visibility = nearCameraVisibility(playerPosition.current, placement, 1.1, 3.8);
          baseMatrix.copy(placement.matrix).scale(fadeScale.setScalar(visibility));
          finalMatrix.multiplyMatrices(baseMatrix, part.localMatrix);
          mesh.setMatrixAt(index, finalMatrix);
        }
        mesh.count = activePlacements.length;
        mesh.instanceMatrix.needsUpdate = true;
        if (chunkChanged) mesh.computeBoundingSphere();
      });
    });

  });

  useEffect(() => {
    lastChunk.current = '';
    lastVisibilityPosition.set(Number.POSITIVE_INFINITY, 0, 0);
  }, [lastVisibilityPosition, partsByVariant]);

  return (
    <group name="quaternius-cc0-forest">
      {partsByVariant.map((parts, variantIndex) => (
        <group key={variantIndex}>
          {parts.map((part, partIndex) => (
            <instancedMesh
              key={partIndex}
              ref={(mesh) => {
                meshes.current[variantIndex] ??= [];
                meshes.current[variantIndex][partIndex] = mesh;
                mesh?.instanceMatrix.setUsage(DynamicDrawUsage);
              }}
              args={[part.geometry, part.material, TREE_MAX_PER_VARIANT]}
              castShadow
              receiveShadow
            />
          ))}
        </group>
      ))}
    </group>
  );
}
