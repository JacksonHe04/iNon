import {
  RIVER_BRIDGE_POSITION,
  WORLD_HOME_POSITION,
  type GameDestination,
} from '@/components/world/ArchiveGameScene';

export type ArchiveWorldMode = 'world' | 'archive' | 'dialogue';

export interface WorldWaypoint {
  id: string;
  label: string;
  number: string;
  position: readonly [number, number, number];
  arrival: readonly [number, number, number];
  yaw: number;
}

export const OUTDOOR_DESTINATIONS: GameDestination[] = [];

export const WORLD_WAYPOINTS: WorldWaypoint[] = [
  {
    id: 'coastal-home',
    label: '临海主屋',
    number: 'H',
    position: WORLD_HOME_POSITION,
    arrival: [-11, 0, 20],
    yaw: 0,
  },
  {
    id: 'river-footbridge',
    label: '旧木桥',
    number: 'B',
    position: RIVER_BRIDGE_POSITION,
    arrival: [RIVER_BRIDGE_POSITION[0] - 16, 0, RIVER_BRIDGE_POSITION[2]],
    yaw: -Math.PI / 2,
  },
];

export const INITIAL_WORLD_TELEMETRY = {
  x: -11,
  y: 1.45,
  z: 22,
  heading: 0,
  speed: 0,
  stamina: 100,
  inWater: false,
  mounted: false,
  canMount: false,
  terrain: 'village' as const,
};
