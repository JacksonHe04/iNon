import type { GameTelemetry } from '@/components/world/archiveGameTypes';
import { WATER_LEVEL, WORLD_HOME_POSITION } from '@/components/world/archiveWorldConstants';

function smoothstep(edge0: number, edge1: number, value: number) {
  const amount = Math.max(0, Math.min(1, (value - edge0) / (edge1 - edge0)));
  return amount * amount * (3 - 2 * amount);
}

export function riverCenterAt(z: number) {
  return 78 + Math.sin(z * 0.018) * 38 + Math.sin(z * 0.004) * 16;
}

export function coastlineXAt(z: number) {
  return -31 + Math.sin(z * 0.015) * 9 + Math.sin(z * 0.043) * 4;
}

function rawTerrainHeightAt(x: number, z: number) {
  const homeDistance = Math.hypot(x - WORLD_HOME_POSITION[0], z - WORLD_HOME_POSITION[2]);
  const wilderness = smoothstep(18, 46, homeDistance);
  const broad =
    Math.sin(x * 0.027) * 2.3
    + Math.cos(z * 0.031) * 1.85
    + Math.sin((x + z) * 0.014) * 3.1;
  const ridges = Math.pow(Math.max(0, Math.sin(x * 0.009 - z * 0.012)), 3) * 8.8;
  const mountainMass = Math.pow(
    Math.max(0, Math.sin(x * 0.011 + 0.7) + Math.cos(z * 0.008 - 0.4) - 0.58),
    2,
  ) * 7.5;
  const riverCenter = riverCenterAt(z);
  const riverInfluence = 1 - smoothstep(3.5, 17, Math.abs(x - riverCenter));
  const rollingGround = 0.4 + broad + ridges + mountainMass - riverInfluence * 7.2;
  const dryGround = Math.max(-0.42, rollingGround);
  const continentalGround = (dryGround * (1 - riverInfluence) + rollingGround * riverInfluence) * wilderness;
  const shoreline = coastlineXAt(z);
  const oceanInfluence = 1 - smoothstep(shoreline - 12, shoreline + 5, x);
  const oceanFloor = -7.8 + Math.sin(x * 0.04 + z * 0.027) * 1.1;
  return continentalGround * (1 - oceanInfluence) + oceanFloor * oceanInfluence;
}

export function terrainHeightAt(x: number, z: number) {
  const height = rawTerrainHeightAt(x, z);
  const distance = Math.hypot(x - WORLD_HOME_POSITION[0], z - WORLD_HOME_POSITION[2]);
  if (distance >= 16) return height;
  const homeHeight = rawTerrainHeightAt(WORLD_HOME_POSITION[0], WORLD_HOME_POSITION[2]);
  return height + (homeHeight - height) * (1 - smoothstep(7, 16, distance));
}

export function terrainKindAt(x: number, z: number, height: number): GameTelemetry['terrain'] {
  if (x < coastlineXAt(z) + 18) return 'coast';
  if (height <= WATER_LEVEL + 0.18) return 'river';
  if (Math.hypot(x - WORLD_HOME_POSITION[0], z - WORLD_HOME_POSITION[2]) < 58) return 'village';
  if (height > 4.5) return 'mountain';
  return 'forest';
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
