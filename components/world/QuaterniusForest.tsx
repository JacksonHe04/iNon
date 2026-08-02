'use client';

import { useEffect, useMemo, useRef, type MutableRefObject } from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import {
  Color,
  InstancedMesh,
  Matrix4,
  Mesh,
  Object3D,
  type BufferGeometry,
  type Material,
} from 'three';
import { isInsideWorldTrail } from '@/components/world/archiveWorldTrails';
import type { GameDestination } from '@/components/world/ArchiveGameScene';

export const QUATERNIUS_NATURE_ROOT = '/archive-world/quaternius-nature';
const CHUNK_SIZE = 38;
const CHUNK_RADIUS = 3;
const TREES_PER_CHUNK = 11;
const MAX_INSTANCES_PER_VARIANT = 180;

export interface QuaterniusAssetPart {
  geometry: BufferGeometry;
  material: Material | Material[];
  localMatrix: Matrix4;
}

export function seededRandom(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

export function coordinateSeed(x: number, z: number) {
  return ((x * 73856093) ^ (z * 19349663) ^ 0x9e3779b9) >>> 0;
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
  const lastChunk = useRef('');
  const dummy = useMemo(() => new Object3D(), []);
  const baseMatrix = useMemo(() => new Matrix4(), []);
  const finalMatrix = useMemo(() => new Matrix4(), []);

  useFrame(() => {
    const centerX = Math.floor(playerPosition.current.x / CHUNK_SIZE);
    const centerZ = Math.floor(playerPosition.current.z / CHUNK_SIZE);
    const chunkKey = `${centerX}:${centerZ}`;
    if (chunkKey === lastChunk.current) return;
    if (meshes.current.length !== partsByVariant.length) return;
    lastChunk.current = chunkKey;

    const placements = partsByVariant.map(() => [] as Matrix4[]);
    for (let chunkX = centerX - CHUNK_RADIUS; chunkX <= centerX + CHUNK_RADIUS; chunkX += 1) {
      for (let chunkZ = centerZ - CHUNK_RADIUS; chunkZ <= centerZ + CHUNK_RADIUS; chunkZ += 1) {
        const random = seededRandom(coordinateSeed(chunkX, chunkZ));
        for (let tree = 0; tree < TREES_PER_CHUNK; tree += 1) {
          const x = chunkX * CHUNK_SIZE + random() * CHUNK_SIZE;
          const z = chunkZ * CHUNK_SIZE + random() * CHUNK_SIZE;
          const heightScale = 0.78 + random() * 0.54;
          const widthScale = heightScale * (0.88 + random() * 0.22);
          const roadClearance = isInsideWorldTrail(x, z, 2.2);
          const siteClearance = destinations.some(
            (site) => Math.hypot(x - site.position[0], z - site.position[2]) < 12,
          );
          const infrastructureClearance = clearings.some(
            ([clearX, clearZ, radius]) => Math.hypot(x - clearX, z - clearZ) < radius,
          );
          const spawnClearance = Math.hypot(x + 11, z - 22) < 9;
          const groundHeight = heightAt(x, z);
          if (roadClearance || siteClearance || infrastructureClearance || spawnClearance || groundHeight < -0.78) continue;

          const variant = Math.min(
            partsByVariant.length - 1,
            Math.floor(random() * partsByVariant.length),
          );
          const rotation = random() * Math.PI * 2;
          const tilt = (random() - 0.5) * 0.035;
          if (placements[variant].length >= MAX_INSTANCES_PER_VARIANT) continue;
          dummy.position.set(x, groundHeight, z);
          dummy.rotation.set(0, rotation, tilt);
          dummy.scale.set(widthScale, heightScale, widthScale);
          dummy.updateMatrix();
          placements[variant].push(dummy.matrix.clone());
        }
      }
    }

    partsByVariant.forEach((parts, variantIndex) => {
      parts.forEach((part, partIndex) => {
        const mesh = meshes.current[variantIndex]?.[partIndex];
        if (!mesh) return;
        const activePlacements = placements[variantIndex];
        for (let index = 0; index < activePlacements.length; index += 1) {
          baseMatrix.copy(activePlacements[index]);
          finalMatrix.multiplyMatrices(baseMatrix, part.localMatrix);
          mesh.setMatrixAt(index, finalMatrix);
        }
        mesh.count = activePlacements.length;
        mesh.instanceMatrix.needsUpdate = true;
        mesh.computeBoundingSphere();
      });
    });

  });

  useEffect(() => {
    lastChunk.current = '';
  }, [partsByVariant]);

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
              }}
              args={[part.geometry, part.material, MAX_INSTANCES_PER_VARIANT]}
              castShadow
              receiveShadow
            />
          ))}
        </group>
      ))}
    </group>
  );
}
