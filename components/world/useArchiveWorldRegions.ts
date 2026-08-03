'use client';

import { useRef, useState, type MutableRefObject } from 'react';
import { useFrame } from '@react-three/fiber';
import type { Vector3 } from 'three';
import {
  RIVER_BRIDGE_POSITION,
  WORLD_HOME_POSITION,
  WORLD_MOUNTAIN_SUMMIT_POSITION,
  WORLD_TIDAL_COVE_POSITION,
} from '@/components/world/archiveWorldConstants';
import { coastlineXAt, riverCenterAt } from '@/components/world/archiveTerrainMath';

export interface ArchiveWorldRegions {
  coast: boolean;
  river: boolean;
  home: boolean;
  bridge: boolean;
  mountain: boolean;
  tidalCove: boolean;
}

function within(x: number, z: number, position: readonly [number, number, number], radius: number) {
  return Math.hypot(x - position[0], z - position[2]) < radius;
}

export function archiveWorldRegionsAt(x: number, z: number): ArchiveWorldRegions {
  return {
    coast: x < coastlineXAt(z) + 75,
    river: Math.abs(x - riverCenterAt(z)) < 70,
    home: within(x, z, WORLD_HOME_POSITION, 100),
    bridge: within(x, z, RIVER_BRIDGE_POSITION, 110),
    mountain: within(x, z, WORLD_MOUNTAIN_SUMMIT_POSITION, 125),
    tidalCove: within(x, z, WORLD_TIDAL_COVE_POSITION, 115),
  };
}

function regionKey(regions: ArchiveWorldRegions) {
  return Object.values(regions).map((active) => active ? '1' : '0').join('');
}

export function useArchiveWorldRegions(playerPosition: MutableRefObject<Vector3>) {
  const [regions, setRegions] = useState(() => (
    archiveWorldRegionsAt(playerPosition.current.x, playerPosition.current.z)
  ));
  const key = useRef(regionKey(regions));
  const frame = useRef(0);

  useFrame(() => {
    frame.current = (frame.current + 1) % 15;
    if (frame.current !== 0) return;
    const next = archiveWorldRegionsAt(playerPosition.current.x, playerPosition.current.z);
    const nextKey = regionKey(next);
    if (nextKey === key.current) return;
    key.current = nextKey;
    setRegions(next);
  });

  return regions;
}
