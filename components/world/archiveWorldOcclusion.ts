import { MathUtils, type Matrix4, type Vector3 } from 'three';

export interface WorldPlacement {
  matrix: Matrix4;
  x: number;
  z: number;
}

export function nearCameraVisibility(
  player: Vector3,
  placement: WorldPlacement,
  hiddenRadius: number,
  visibleRadius: number,
) {
  const distance = Math.hypot(player.x - placement.x, player.z - placement.z);
  return MathUtils.smoothstep(distance, hiddenRadius, visibleRadius);
}
