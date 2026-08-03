import type { GameTelemetry } from '@/components/world/archiveGameTypes';

export type WorldForageKind = 'clover' | 'mushroom' | 'herb';

export interface WorldForagePatch {
  id: string;
  kind: WorldForageKind;
  folio: string;
  label: string;
  prompt: string;
  position: readonly [number, number];
  radius: number;
}

export const FORAGE_RECIPE_COST = 3;

export const WORLD_FORAGE_PATCHES: WorldForagePatch[] = [
  { id: 'home-clover', kind: 'clover', folio: 'MEADOW / CLOVER', label: '林径苜蓿', prompt: '采集林径苜蓿', position: [-7.5, 31.5], radius: 3.5 },
  { id: 'bridge-mushroom', kind: 'mushroom', folio: 'WETLAND / FUNGI', label: '桥畔菌菇', prompt: '采集桥畔菌菇', position: [46, -157], radius: 3.8 },
  { id: 'cove-herb', kind: 'herb', folio: 'COAST / HERB', label: '潮线香草', prompt: '采集潮线香草', position: [-21, -95], radius: 3.8 },
  { id: 'south-mushroom', kind: 'mushroom', folio: 'FOREST / FUNGI', label: '南林菌菇', prompt: '采集南林菌菇', position: [32, -116], radius: 3.8 },
  { id: 'east-clover', kind: 'clover', folio: 'MEADOW / CLOVER', label: '东坡苜蓿', prompt: '采集东坡苜蓿', position: [74, 44], radius: 3.8 },
  { id: 'north-herb', kind: 'herb', folio: 'COAST / HERB', label: '北岸香草', prompt: '采集北岸香草', position: [-64, 76], radius: 3.8 },
];

export function nearestForagePatch(telemetry: GameTelemetry, collectedIds: string[]) {
  if (telemetry.flying || telemetry.inWater) return null;
  const collected = new Set(collectedIds);
  return WORLD_FORAGE_PATCHES.find((patch) => (
    !collected.has(patch.id)
    && Math.hypot(telemetry.x - patch.position[0], telemetry.z - patch.position[1]) <= patch.radius
  )) ?? null;
}
