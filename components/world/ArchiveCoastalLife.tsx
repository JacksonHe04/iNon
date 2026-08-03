'use client';

import { useCallback, useRef, type MutableRefObject } from 'react';
import { useGLTF } from '@react-three/drei';
import { Group, Vector3 } from 'three';
import AnimatedAnimalScene from '@/components/world/AnimatedAnimalScene';
import { WATER_LEVEL } from '@/components/world/archiveWorldConstants';
import { coastlineXAt, terrainHeightAt } from '@/components/world/archiveTerrainMath';
import type { ArchiveSpeciesId } from '@/components/world/archiveSpeciesCatalog';

const COAST_ROOT = '/archive-world/quaternius-coast';

function ButterflyFish({ index, playerPosition, onObserveSpecies }: {
  index: number;
  playerPosition: MutableRefObject<Vector3>;
  onObserveSpecies: (id: ArchiveSpeciesId) => void;
}) {
  const gltf = useGLTF(`${COAST_ROOT}/ButterflyFish.glb`);
  const anchorZ = useRef(playerPosition.current.z);
  const phase = index * 1.83;
  const update = useCallback((group: Group, elapsed: number) => {
    if (Math.abs(playerPosition.current.z - anchorZ.current) > 92) anchorZ.current = playerPosition.current.z;
    const angle = elapsed * (0.21 + index * 0.008) + phase;
    const z = anchorZ.current + Math.sin(angle) * 24 + (index - 3) * 2.2;
    const x = coastlineXAt(z) - 7 - (index % 3) * 2.4 + Math.cos(angle) * 3.8;
    const nextZ = anchorZ.current + Math.sin(angle + 0.02) * 24 + (index - 3) * 2.2;
    const nextX = coastlineXAt(nextZ) - 7 - (index % 3) * 2.4 + Math.cos(angle + 0.02) * 3.8;
    group.position.set(x, WATER_LEVEL - 0.9 - (index % 3) * 0.22, z);
    group.rotation.y = Math.atan2(nextX - x, nextZ - z);
    group.rotation.z = Math.sin(angle * 2) * 0.08;
    if (Math.hypot(
      x - playerPosition.current.x,
      group.position.y - playerPosition.current.y,
      z - playerPosition.current.z,
    ) < 9) {
      onObserveSpecies('butterfly-fish');
    }
  }, [index, onObserveSpecies, phase, playerPosition]);
  return (
    <AnimatedAnimalScene
      source={gltf.scene}
      animations={gltf.animations}
      animationName="Swimming_Normal"
      scale={0.16 + (index % 3) * 0.018}
      animationSpeed={0.8 + (index % 4) * 0.08}
      materialTone={0.7}
      update={update}
    />
  );
}

function ShoreCrab({ index, playerPosition, onObserveSpecies }: {
  index: number;
  playerPosition: MutableRefObject<Vector3>;
  onObserveSpecies: (id: ArchiveSpeciesId) => void;
}) {
  const gltf = useGLTF(`${COAST_ROOT}/Crab.glb`);
  const anchorZ = useRef(playerPosition.current.z);
  const phase = index * 2.47;
  const update = useCallback((group: Group, elapsed: number) => {
    if (Math.abs(playerPosition.current.z - anchorZ.current) > 78) anchorZ.current = playerPosition.current.z;
    const motion = elapsed * (0.18 + index * 0.015) + phase;
    const z = anchorZ.current + Math.sin(motion) * 31 + (index - 2) * 5;
    const x = coastlineXAt(z) + 5.4 + Math.sin(motion * 1.7) * 1.2;
    group.position.set(x, terrainHeightAt(x, z) + 0.05, z);
    group.rotation.y = motion + Math.PI / 2;
    if (Math.hypot(
      x - playerPosition.current.x,
      group.position.y - playerPosition.current.y,
      z - playerPosition.current.z,
    ) < 8) {
      onObserveSpecies('crab');
    }
  }, [index, onObserveSpecies, phase, playerPosition]);
  return (
    <AnimatedAnimalScene
      source={gltf.scene}
      animations={gltf.animations}
      animationName="Walk"
      scale={0.17 + (index % 2) * 0.025}
      animationSpeed={0.72 + index * 0.05}
      materialTone={0.72}
      update={update}
    />
  );
}

export default function ArchiveCoastalLife({
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
    <group name="archive-world-coastal-life">
      {Array.from({ length: 7 }, (_, index) => (
        <ButterflyFish
          key={`butterfly-fish-${index}`}
          index={index}
          playerPosition={playerPosition}
          onObserveSpecies={onObserveSpecies}
        />
      ))}
      {Array.from({ length: 5 }, (_, index) => (
        <ShoreCrab
          key={`shore-crab-${index}`}
          index={index}
          playerPosition={playerPosition}
          onObserveSpecies={onObserveSpecies}
        />
      ))}
    </group>
  );
}
