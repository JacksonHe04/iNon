import type { MutableRefObject } from 'react';
import type { AnimationMixer } from 'three';

const ARCHIVE_ANIMATION_STEP = 1 / 30;
const ARCHIVE_AMBIENT_MOTION_STEP = 1 / 24;

export function advanceArchiveAnimation(
  mixer: AnimationMixer,
  accumulatedDelta: MutableRefObject<number>,
  delta: number,
) {
  accumulatedDelta.current += Math.min(delta, 0.1);
  if (accumulatedDelta.current < ARCHIVE_ANIMATION_STEP) return;
  mixer.update(accumulatedDelta.current);
  accumulatedDelta.current = 0;
}

export function shouldAdvanceArchiveMotion(
  nextUpdateAt: MutableRefObject<number>,
  elapsed: number,
) {
  if (elapsed < nextUpdateAt.current) return false;
  nextUpdateAt.current = elapsed + ARCHIVE_AMBIENT_MOTION_STEP;
  return true;
}
