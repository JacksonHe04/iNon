import { Euler, Matrix4, Quaternion, Vector3 } from 'three';
import { WORLD_HOME_POSITION } from '@/components/world/archiveWorldConstants';
import { terrainHeightAt } from '@/components/world/archiveTerrainMath';

export const [ARCHIVE_HOME_X, , ARCHIVE_HOME_Z] = WORLD_HOME_POSITION;
export const ARCHIVE_HOME_GROUND_Y = terrainHeightAt(ARCHIVE_HOME_X, ARCHIVE_HOME_Z);

export function archiveHomeLocalGroundY(x: number, z: number) {
  return terrainHeightAt(ARCHIVE_HOME_X + x, ARCHIVE_HOME_Z + z) - ARCHIVE_HOME_GROUND_Y;
}

export function archiveHomeGroundTransform(
  x: number,
  z: number,
  rotationY = 0,
  scale = 1,
) {
  return new Matrix4().compose(
    new Vector3(x, archiveHomeLocalGroundY(x, z), z),
    new Quaternion().setFromEuler(new Euler(0, rotationY, 0)),
    new Vector3(scale, scale, scale),
  );
}

export function archiveHomeGroundChildTransform(
  parent: readonly [x: number, z: number, rotationY: number],
  child: readonly [x: number, y: number, z: number, rotationY: number, scale: number],
) {
  const [parentX, parentZ, parentRotation] = parent;
  const [x, y, z, rotationY, scale] = child;
  const childMatrix = new Matrix4().compose(
    new Vector3(x, y, z),
    new Quaternion().setFromEuler(new Euler(0, rotationY, 0)),
    new Vector3(scale, scale, scale),
  );
  return archiveHomeGroundTransform(parentX, parentZ, parentRotation).multiply(childMatrix);
}
