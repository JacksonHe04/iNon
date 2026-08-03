import type { GameTelemetry } from '@/components/world/archiveGameTypes';
import type { WorldTimeSnapshot } from '@/components/world/archiveWorldTime';
import { nearestWorldRestSite } from '@/components/world/archiveWorldRest';
import { isInsideArchiveHome } from '@/components/world/archiveWorldZones';

export type WorldWarmthLabel = '温暖' | '微凉' | '寒冷' | '失温';

export function worldWarmthLabel(value: number): WorldWarmthLabel {
  if (value >= 70) return '温暖';
  if (value >= 45) return '微凉';
  if (value >= 25) return '寒冷';
  return '失温';
}

export function worldWarmthState(telemetry: GameTelemetry, worldTime: WorldTimeSnapshot, warmth: number) {
  if (telemetry.inWater) return { rate: -3.5, source: '冰冷涉水' };
  if (isInsideArchiveHome(telemetry.x, telemetry.z)) return { rate: 3.2, source: '主屋庇护' };
  const restSite = nearestWorldRestSite(telemetry);
  if (restSite?.id === 'home-fire' || restSite?.id === 'summit-fire') {
    return { rate: 4.4, source: '营火回暖' };
  }
  let rate = warmth < 82 ? 0.22 : 0;
  const sources: string[] = [];
  if (telemetry.y > 16) {
    rate -= 0.82;
    sources.push('雪线寒风');
  }
  if (worldTime.phase === 'night') {
    rate -= 0.42;
    sources.push('深夜低温');
  } else if (worldTime.phase === 'dawn' || worldTime.phase === 'dusk') {
    rate -= 0.14;
    sources.push(worldTime.phase === 'dawn' ? '晨雾' : '暮色');
  }
  return { rate, source: sources.join(' · ') || '温和天气' };
}

export function warmthMovementFactor(warmth: number) {
  if (warmth >= 45) return 1;
  if (warmth >= 20) return 0.84 + ((warmth - 20) / 25) * 0.16;
  return 0.68 + (warmth / 20) * 0.16;
}
