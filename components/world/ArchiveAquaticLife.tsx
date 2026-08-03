'use client';

import { useCallback, useRef, type MutableRefObject } from 'react';
import { type Group, Vector3 } from 'three';
import AnimatedAquaticAnimal from '@/components/world/AnimatedAquaticAnimal';
import { WATER_LEVEL } from '@/components/world/archiveWorldConstants';
import { riverCenterAt } from '@/components/world/archiveTerrainMath';
import type { ArchiveSpeciesId } from '@/components/world/archiveSpeciesCatalog';

const FISH_ROOT = '/archive-world/quaternius-fish';
const RIVER_FISH_SPECIES = ['river-fish-a', 'river-fish-b', 'river-fish-c'] as const;

interface FishConfig {
  id: string;
  file: 'Fish1.fbx' | 'Fish2.fbx' | 'Fish3.fbx';
  scale: number;
  phase: number;
  lane: number;
  speed: number;
  speciesId: ArchiveSpeciesId;
}

const RIVER_FISH: readonly FishConfig[] = Array.from({ length: 18 }, (_, index) => ({
  id: `river-fish-${index + 1}`,
  file: `Fish${(index % 3) + 1}.fbx` as FishConfig['file'],
  scale: [0.0025, 0.0018, 0.0022][index % 3] * (0.78 + (index % 4) * 0.08),
  phase: index * 7.73,
  lane: (index % 5) - 2,
  speed: 0.88 + (index % 4) * 0.14,
  speciesId: RIVER_FISH_SPECIES[index % RIVER_FISH_SPECIES.length],
}));

function AnimatedRiverFish({
  config,
  playerPosition,
  onObserveSpecies,
}: {
  config: FishConfig;
  playerPosition: MutableRefObject<Vector3>;
  onObserveSpecies: (id: ArchiveSpeciesId) => void;
}) {
  const anchorZ = useRef(playerPosition.current.z);
  const update = useCallback((group: Group, elapsed: number) => {
    if (Math.abs(playerPosition.current.z - anchorZ.current) > 90) {
      anchorZ.current = playerPosition.current.z;
    }

    const route = (elapsed * config.speed * 3.4 + config.phase) % 52;
    const z = anchorZ.current + route - 26;
    const laneOffset = config.lane * 1.28;
    const x = riverCenterAt(z) + laneOffset + Math.sin(elapsed * 0.7 + config.phase) * 0.7;
    const nextX = riverCenterAt(z + 0.5) + laneOffset;
    const depth = 0.24 + (Math.abs(config.lane) % 3) * 0.14;
    group.position.set(
      x,
      WATER_LEVEL - depth + Math.sin(elapsed * 0.8 + config.phase) * 0.16,
      z,
    );
    group.rotation.y = Math.atan2(nextX - x, 0.5);
    group.rotation.z = Math.sin(elapsed * 0.55 + config.phase) * 0.035;
    if (Math.hypot(
      x - playerPosition.current.x,
      group.position.y - playerPosition.current.y,
      z - playerPosition.current.z,
    ) < 7.5) {
      onObserveSpecies(config.speciesId);
    }
  }, [config, onObserveSpecies, playerPosition]);

  return (
    <AnimatedAquaticAnimal
      url={`${FISH_ROOT}/${config.file}`}
      scale={config.scale}
      animationSpeed={0.72 + (config.phase % 4) * 0.08}
      update={update}
    />
  );
}

export default function ArchiveAquaticLife({
  enabled,
  playerPosition,
  onObserveSpecies,
}: {
  enabled: boolean;
  playerPosition: MutableRefObject<Vector3>;
  onObserveSpecies: (id: ArchiveSpeciesId) => void;
}) {
  if (!enabled) return null;
  return (
    <group name="archive-world-river-fish">
      {RIVER_FISH.map((config) => (
        <AnimatedRiverFish
          key={config.id}
          config={config}
          playerPosition={playerPosition}
          onObserveSpecies={onObserveSpecies}
        />
      ))}
    </group>
  );
}
