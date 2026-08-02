'use client';

import { useMemo, useRef, useState, type MutableRefObject } from 'react';
import { useFrame } from '@react-three/fiber';
import { CuboidCollider, RigidBody } from '@react-three/rapier';
import type { Vector3 } from 'three';
import type { GameDestination } from '@/components/world/archiveGameTypes';
import {
  WORLD_INFRASTRUCTURE_CLEARINGS,
  WORLD_PLAYER_SPAWN,
} from '@/components/world/archiveWorldConstants';
import { coordinateSeed, seededRandom, terrainHeightAt } from '@/components/world/archiveTerrainMath';
import { isInsideWorldTrail } from '@/components/world/archiveWorldTrails';

interface ForestCollider {
  key: string;
  x: number;
  y: number;
  z: number;
  halfHeight: number;
  halfWidth: number;
}

function collidersAround(centerX: number, centerZ: number, destinations: GameDestination[]) {
  const chunkSize = 38;
  const colliders: ForestCollider[] = [];
  for (let chunkX = centerX - 2; chunkX <= centerX + 2; chunkX += 1) {
    for (let chunkZ = centerZ - 2; chunkZ <= centerZ + 2; chunkZ += 1) {
      const random = seededRandom(coordinateSeed(chunkX, chunkZ));
      for (let tree = 0; tree < 15; tree += 1) {
        const x = chunkX * chunkSize + random() * chunkSize;
        const z = chunkZ * chunkSize + random() * chunkSize;
        const heightScale = 0.78 + random() * 0.54;
        const widthScale = heightScale * (0.88 + random() * 0.22);
        const nearTrail = isInsideWorldTrail(x, z, 1.75);
        const nearDestination = destinations.some((site) => Math.hypot(x - site.position[0], z - site.position[2]) < 12);
        const nearInfrastructure = WORLD_INFRASTRUCTURE_CLEARINGS.some(
          ([clearX, clearZ, radius]) => Math.hypot(x - clearX, z - clearZ) < radius,
        );
        const nearSpawn = Math.hypot(
          x - WORLD_PLAYER_SPAWN[0],
          z - WORLD_PLAYER_SPAWN[2],
        ) < 9;
        const ground = terrainHeightAt(x, z);
        random();
        random();
        if (nearTrail || nearDestination || nearInfrastructure || nearSpawn || ground < -0.78 || tree >= 11) continue;
        const halfHeight = 3.2 * heightScale;
        colliders.push({
          key: `${chunkX}:${chunkZ}:${tree}`,
          x,
          y: ground + halfHeight,
          z,
          halfHeight,
          halfWidth: Math.max(0.34, widthScale * 0.44),
        });
      }
    }
  }
  return colliders;
}

export default function ArchiveForestColliders({
  playerPosition,
  destinations,
}: {
  playerPosition: MutableRefObject<Vector3>;
  destinations: GameDestination[];
}) {
  const [chunk, setChunk] = useState({ x: 0, z: 0 });
  const chunkRef = useRef(chunk);
  const colliders = useMemo(() => collidersAround(chunk.x, chunk.z, destinations), [chunk.x, chunk.z, destinations]);

  useFrame(() => {
    const x = Math.floor(playerPosition.current.x / 38);
    const z = Math.floor(playerPosition.current.z / 38);
    if (x === chunkRef.current.x && z === chunkRef.current.z) return;
    chunkRef.current = { x, z };
    setChunk({ x, z });
  });

  return (
    <RigidBody type="fixed" colliders={false}>
      {colliders.map((collider) => (
        <CuboidCollider
          key={collider.key}
          args={[collider.halfWidth, collider.halfHeight, collider.halfWidth]}
          position={[collider.x, collider.y, collider.z]}
          friction={1.2}
        />
      ))}
    </RigidBody>
  );
}
