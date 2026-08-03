import type { GameTelemetry } from '@/components/world/archiveGameTypes';

export function telemetryChanged(previous: GameTelemetry | null, next: GameTelemetry) {
  if (!previous) return true;
  return Math.abs(previous.x - next.x) >= 0.08
    || Math.abs(previous.y - next.y) >= 0.08
    || Math.abs(previous.z - next.z) >= 0.08
    || Math.abs(previous.heading - next.heading) >= 0.75
    || Math.abs(previous.speed - next.speed) >= 0.08
    || Math.abs(previous.stamina - next.stamina) >= 0.35
    || previous.inWater !== next.inWater
    || previous.mounted !== next.mounted
    || previous.flying !== next.flying
    || previous.canMount !== next.canMount
    || previous.terrain !== next.terrain;
}
