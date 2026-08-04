'use client';

import { useMemo, useRef, useState, type MutableRefObject } from 'react';
import { useFrame } from '@react-three/fiber';
import { BallCollider, CylinderCollider, RigidBody } from '@react-three/rapier';
import type { Vector3 } from 'three';
import type { GameDestination } from '@/components/world/archiveGameTypes';
import {
  WATER_LEVEL,
  WORLD_INFRASTRUCTURE_CLEARINGS,
} from '@/components/world/archiveWorldConstants';
import {
  GROUND_CHUNK_SIZE,
  GROUND_COLLIDER_RADIUS,
  groundPlacementsAround,
} from '@/components/world/archiveGroundPlacements';
import {
  TREE_CHUNK_SIZE,
  TREE_COLLIDER_RADIUS,
  treePlacementsAround,
} from '@/components/world/archiveTreePlacements';
import { terrainHeightAt } from '@/components/world/archiveTerrainMath';

const TRUNK_RADII = [0.34, 0.37, 0.33, 0.29, 0.32, 0.3, 0.41, 0.44] as const;

interface NatureChunks {
  treeX: number;
  treeZ: number;
  groundX: number;
  groundZ: number;
}

function chunksAt(position: Vector3): NatureChunks {
  return {
    treeX: Math.floor(position.x / TREE_CHUNK_SIZE),
    treeZ: Math.floor(position.z / TREE_CHUNK_SIZE),
    groundX: Math.floor(position.x / GROUND_CHUNK_SIZE),
    groundZ: Math.floor(position.z / GROUND_CHUNK_SIZE),
  };
}

export default function ArchiveForestColliders({
  playerPosition,
  destinations,
}: {
  playerPosition: MutableRefObject<Vector3>;
  destinations: GameDestination[];
}) {
  const [chunks, setChunks] = useState(() => chunksAt(playerPosition.current));
  const chunksRef = useRef(chunks);
  const chunkFrame = useRef(0);
  const treeColliders = useMemo(() => treePlacementsAround({
    centerX: chunks.treeX,
    centerZ: chunks.treeZ,
    radius: TREE_COLLIDER_RADIUS,
    destinations,
    clearings: WORLD_INFRASTRUCTURE_CLEARINGS,
    heightAt: terrainHeightAt,
  }).flat(), [chunks.treeX, chunks.treeZ, destinations]);
  const rockColliders = useMemo(() => groundPlacementsAround({
    centerX: chunks.groundX,
    centerZ: chunks.groundZ,
    radius: GROUND_COLLIDER_RADIUS,
    destinations,
    clearings: WORLD_INFRASTRUCTURE_CLEARINGS,
    heightAt: terrainHeightAt,
    waterLevel: WATER_LEVEL,
  }).slice(0, 3).flat().filter((rock) => rock.scale >= 0.38), [
    chunks.groundX,
    chunks.groundZ,
    destinations,
  ]);

  useFrame(() => {
    chunkFrame.current = (chunkFrame.current + 1) % 8;
    if (chunkFrame.current !== 0) return;
    const next = chunksAt(playerPosition.current);
    const current = chunksRef.current;
    if (
      next.treeX === current.treeX
      && next.treeZ === current.treeZ
      && next.groundX === current.groundX
      && next.groundZ === current.groundZ
    ) return;
    chunksRef.current = next;
    setChunks(next);
  });

  return (
    <RigidBody type="fixed" colliders={false} name="solid-streamed-nature">
      {treeColliders.map((tree) => {
        const halfHeight = tree.heightScale * 3.15;
        const trunkRadius = Math.max(0.28, tree.widthScale * TRUNK_RADII[tree.variant]);
        return (
          <CylinderCollider
            key={`tree:${tree.key}`}
            args={[halfHeight, trunkRadius]}
            position={[tree.x, tree.y + halfHeight - 0.05, tree.z]}
            friction={1.2}
          />
        );
      })}
      {rockColliders.map((rock) => {
        const radius = Math.max(0.3, rock.scale * 0.82);
        return (
          <BallCollider
            key={`rock:${rock.key}`}
            args={[radius]}
            position={[rock.x, rock.y + radius * 0.58, rock.z]}
            friction={1.35}
          />
        );
      })}
    </RigidBody>
  );
}
