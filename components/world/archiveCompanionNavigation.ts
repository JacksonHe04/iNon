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
import {
  WATER_LEVEL,
  WORLD_INFRASTRUCTURE_CLEARINGS,
} from '@/components/world/archiveWorldConstants';
import {
  findWalkableAnimalGround,
  isWalkableAnimalGround,
} from '@/components/world/archiveAnimalTerrain';
import {
  ARCHIVE_HOME_DOOR_LOCAL_X,
  ARCHIVE_HOME_DOOR_LOCAL_Z,
  archiveHomeLocalPosition,
  archiveHomeWorldPosition,
  isInsideArchiveHome,
} from '@/components/world/archiveWorldZones';

export interface CompanionObstacle {
  x: number;
  z: number;
  radius: number;
}

export function companionObstaclesAround(
  x: number,
  z: number,
  heightAt: (x: number, z: number) => number,
) {
  const trees = treePlacementsAround({
    centerX: Math.floor(x / TREE_CHUNK_SIZE),
    centerZ: Math.floor(z / TREE_CHUNK_SIZE),
    radius: TREE_COLLIDER_RADIUS,
    destinations: [],
    clearings: WORLD_INFRASTRUCTURE_CLEARINGS,
    heightAt,
  }).flat().map((tree) => ({
    x: tree.x,
    z: tree.z,
    radius: Math.max(0.82, tree.widthScale * 0.52 + 0.58),
  }));
  const rocks = groundPlacementsAround({
    centerX: Math.floor(x / GROUND_CHUNK_SIZE),
    centerZ: Math.floor(z / GROUND_CHUNK_SIZE),
    radius: GROUND_COLLIDER_RADIUS,
    destinations: [],
    clearings: WORLD_INFRASTRUCTURE_CLEARINGS,
    heightAt,
    waterLevel: WATER_LEVEL,
  }).slice(0, 3).flat().filter((rock) => rock.scale >= 0.38).map((rock) => ({
    x: rock.x,
    z: rock.z,
    radius: rock.scale * 0.82 + 0.52,
  }));
  return [...trees, ...rocks];
}

function crossesHomeWall(fromX: number, fromZ: number, toX: number, toZ: number) {
  const fromInside = isInsideArchiveHome(fromX, fromZ);
  const toInside = isInsideArchiveHome(toX, toZ);
  if (fromInside === toInside) return false;
  const edge = archiveHomeLocalPosition(toInside ? toX : fromX, toInside ? toZ : fromZ);
  return edge.z < 3.75
    || edge.x < ARCHIVE_HOME_DOOR_LOCAL_X - 1.65
    || edge.x > ARCHIVE_HOME_DOOR_LOCAL_X + 1.65;
}

function isSafeStep({
  fromX,
  fromZ,
  x,
  z,
  heightAt,
  obstacles,
}: {
  fromX: number;
  fromZ: number;
  x: number;
  z: number;
  heightAt: (x: number, z: number) => number;
  obstacles: CompanionObstacle[];
}) {
  if (!isWalkableAnimalGround(heightAt, 'husky', x, z)) return false;
  if (crossesHomeWall(fromX, fromZ, x, z)) return false;
  return !obstacles.some((obstacle) => (
    Math.hypot(x - obstacle.x, z - obstacle.z) < obstacle.radius
  ));
}

export function companionDoorTarget(dogX: number, dogZ: number, playerX: number, playerZ: number) {
  const dogInside = isInsideArchiveHome(dogX, dogZ);
  const playerInside = isInsideArchiveHome(playerX, playerZ);
  if (dogInside === playerInside) return null;
  const inner = archiveHomeWorldPosition(ARCHIVE_HOME_DOOR_LOCAL_X, ARCHIVE_HOME_DOOR_LOCAL_Z - 1.1);
  const outer = archiveHomeWorldPosition(ARCHIVE_HOME_DOOR_LOCAL_X, ARCHIVE_HOME_DOOR_LOCAL_Z + 1.45);
  const gate = dogInside ? inner : outer;
  if (Math.hypot(dogX - gate.x, dogZ - gate.z) > 1.55) return gate;
  return dogInside ? outer : inner;
}

export function chooseCompanionStep({
  x,
  z,
  targetX,
  targetZ,
  step,
  heightAt,
  obstacles,
}: {
  x: number;
  z: number;
  targetX: number;
  targetZ: number;
  step: number;
  heightAt: (x: number, z: number) => number;
  obstacles: CompanionObstacle[];
}) {
  const direct = Math.atan2(targetZ - z, targetX - x);
  const offsets = [0, 0.42, -0.42, 0.82, -0.82, 1.22, -1.22, Math.PI];
  for (const offset of offsets) {
    const nextX = x + Math.cos(direct + offset) * step;
    const nextZ = z + Math.sin(direct + offset) * step;
    if (!isSafeStep({ fromX: x, fromZ: z, x: nextX, z: nextZ, heightAt, obstacles })) continue;
    return { x: nextX, y: heightAt(nextX, nextZ), z: nextZ };
  }
  return null;
}

export function safeCompanionCatchUp(
  playerX: number,
  playerZ: number,
  heightAt: (x: number, z: number) => number,
) {
  const target = isInsideArchiveHome(playerX, playerZ)
    ? archiveHomeWorldPosition(ARCHIVE_HOME_DOOR_LOCAL_X, ARCHIVE_HOME_DOOR_LOCAL_Z + 1.45)
    : { x: playerX + 4.4, z: playerZ + 3.6 };
  return findWalkableAnimalGround({
    heightAt,
    species: 'husky',
    x: target.x,
    z: target.z,
    phase: 0.38,
  });
}
