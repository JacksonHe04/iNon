import { warmthMovementFactor } from '@/components/world/archiveWorldWarmth';
import { vitalityMovementFactor } from '@/components/world/archiveWorldVitality';

export function explorerMovementSpeed({
  flying, sprinting, inWater, mounted, warmth, vitality,
}: {
  flying: boolean;
  sprinting: boolean;
  inWater: boolean;
  mounted: boolean;
  warmth: number;
  vitality: number;
}) {
  const base = flying
    ? sprinting ? 30 : 17
    : inWater
      ? mounted ? 5.8 : 4.8
      : mounted
        ? sprinting ? 34 : 18
        : sprinting ? 22 : 12;
  return flying || mounted ? base : base * warmthMovementFactor(warmth) * vitalityMovementFactor(vitality);
}

export function flyingAltitude(y: number, ground: number, speed: number, delta: number) {
  return Math.max(ground + 1.1, y + speed * delta);
}
