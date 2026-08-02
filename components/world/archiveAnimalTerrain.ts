import type { AnimalSpecies } from '@/components/world/archiveAnimalConfig';

const WATER_LEVEL = -1.05;
const SLOPE_SAMPLE_DISTANCE = 1.8;
const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));

const AGILE_SPECIES = new Set<AnimalSpecies>([
  'bunny', 'deer', 'fox', 'frog', 'husky', 'pug', 'rat', 'snake', 'spider', 'stag', 'wolf',
]);
const ALPINE_SPECIES = new Set<AnimalSpecies>(['deer', 'fox', 'stag', 'wolf']);

export interface AnimalGround {
  x: number;
  y: number;
  z: number;
}

function animalSlopeLimit(species: AnimalSpecies) {
  if (ALPINE_SPECIES.has(species)) return 0.82;
  if (AGILE_SPECIES.has(species)) return 0.62;
  return 0.44;
}

export function isWalkableAnimalGround(
  heightAt: (x: number, z: number) => number,
  species: AnimalSpecies,
  x: number,
  z: number,
) {
  const height = heightAt(x, z);
  if (height <= WATER_LEVEL + 0.38) return false;
  const nearbyHeights = [
    heightAt(x + SLOPE_SAMPLE_DISTANCE, z),
    heightAt(x - SLOPE_SAMPLE_DISTANCE, z),
    heightAt(x, z + SLOPE_SAMPLE_DISTANCE),
    heightAt(x, z - SLOPE_SAMPLE_DISTANCE),
  ];
  const steepestRise = Math.max(...nearbyHeights.map((nearby) => Math.abs(nearby - height)));
  return steepestRise / SLOPE_SAMPLE_DISTANCE <= animalSlopeLimit(species);
}

export function findWalkableAnimalGround({
  heightAt,
  species,
  x,
  z,
  phase,
}: {
  heightAt: (x: number, z: number) => number;
  species: AnimalSpecies;
  x: number;
  z: number;
  phase: number;
}): AnimalGround | null {
  for (let index = 0; index < 28; index += 1) {
    const radius = index === 0 ? 0 : 3.5 + Math.floor((index - 1) / 7) * 4.5;
    const angle = phase * 2.4 + index * GOLDEN_ANGLE;
    const candidateX = x + Math.cos(angle) * radius;
    const candidateZ = z + Math.sin(angle) * radius;
    if (!isWalkableAnimalGround(heightAt, species, candidateX, candidateZ)) continue;
    return { x: candidateX, y: heightAt(candidateX, candidateZ), z: candidateZ };
  }
  return null;
}
