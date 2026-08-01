'use client';

import { useEffect, useMemo, useRef, type MutableRefObject } from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { InstancedMesh, Matrix4, Object3D, type Vector3 } from 'three';
import { isInsideWorldTrail } from '@/components/world/archiveWorldTrails';
import type { GameDestination } from '@/components/world/ArchiveGameScene';
import {
  QUATERNIUS_NATURE_ROOT,
  collectQuaterniusParts,
  coordinateSeed,
  seededRandom,
} from '@/components/world/QuaterniusForest';

const CHUNK_SIZE = 28;
const CHUNK_RADIUS = 2;
const ITEMS_PER_CHUNK = 20;
const MAX_PER_VARIANT = 120;

export default function QuaterniusGroundCover({
  playerPosition,
  destinations,
  clearings = [],
  heightAt,
  waterLevel,
}: {
  playerPosition: MutableRefObject<Vector3>;
  destinations: GameDestination[];
  clearings?: readonly (readonly [number, number, number])[];
  heightAt: (x: number, z: number) => number;
  waterLevel: number;
}) {
  const rock1 = useGLTF(`${QUATERNIUS_NATURE_ROOT}/Rock_Medium_1.gltf`);
  const rock2 = useGLTF(`${QUATERNIUS_NATURE_ROOT}/Rock_Medium_2.gltf`);
  const rock3 = useGLTF(`${QUATERNIUS_NATURE_ROOT}/Rock_Medium_3.gltf`);
  const fern = useGLTF(`${QUATERNIUS_NATURE_ROOT}/Fern_1.gltf`);
  const grass = useGLTF(`${QUATERNIUS_NATURE_ROOT}/Grass_Common_Short.gltf`);
  const mushroom = useGLTF(`${QUATERNIUS_NATURE_ROOT}/Mushroom_Common.gltf`);
  const assets = useMemo(
    () => [rock1, rock2, rock3, fern, grass, mushroom].map(
        (asset) => collectQuaterniusParts(asset.scene),
      ),
    [rock1, rock2, rock3, fern, grass, mushroom],
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
    if (chunkKey === lastChunk.current || meshes.current.length !== assets.length) return;
    lastChunk.current = chunkKey;
    const placements = assets.map(() => [] as Matrix4[]);

    for (let chunkX = centerX - CHUNK_RADIUS; chunkX <= centerX + CHUNK_RADIUS; chunkX += 1) {
      for (let chunkZ = centerZ - CHUNK_RADIUS; chunkZ <= centerZ + CHUNK_RADIUS; chunkZ += 1) {
        const random = seededRandom(coordinateSeed(chunkX + 1409, chunkZ - 917));
        const clusters = Array.from({ length: 4 }, () => ({
          x: chunkX * CHUNK_SIZE + 4 + random() * (CHUNK_SIZE - 8),
          z: chunkZ * CHUNK_SIZE + 4 + random() * (CHUNK_SIZE - 8),
        }));
        for (let index = 0; index < ITEMS_PER_CHUNK; index += 1) {
          const cluster = clusters[Math.floor(random() * clusters.length)];
          const clusterAngle = random() * Math.PI * 2;
          const clusterRadius = Math.sqrt(random()) * 6.8;
          const x = cluster.x + Math.cos(clusterAngle) * clusterRadius;
          const z = cluster.z + Math.sin(clusterAngle) * clusterRadius;
          const y = heightAt(x, z);
          const variantRoll = random();
          const variant = variantRoll < 0.034
            ? 0
            : variantRoll < 0.068
              ? 1
              : variantRoll < 0.102
                ? 2
                : variantRoll < 0.42
                  ? 3
                  : variantRoll < 0.94
                    ? 4
                    : 5;
          const pathClearance = isInsideWorldTrail(x, z, 0.75);
          const siteClearance = destinations.some(
            (site) => Math.hypot(x - site.position[0], z - site.position[2]) < 7,
          );
          const infrastructureClearance = clearings.some(
            ([clearX, clearZ, radius]) => Math.hypot(x - clearX, z - clearZ) < radius,
          );
          const spawnClearance = Math.hypot(x, z + 2) < 10;
          if (pathClearance || siteClearance || infrastructureClearance || spawnClearance || y <= waterLevel + 0.16) continue;
          if (placements[variant].length >= MAX_PER_VARIANT) continue;

          const rawScale = random();
          const scale = variant <= 2
            ? 0.24 + rawScale * 0.42
            : variant === 5
                ? 0.28 + rawScale * 0.26
                : 0.36 + rawScale * 0.46;
          dummy.position.set(x, y + (variant === 5 ? 0.015 : 0), z);
          dummy.rotation.set(
            variant <= 2 ? (random() - 0.5) * 0.18 : 0,
            random() * Math.PI * 2,
            variant <= 2 ? (random() - 0.5) * 0.16 : 0,
          );
          dummy.scale.setScalar(scale);
          dummy.updateMatrix();
          placements[variant].push(dummy.matrix.clone());
        }
      }
    }

    assets.forEach((parts, variantIndex) => {
      parts.forEach((part, partIndex) => {
        const mesh = meshes.current[variantIndex]?.[partIndex];
        if (!mesh) return;
        const active = placements[variantIndex];
        active.forEach((placement, index) => {
          baseMatrix.copy(placement);
          finalMatrix.multiplyMatrices(baseMatrix, part.localMatrix);
          mesh.setMatrixAt(index, finalMatrix);
        });
        mesh.count = active.length;
        mesh.instanceMatrix.needsUpdate = true;
        mesh.computeBoundingSphere();
      });
    });
  });

  useEffect(() => {
    lastChunk.current = '';
  }, [assets]);

  return (
    <group name="quaternius-cc0-ground-cover">
      {assets.map((parts, variantIndex) => (
        <group key={variantIndex}>
          {parts.map((part, partIndex) => (
            <instancedMesh
              key={partIndex}
              ref={(mesh) => {
                meshes.current[variantIndex] ??= [];
                meshes.current[variantIndex][partIndex] = mesh;
              }}
              args={[part.geometry, part.material, MAX_PER_VARIANT]}
              castShadow={variantIndex <= 3}
              receiveShadow
            />
          ))}
        </group>
      ))}
    </group>
  );
}
