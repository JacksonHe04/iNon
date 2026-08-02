import type { GameTelemetry } from '@/components/world/archiveGameTypes';
import {
  RIVER_BRIDGE_POSITION,
  WORLD_HOME_POSITION,
  WORLD_MOUNTAIN_SUMMIT_POSITION,
  WORLD_TIDAL_COVE_POSITION,
} from '@/components/world/archiveWorldConstants';
import { isInsideArchiveHome } from '@/components/world/archiveWorldZones';

export interface FieldRouteStage {
  id: string;
  folio: string;
  title: string;
  instruction: string;
  target: readonly [number, number];
}

export const FIELD_ROUTE_STAGES: FieldRouteStage[] = [
  {
    id: 'meadow-trail',
    folio: 'I / 离岸',
    title: '沿南门石径离开海岸',
    instruction: '不要传送。循着院门外的圆石与旧土路，走进林径草甸。',
    target: [7, 25],
  },
  {
    id: 'river-bridge',
    folio: 'II / 河谷',
    title: '抵达旧木桥',
    instruction: '让林径把你带进河谷，亲自走到横跨流水的旧桥边。',
    target: [RIVER_BRIDGE_POSITION[0], RIVER_BRIDGE_POSITION[2]],
  },
  {
    id: 'tidal-water',
    folio: 'III / 潮线',
    title: '从潮汐湾走入海水',
    instruction: '沿岩岸抵达窄码头，再从真实岸坡进入近岸水域。',
    target: [-51, WORLD_TIDAL_COVE_POSITION[2]],
  },
  {
    id: 'snow-summit',
    folio: 'IV / 雪线',
    title: '登上雪线远征营地',
    instruction: '越过山坡与松林，登到可以回望海岸的峰顶平台。',
    target: [WORLD_MOUNTAIN_SUMMIT_POSITION[0], WORLD_MOUNTAIN_SUMMIT_POSITION[2]],
  },
  {
    id: 'home-return',
    folio: 'V / 归档',
    title: '带着三页札记回到主屋',
    instruction: '至少拾得三页田野札记，再从正门走进唯一的临海主屋。',
    target: [WORLD_HOME_POSITION[0], WORLD_HOME_POSITION[2]],
  },
];

function distanceTo(telemetry: GameTelemetry, target: readonly [number, number]) {
  return Math.hypot(telemetry.x - target[0], telemetry.z - target[1]);
}

export function isFieldRouteStageComplete(
  index: number,
  telemetry: GameTelemetry,
  keepsakeCount: number,
) {
  if (index === 0) return distanceTo(telemetry, FIELD_ROUTE_STAGES[0].target) < 11;
  if (index === 1) return distanceTo(telemetry, FIELD_ROUTE_STAGES[1].target) < 22;
  if (index === 2) return telemetry.inWater && distanceTo(telemetry, FIELD_ROUTE_STAGES[2].target) < 15;
  if (index === 3) return telemetry.y > 35 && distanceTo(telemetry, FIELD_ROUTE_STAGES[3].target) < 22;
  if (index === 4) return keepsakeCount >= 3 && isInsideArchiveHome(telemetry.x, telemetry.z);
  return false;
}

export function fieldRouteNavigation(telemetry: GameTelemetry, stage: FieldRouteStage) {
  const deltaX = stage.target[0] - telemetry.x;
  const deltaZ = stage.target[1] - telemetry.z;
  const bearing = (Math.atan2(deltaX, -deltaZ) * 180) / Math.PI;
  return {
    distance: Math.round(Math.hypot(deltaX, deltaZ)),
    relativeBearing: ((bearing - telemetry.heading + 540) % 360) - 180,
  };
}
