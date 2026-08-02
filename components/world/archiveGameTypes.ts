import type { MutableRefObject } from 'react';
import type { Vector3 } from 'three';
import type { BlockType } from '@/types/layout';

export interface GameDestination {
  blockType: BlockType;
  position: [number, number, number];
  number: string;
  subtitle: string;
  siteKind: 'camp' | 'workshop' | 'station' | 'watchtower' | 'sawmill' | 'record' | 'cinema' | 'cabin' | 'post';
}

export interface GameTelemetry {
  x: number;
  y: number;
  z: number;
  heading: number;
  speed: number;
  stamina: number;
  inWater: boolean;
  mounted: boolean;
  canMount: boolean;
  terrain: 'village' | 'forest' | 'mountain' | 'river';
}

export interface GameTravelRequest {
  id: number;
  position: [number, number, number];
  yaw?: number;
}

export interface ArchiveGameSceneProps {
  entered: boolean;
  destinations: GameDestination[];
  playerPosition: MutableRefObject<Vector3>;
  travelRequest: GameTravelRequest | null;
  onOpen: (type: BlockType) => void;
  onNearby: (destination: GameDestination | null) => void;
  onTelemetry: (telemetry: GameTelemetry) => void;
  onDiagnostics: (message: string) => void;
  collectedKeepsakes: string[];
  onCollectKeepsake: (id: string) => void;
}
