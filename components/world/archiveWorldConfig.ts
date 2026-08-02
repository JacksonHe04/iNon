import {
  RIVER_BRIDGE_POSITION,
  WORLD_HOME_POSITION,
  WORLD_MOUNTAIN_SUMMIT_POSITION,
  type GameDestination,
} from '@/components/world/ArchiveGameScene';
import { WORLD_PLAYER_SPAWN } from '@/components/world/archiveWorldConstants';

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
    arrival: [WORLD_PLAYER_SPAWN[0], 0, WORLD_PLAYER_SPAWN[2]],
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
  {
    id: 'tidal-cove',
    label: '潮汐湾',
    number: 'C',
    position: [-92, 0, -12],
    arrival: [-18, 0, -8],
    yaw: Math.PI / 2,
  },
  {
    id: 'snow-ridge',
    label: '雪线山脊',
    number: 'M',
    position: WORLD_MOUNTAIN_SUMMIT_POSITION,
    arrival: [0, 0, 22],
    yaw: -0.92,
  },
];

export const INITIAL_WORLD_TELEMETRY = {
  x: WORLD_PLAYER_SPAWN[0],
  y: 1.45,
  z: WORLD_PLAYER_SPAWN[2],
  heading: 0,
  speed: 0,
  stamina: 100,
  inWater: false,
  mounted: false,
  canMount: false,
  terrain: 'village' as const,
};
