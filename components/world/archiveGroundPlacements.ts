import { Object3D } from 'three';
import type { GameDestination } from '@/components/world/archiveGameTypes';
import { WORLD_PLAYER_SPAWN } from '@/components/world/archiveWorldConstants';
import { coordinateSeed, seededRandom } from '@/components/world/archiveTerrainMath';
import { isInsideWorldTrail } from '@/components/world/archiveWorldTrails';
import type { WorldPlacement } from '@/components/world/archiveWorldOcclusion';
import { groundVariantFor, worldBiomeAt } from '@/components/world/archiveWorldBiomes';

export const GROUND_CHUNK_SIZE = 28;
export const GROUND_RENDER_RADIUS = 2;
export const GROUND_COLLIDER_RADIUS = 1;
export const GROUND_VARIANT_COUNT = 15;
export const GROUND_MAX_PER_VARIANT = 240;
const ITEMS_PER_CHUNK = 42;

export interface GroundPlacement extends WorldPlacement {
  key: string;
  y: number;
  scale: number;
  variant: number;
}

export function groundPlacementsAround({
  centerX,
  centerZ,
  radius,
  destinations,
  clearings,
  heightAt,
  waterLevel,
}: {
  centerX: number;
  centerZ: number;
  radius: number;
  destinations: GameDestination[];
  clearings: readonly (readonly [number, number, number])[];
  heightAt: (x: number, z: number) => number;
  waterLevel: number;
}) {
  const placements = Array.from(
    { length: GROUND_VARIANT_COUNT },
    () => [] as GroundPlacement[],
  );
  const dummy = new Object3D();

  for (let chunkX = centerX - radius; chunkX <= centerX + radius; chunkX += 1) {
    for (let chunkZ = centerZ - radius; chunkZ <= centerZ + radius; chunkZ += 1) {
      const random = seededRandom(coordinateSeed(chunkX + 1409, chunkZ - 917));
      const clusters = Array.from({ length: 4 }, () => ({
        x: chunkX * GROUND_CHUNK_SIZE + 4 + random() * (GROUND_CHUNK_SIZE - 8),
        z: chunkZ * GROUND_CHUNK_SIZE + 4 + random() * (GROUND_CHUNK_SIZE - 8),
      }));
      for (let index = 0; index < ITEMS_PER_CHUNK; index += 1) {
        const cluster = clusters[Math.floor(random() * clusters.length)];
        const angle = random() * Math.PI * 2;
        const radiusFromCluster = Math.sqrt(random()) * 6.8;
        const x = cluster.x + Math.cos(angle) * radiusFromCluster;
        const z = cluster.z + Math.sin(angle) * radiusFromCluster;
        const y = heightAt(x, z);
        const biome = worldBiomeAt(x, z, y);
        const variant = groundVariantFor(biome, random());
        const blocked = isInsideWorldTrail(x, z, 0.75)
          || destinations.some((site) => Math.hypot(x - site.position[0], z - site.position[2]) < 5.5)
          || clearings.some(([clearX, clearZ, clearingRadius]) => (
            Math.hypot(x - clearX, z - clearZ) < clearingRadius
          ))
          || Math.hypot(x - WORLD_PLAYER_SPAWN[0], z - WORLD_PLAYER_SPAWN[2]) < 7.5
          || y <= waterLevel + 0.16;
        if (blocked) continue;
        if (y > 29 && random() > 0.56) continue;
        if (placements[variant].length >= GROUND_MAX_PER_VARIANT) continue;

        const rawScale = random();
        const scale = variant <= 2
          ? (y > 16 ? 0.48 : 0.24) + rawScale * (y > 16 ? 0.72 : 0.42)
          : variant === 3 ? 0.42 + rawScale * 0.38
            : variant === 6 ? 0.24 + rawScale * 0.22
              : variant <= 10 ? 0.24 + rawScale * 0.34
                : variant <= 12 ? 0.36 + rawScale * 0.48
                  : 0.38 + rawScale * 0.44;
        dummy.position.set(x, y + (variant === 6 ? 0.015 : 0), z);
        dummy.rotation.set(
          variant <= 2 ? (random() - 0.5) * 0.18 : 0,
          random() * Math.PI * 2,
          variant <= 2 ? (random() - 0.5) * 0.16 : 0,
        );
        dummy.scale.setScalar(scale);
        dummy.updateMatrix();
        placements[variant].push({
          key: `${chunkX}:${chunkZ}:${index}`,
          matrix: dummy.matrix.clone(),
          x,
          y,
          z,
          scale,
          variant,
        });
      }
    }
  }
  return placements;
}
