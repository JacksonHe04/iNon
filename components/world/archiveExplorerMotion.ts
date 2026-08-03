import { warmthMovementFactor } from '@/components/world/archiveWorldWarmth';

export function explorerMovementSpeed({
  flying, sprinting, inWater, mounted, warmth,
}: {
  flying: boolean;
  sprinting: boolean;
  inWater: boolean;
  mounted: boolean;
  warmth: number;
}) {
  const base = flying
    ? sprinting ? 30 : 17
    : inWater
      ? mounted ? 5.8 : 4.8
      : mounted
        ? sprinting ? 34 : 18
        : sprinting ? 22 : 12;
  return flying || mounted ? base : base * warmthMovementFactor(warmth);
}
