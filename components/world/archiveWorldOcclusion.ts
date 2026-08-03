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

export function playerMovedBeyond(
  player: Vector3,
  previous: Vector3,
  threshold: number,
) {
  const dx = player.x - previous.x;
  const dz = player.z - previous.z;
  if (dx * dx + dz * dz < threshold * threshold) return false;
  previous.set(player.x, 0, player.z);
  return true;
}

export function placementWithinView(
  player: Vector3,
  direction: Vector3,
  placement: WorldPlacement,
  alwaysVisibleRadius: number,
  minimumDot = -0.35,
) {
  const dx = placement.x - player.x;
  const dz = placement.z - player.z;
  const distance = Math.hypot(dx, dz);
  if (distance < alwaysVisibleRadius) return true;
  return (dx * direction.x + dz * direction.z) / distance > minimumDot;
}
