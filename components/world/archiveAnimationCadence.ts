import type { MutableRefObject } from 'react';
import type { AnimationMixer } from 'three';

const ARCHIVE_ANIMATION_STEP = 1 / 30;

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
