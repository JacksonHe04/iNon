import { Object3D } from 'three';
import type { GameDestination } from '@/components/world/archiveGameTypes';
import { WORLD_PLAYER_SPAWN } from '@/components/world/archiveWorldConstants';
import { coordinateSeed, seededRandom } from '@/components/world/archiveTerrainMath';
import { isInsideWorldTrail } from '@/components/world/archiveWorldTrails';
import type { WorldPlacement } from '@/components/world/archiveWorldOcclusion';
import {
  biomeKeepsTree,
  treeVariantFor,
  worldBiomeAt,
  type WorldBiome,
} from '@/components/world/archiveWorldBiomes';

export const TREE_CHUNK_SIZE = 38;
export const TREE_RENDER_RADIUS = 3;
export const TREE_COLLIDER_RADIUS = 2;
export const TREE_VARIANT_COUNT = 8;
export const TREE_MAX_PER_VARIANT = 180;
const TREES_PER_CHUNK = 11;

function treesForRing(ring: number, biome: WorldBiome) {
  if (ring <= 1) return TREES_PER_CHUNK;
  const denseDistance = biome === 'coast' || biome === 'meadow';
  if (ring === 2) return denseDistance ? 8 : 5;
  return denseDistance ? 3 : 1;
}

export interface TreePlacement extends WorldPlacement {
  key: string;
  y: number;
  heightScale: number;
  widthScale: number;
  variant: number;
}

export function treePlacementsAround({
  centerX,
  centerZ,
  radius,
  destinations,
  clearings,
  heightAt,
}: {
  centerX: number;
  centerZ: number;
  radius: number;
  destinations: GameDestination[];
  clearings: readonly (readonly [number, number, number])[];
  heightAt: (x: number, z: number) => number;
}) {
  const placements = Array.from(
    { length: TREE_VARIANT_COUNT },
    () => [] as TreePlacement[],
  );
  const dummy = new Object3D();

  for (let chunkX = centerX - radius; chunkX <= centerX + radius; chunkX += 1) {
    for (let chunkZ = centerZ - radius; chunkZ <= centerZ + radius; chunkZ += 1) {
      const random = seededRandom(coordinateSeed(chunkX, chunkZ));
      const ring = Math.max(Math.abs(chunkX - centerX), Math.abs(chunkZ - centerZ));
      const sampleX = (chunkX + 0.5) * TREE_CHUNK_SIZE;
      const sampleZ = (chunkZ + 0.5) * TREE_CHUNK_SIZE;
      const chunkBiome = worldBiomeAt(sampleX, sampleZ, heightAt(sampleX, sampleZ));
      const treeCount = treesForRing(ring, chunkBiome);
      for (let tree = 0; tree < treeCount; tree += 1) {
        const x = chunkX * TREE_CHUNK_SIZE + random() * TREE_CHUNK_SIZE;
        const z = chunkZ * TREE_CHUNK_SIZE + random() * TREE_CHUNK_SIZE;
        const rawHeightScale = 0.78 + random() * 0.54;
        const rawWidthScale = rawHeightScale * (0.88 + random() * 0.22);
        const y = heightAt(x, z);
        const blocked = isInsideWorldTrail(x, z, 2.2)
          || destinations.some((site) => Math.hypot(x - site.position[0], z - site.position[2]) < 12)
          || clearings.some(([clearX, clearZ, clearingRadius]) => (
            Math.hypot(x - clearX, z - clearZ) < clearingRadius
          ))
          || Math.hypot(x - WORLD_PLAYER_SPAWN[0], z - WORLD_PLAYER_SPAWN[2]) < 9
          || y < -0.78;
        if (blocked || y > 27 || (y > 20 && random() > 0.34)) continue;

        const biome = worldBiomeAt(x, z, y);
        if (!biomeKeepsTree(biome, random())) continue;
        const variant = treeVariantFor(biome, random(), random());
        if (placements[variant].length >= TREE_MAX_PER_VARIANT) continue;
        const alpineScale = y > 16 ? 0.74 : 1;
        const heightScale = rawHeightScale * alpineScale;
        const widthScale = rawWidthScale * alpineScale;
        dummy.position.set(x, y, z);
        dummy.rotation.set(0, random() * Math.PI * 2, (random() - 0.5) * 0.035);
        dummy.scale.set(widthScale, heightScale, widthScale);
        dummy.updateMatrix();
        placements[variant].push({
          key: `${chunkX}:${chunkZ}:${tree}`,
          matrix: dummy.matrix.clone(),
          x,
          y,
          z,
          heightScale,
          widthScale,
          variant,
        });
      }
    }
  }
  return placements;
}
