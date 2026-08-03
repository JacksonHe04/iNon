'use client';

import { useEffect, useMemo, useRef, type MutableRefObject } from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { DynamicDrawUsage, InstancedMesh, Matrix4, Vector3 } from 'three';
import type { GameDestination } from '@/components/world/archiveGameTypes';
import {
  nearCameraVisibility,
  placementWithinView,
  playerMovedBeyond,
  type WorldPlacement,
} from '@/components/world/archiveWorldOcclusion';
import {
  QUATERNIUS_NATURE_ROOT,
  collectQuaterniusParts,
} from '@/components/world/QuaterniusForest';
import {
  GROUND_CHUNK_SIZE,
  GROUND_MAX_PER_VARIANT,
  GROUND_RENDER_RADIUS,
  groundPlacementsAround,
} from '@/components/world/archiveGroundPlacements';

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
  const bush = useGLTF(`${QUATERNIUS_NATURE_ROOT}/Bush_Common.gltf`);
  const fern = useGLTF(`${QUATERNIUS_NATURE_ROOT}/Fern_1.gltf`);
  const grass = useGLTF(`${QUATERNIUS_NATURE_ROOT}/Grass_Common_Short.gltf`);
  const mushroom = useGLTF(`${QUATERNIUS_NATURE_ROOT}/Mushroom_Common.gltf`);
  const clover1 = useGLTF(`${QUATERNIUS_NATURE_ROOT}/Clover_1.gltf`);
  const clover2 = useGLTF(`${QUATERNIUS_NATURE_ROOT}/Clover_2.gltf`);
  const flower3 = useGLTF(`${QUATERNIUS_NATURE_ROOT}/Flower_3_Group.gltf`);
  const flower4 = useGLTF(`${QUATERNIUS_NATURE_ROOT}/Flower_4_Group.gltf`);
  const tallGrass = useGLTF(`${QUATERNIUS_NATURE_ROOT}/Grass_Common_Tall.gltf`);
  const wispyGrass = useGLTF(`${QUATERNIUS_NATURE_ROOT}/Grass_Wispy_Tall.gltf`);
  const plant1 = useGLTF(`${QUATERNIUS_NATURE_ROOT}/Plant_1_Big.gltf`);
  const plant7 = useGLTF(`${QUATERNIUS_NATURE_ROOT}/Plant_7_Big.gltf`);
  const assets = useMemo(
    () => [
      rock1, rock2, rock3, bush, fern, grass, mushroom,
      clover1, clover2, flower3, flower4, tallGrass, wispyGrass, plant1, plant7,
    ].map(
        (asset) => collectQuaterniusParts(asset.scene),
      ),
    [
      rock1, rock2, rock3, bush, fern, grass, mushroom,
      clover1, clover2, flower3, flower4, tallGrass, wispyGrass, plant1, plant7,
    ],
  );
  const meshes = useRef<Array<Array<InstancedMesh | null>>>([]);
  const placementsRef = useRef<Array<WorldPlacement[]>>([]);
  const lastChunk = useRef('');
  const lastVisibilityPosition = useMemo(() => new Vector3(Number.POSITIVE_INFINITY, 0, 0), []);
  const viewDirection = useMemo(() => new Vector3(), []);
  const lastViewDirection = useMemo(() => new Vector3(), []);
  const baseMatrix = useMemo(() => new Matrix4(), []);
  const finalMatrix = useMemo(() => new Matrix4(), []);
  const fadeScale = useMemo(() => new Vector3(), []);

  useFrame(({ camera }) => {
    const centerX = Math.floor(playerPosition.current.x / GROUND_CHUNK_SIZE);
    const centerZ = Math.floor(playerPosition.current.z / GROUND_CHUNK_SIZE);
    const chunkKey = `${centerX}:${centerZ}`;
    if (meshes.current.length !== assets.length) return;
    const chunkChanged = chunkKey !== lastChunk.current;
    if (chunkChanged) {
      lastChunk.current = chunkKey;
      const placements = groundPlacementsAround({
        centerX,
        centerZ,
        radius: GROUND_RENDER_RADIUS,
        destinations,
        clearings,
        heightAt,
        waterLevel,
      });
      placementsRef.current = placements;
    }
    camera.getWorldDirection(viewDirection);
    viewDirection.y = 0;
    viewDirection.normalize();
    const moved = playerMovedBeyond(playerPosition.current, lastVisibilityPosition, 0.25);
    const turned = viewDirection.dot(lastViewDirection) < 0.995;
    if (!chunkChanged && !moved && !turned) return;
    lastVisibilityPosition.set(playerPosition.current.x, 0, playerPosition.current.z);
    lastViewDirection.copy(viewDirection);
    assets.forEach((parts, variantIndex) => {
      parts.forEach((part, partIndex) => {
        const mesh = meshes.current[variantIndex]?.[partIndex];
        if (!mesh) return;
        const active = placementsRef.current[variantIndex] ?? [];
        let visibleCount = 0;
        for (const placement of active) {
          if (!placementWithinView(playerPosition.current, viewDirection, placement, 10)) continue;
          const visibility = nearCameraVisibility(playerPosition.current, placement, 0.45, 2.7);
          baseMatrix.copy(placement.matrix).scale(fadeScale.setScalar(visibility));
          finalMatrix.multiplyMatrices(baseMatrix, part.localMatrix);
          mesh.setMatrixAt(visibleCount, finalMatrix);
          visibleCount += 1;
        }
        mesh.count = visibleCount;
        mesh.instanceMatrix.needsUpdate = true;
        if (chunkChanged) mesh.computeBoundingSphere();
      });
    });
  });

  useEffect(() => {
    lastChunk.current = '';
    lastVisibilityPosition.set(Number.POSITIVE_INFINITY, 0, 0);
  }, [assets, lastVisibilityPosition]);

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
                mesh?.instanceMatrix.setUsage(DynamicDrawUsage);
              }}
              args={[part.geometry, part.material, GROUND_MAX_PER_VARIANT]}
              castShadow={variantIndex <= 4}
              receiveShadow
            />
          ))}
        </group>
      ))}
    </group>
  );
}
