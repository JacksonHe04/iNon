import { Euler, Matrix4, Quaternion, Vector3 } from 'three';
import { archiveHomeLocalGroundY } from '@/components/world/archiveHomeGroundMath';

type FencePiece = readonly [x: number, z: number, rotation: number, scale: number];

const FENCE_PIECES: readonly FencePiece[] = [
  [-15.7, -7.8, 1.48, 1.02], [-15.8, -4.7, 1.62, 0.96], [-15.6, -1.7, 1.51, 1.05],
  [4.1, -9.8, 0.05, 0.96], [7.2, -9.9, -0.04, 1.03], [10.3, -9.7, 0.07, 0.98], [13.3, -9.5, -0.08, 0.94],
  [15.2, -7.2, 1.51, 0.98], [15.4, -4.2, 1.62, 1.02], [15.3, -1.1, 1.48, 0.94],
  [16.2, 7.2, 1.52, 1.02], [16.4, 10.3, 1.64, 0.96], [16.1, 13.4, 1.5, 1.04], [15.9, 16.4, 1.61, 0.92],
  [13.1, 17.7, 0.02, 0.96], [10.1, 17.5, -0.08, 1.02],
  [-14.5, 25.8, 0.04, 0.9], [-11.7, 25.9, -0.1, 0.86],
  [8.3, 26, 0.08, 0.88], [11.1, 25.8, -0.06, 0.92],
];

export const HOME_FENCE_COLLIDERS = [
  { args: [0.24, 0.8, 4.8] as const, position: [-15.7, 0.8, -4.7] as const },
  { args: [5.7, 0.8, 0.24] as const, position: [9.6, 0.8, -9.8] as const },
  { args: [0.24, 0.8, 4.8] as const, position: [15.3, 0.8, -4.2] as const },
  { args: [0.24, 0.8, 5.2] as const, position: [16.2, 0.8, 11.8] as const },
  { args: [3.2, 0.8, 0.24] as const, position: [12.8, 0.8, 17.6] as const },
] as const;

export const HOME_GROVE_COLLIDERS = [
  [-20.2, -7.4, 0.62], [-21.4, 6.2, 0.68], [-19.6, 20.8, 0.64],
  [19.3, -12.6, 0.72], [21.2, 8.4, 0.66], [19.7, 23.4, 0.7],
] as const;

export function makeHomeFenceTransforms() {
  return FENCE_PIECES.map(([x, z, rotation, scale]) => new Matrix4().compose(
    new Vector3(x, archiveHomeLocalGroundY(x, z), z),
    new Quaternion().setFromEuler(new Euler(0, rotation, 0)),
    new Vector3(scale, scale, scale),
  ));
}
