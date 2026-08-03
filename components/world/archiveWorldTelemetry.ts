import type { GameTelemetry } from '@/components/world/archiveGameTypes';
import {
  WORLD_MOUNTAIN_SUMMIT_POSITION,
  WORLD_TIDAL_COVE_POSITION,
} from '@/components/world/archiveWorldConstants';
import { terrainHeightAt } from '@/components/world/archiveTerrainMath';
import { worldBiomeAt, type WorldBiome } from '@/components/world/archiveWorldBiomes';
import { isInsideArchiveHome } from '@/components/world/archiveWorldZones';
import type { WorldTimeSnapshot } from '@/components/world/archiveWorldTime';
import { worldWarmthLabel } from '@/components/world/archiveWorldWarmth';
import { worldVitalityLabel } from '@/components/world/archiveWorldVitality';

const BIOME_LABELS: Record<WorldBiome, string> = {
  coast: '灰绿海岸',
  wetland: '河谷湿地',
  meadow: '林径草甸',
  forest: '深林',
  alpine: '雪线',
};

export const WORLD_LOCATION_LABELS = [
  '主屋室内', '雪线营地', '潮汐湾', ...Object.values(BIOME_LABELS),
] as const;
export const WORLD_MOTION_LABELS = [
  '自由飞行', '空中悬停', '马背奔驰', '马背行进', '马背驻足', '涉水', '疾跑', '行进', '驻足',
] as const;
export interface WorldDialogueContext {
  location: string;
  motion: string;
  x: number;
  y: number;
  z: number;
  heading: number;
  stamina: number;
  rations: number;
  day: number;
  clockLabel: string;
  phaseLabel: string;
  forageIngredients: number;
  warmth: number;
  warmthLabel: string;
  vitality: number;
  vitalityLabel: string;
  companionNearby: boolean;
  collectedKeepsakeIds: string[];
}

export function worldLocationLabel(telemetry: GameTelemetry) {
  if (isInsideArchiveHome(telemetry.x, telemetry.z)) return '主屋室内';
  if (Math.hypot(
    telemetry.x - WORLD_MOUNTAIN_SUMMIT_POSITION[0],
    telemetry.z - WORLD_MOUNTAIN_SUMMIT_POSITION[2],
  ) < 22) return '雪线营地';
  if (Math.hypot(
    telemetry.x - WORLD_TIDAL_COVE_POSITION[0],
    telemetry.z - WORLD_TIDAL_COVE_POSITION[2],
  ) < 28) return '潮汐湾';
  const height = terrainHeightAt(telemetry.x, telemetry.z);
  return BIOME_LABELS[worldBiomeAt(telemetry.x, telemetry.z, height)];
}

export function worldMotionLabel(telemetry: GameTelemetry) {
  if (telemetry.flying) return telemetry.speed > 0 ? '自由飞行' : '空中悬停';
  if (telemetry.mounted) {
    if (telemetry.speed > 24) return '马背奔驰';
    if (telemetry.speed > 0) return '马背行进';
    return '马背驻足';
  }
  if (telemetry.inWater) return '涉水';
  if (telemetry.speed > 16) return '疾跑';
  if (telemetry.speed > 0) return '行进';
  return '驻足';
}

export function buildWorldDialogueContext({
  telemetry,
  rations,
  companionNearby,
  collectedKeepsakeIds,
  worldTime,
  forageIngredients,
  warmth,
  vitality,
}: {
  telemetry: GameTelemetry;
  rations: number;
  companionNearby: boolean;
  collectedKeepsakeIds: string[];
  worldTime: WorldTimeSnapshot;
  forageIngredients: number;
  warmth: number;
  vitality: number;
}): WorldDialogueContext {
  return {
    location: worldLocationLabel(telemetry),
    motion: worldMotionLabel(telemetry),
    x: Math.round(telemetry.x),
    y: Number(telemetry.y.toFixed(1)),
    z: Math.round(telemetry.z),
    heading: Math.round(telemetry.heading),
    stamina: Math.round(telemetry.stamina),
    rations,
    day: worldTime.day,
    clockLabel: worldTime.clockLabel,
    phaseLabel: worldTime.phaseLabel,
    forageIngredients,
    warmth: Math.round(warmth),
    warmthLabel: worldWarmthLabel(warmth),
    vitality: Math.round(vitality),
    vitalityLabel: worldVitalityLabel(vitality),
    companionNearby,
    collectedKeepsakeIds,
  };
}
