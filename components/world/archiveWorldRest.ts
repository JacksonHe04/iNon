import type { GameTelemetry } from '@/components/world/archiveGameTypes';
import { WORLD_HOME_POSITION, WORLD_MOUNTAIN_SUMMIT_POSITION } from '@/components/world/archiveWorldConstants';

export interface WorldRestSite {
  id: 'home-bed' | 'home-fire' | 'summit-fire';
  folio: string;
  title: string;
  prompt: string;
  position: readonly [number, number];
  radius: number;
  rationCost: number;
}

export const WORLD_REST_SITES: WorldRestSite[] = [
  {
    id: 'home-bed',
    folio: 'HOME / BED',
    title: '主屋床边',
    prompt: '在自己的床边休息',
    position: [WORLD_HOME_POSITION[0] - 2.2, WORLD_HOME_POSITION[2] - 1.9],
    radius: 3.4,
    rationCost: 0,
  },
  {
    id: 'home-fire',
    folio: 'HOME / FIRE',
    title: '临海主屋篝火',
    prompt: '在家园篝火旁休整',
    position: [WORLD_HOME_POSITION[0] - 10.5, WORLD_HOME_POSITION[2] + 14.5],
    radius: 5.2,
    rationCost: 0,
  },
  {
    id: 'summit-fire',
    folio: 'RIDGE / FIRE',
    title: '雪线远征营火',
    prompt: '消耗一份口粮休整',
    position: [WORLD_MOUNTAIN_SUMMIT_POSITION[0] - 4, WORLD_MOUNTAIN_SUMMIT_POSITION[2] + 3.2],
    radius: 6.2,
    rationCost: 1,
  },
];

export function nearestWorldRestSite(telemetry: GameTelemetry) {
  if (telemetry.flying || telemetry.inWater) return null;
  return WORLD_REST_SITES.find((site) => (
    Math.hypot(telemetry.x - site.position[0], telemetry.z - site.position[1]) <= site.radius
  )) ?? null;
}
