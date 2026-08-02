import { WORLD_HOME_POSITION } from '@/components/world/archiveWorldConstants';

export const ARCHIVE_HOME_ROTATION = -0.08;
export const ARCHIVE_HOME_HALF_WIDTH = 4.45;
export const ARCHIVE_HOME_HALF_DEPTH = 5.2;
export const ARCHIVE_HOME_SHELTER_MIN_Y = -0.15;
export const ARCHIVE_HOME_SHELTER_MAX_Y = 6.3;

export function archiveHomeLocalPosition(x: number, z: number) {
  const offsetX = x - WORLD_HOME_POSITION[0];
  const offsetZ = z - WORLD_HOME_POSITION[2];
  const cosine = Math.cos(ARCHIVE_HOME_ROTATION);
  const sine = Math.sin(ARCHIVE_HOME_ROTATION);
  return {
    x: offsetX * cosine + offsetZ * sine,
    z: -offsetX * sine + offsetZ * cosine,
  };
}

export function isInsideArchiveHome(x: number, z: number) {
  const local = archiveHomeLocalPosition(x, z);
  return Math.abs(local.x) < ARCHIVE_HOME_HALF_WIDTH
    && Math.abs(local.z) < ARCHIVE_HOME_HALF_DEPTH;
}
