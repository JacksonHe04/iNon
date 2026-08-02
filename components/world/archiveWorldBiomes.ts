import { coastlineXAt, riverCenterAt } from '@/components/world/archiveTerrainMath';
import { normalizedWorldTrailDistanceAt } from '@/components/world/archiveWorldTrails';

export type WorldBiome = 'coast' | 'wetland' | 'meadow' | 'forest' | 'alpine';

export function worldBiomeAt(x: number, z: number, height: number): WorldBiome {
  if (height > 16) return 'alpine';
  if (x - coastlineXAt(z) < 23) return 'coast';
  if (height < 12 && Math.abs(x - riverCenterAt(z)) < 19) return 'wetland';
  if (height < 11 && normalizedWorldTrailDistanceAt(x, z) < 6.2) return 'meadow';
  return 'forest';
}

export function treeVariantFor(biome: WorldBiome, roll: number, detail: number) {
  if (biome === 'alpine') return 3 + Math.floor(detail * 3);
  if (biome === 'coast') {
    if (roll < 0.12) return 6 + Math.floor(detail * 2);
    if (roll < 0.56) return 3 + Math.floor(detail * 3);
    return Math.floor(detail * 3);
  }
  if (biome === 'wetland') return Math.floor(detail * 3);
  if (biome === 'meadow') return roll < 0.7
    ? Math.floor(detail * 3)
    : 3 + Math.floor(detail * 3);
  if (roll < 0.56) return Math.floor(detail * 3);
  if (roll < 0.95) return 3 + Math.floor(detail * 3);
  return 6 + Math.floor(detail * 2);
}

const GROUND_BY_BIOME: Record<WorldBiome, readonly number[]> = {
  coast: [0, 1, 2, 2, 11, 12, 12, 13],
  wetland: [1, 4, 4, 7, 11, 11, 12, 14, 14],
  meadow: [3, 5, 7, 7, 8, 8, 9, 9, 10, 10, 11],
  forest: [0, 3, 3, 4, 4, 5, 6, 6, 7, 13, 14],
  alpine: [0, 0, 1, 1, 2, 2, 11, 12, 13],
};

export function groundVariantFor(biome: WorldBiome, roll: number) {
  const variants = GROUND_BY_BIOME[biome];
  return variants[Math.min(variants.length - 1, Math.floor(roll * variants.length))];
}

export function biomeKeepsTree(biome: WorldBiome, roll: number) {
  if (biome === 'meadow') return roll < 0.48;
  if (biome === 'coast') return roll < 0.72;
  if (biome === 'wetland') return roll < 0.82;
  return true;
}
