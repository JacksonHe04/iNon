import type { MutableRefObject } from 'react';
import type { Vector3 } from 'three';
import type { BlockType } from '@/types/layout';
import type { HomeExhibit, HomeRecordId } from '@/components/world/archiveHomeRecords';
import type { CompanionTelemetry } from '@/components/world/ArchiveCompanionDog';
import type { WorldTimeSnapshot } from '@/components/world/archiveWorldTime';

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
  flying: boolean;
  canMount: boolean;
  terrain: 'village' | 'forest' | 'mountain' | 'river' | 'coast';
}

export interface GameTravelRequest {
  id: number;
  position: [number, number, number];
  yaw?: number;
}

export interface ArchiveGameSceneProps {
  entered: boolean;
  worldTime: WorldTimeSnapshot;
  warmth: number;
  destinations: GameDestination[];
  playerPosition: MutableRefObject<Vector3>;
  travelRequest: GameTravelRequest | null;
  onOpen: (type: BlockType) => void;
  onNearby: (destination: GameDestination | null) => void;
  onTelemetry: (telemetry: GameTelemetry) => void;
  onDiagnostics: (message: string) => void;
  onCompanionProximity: (nearby: boolean) => void;
  onCompanionTelemetry: (telemetry: CompanionTelemetry) => void;
  collectedKeepsakes: string[];
  onCollectKeepsake: (id: string) => void;
  onInspectHomeRecord: (record: HomeRecordId) => void;
  homeExhibits: HomeExhibit[];
  forageCollectedIds: string[];
}

export interface FirstPersonExplorerProps {
  enabled: boolean;
  warmth: number;
  destinations: GameDestination[];
  playerPosition: MutableRefObject<Vector3>;
  travelRequest: GameTravelRequest | null;
  spawn?: [number, number, number];
  heightAt: (x: number, z: number) => number;
  waterLevel: number;
  onOpen: (type: GameDestination['blockType']) => void;
  onNearby: (destination: GameDestination | null) => void;
  onTelemetry: (telemetry: GameTelemetry) => void;
}
