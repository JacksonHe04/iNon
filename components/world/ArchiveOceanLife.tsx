'use client';

import { useCallback, useRef, useState, type MutableRefObject } from 'react';
import { useFrame } from '@react-three/fiber';
import { type Group, Vector3 } from 'three';
import AnimatedAquaticAnimal from '@/components/world/AnimatedAquaticAnimal';
import { WATER_LEVEL } from '@/components/world/archiveWorldConstants';
import { coastlineXAt } from '@/components/world/archiveTerrainMath';
import type { ArchiveSpeciesId } from '@/components/world/archiveSpeciesCatalog';

const OCEAN_ROOT = '/archive-world/quaternius-fish';

interface OceanAnimalConfig {
  id: string;
  file: 'Dolphin.fbx' | 'MantaRay.fbx' | 'Shark.fbx' | 'Whale.fbx';
  scale: number;
  phase: number;
  lane: number;
  speed: number;
  depth: number;
  tone: number;
  offshore: number;
  range: number;
  speciesId: ArchiveSpeciesId;
}

const OCEAN_ANIMALS: readonly OceanAnimalConfig[] = [
  { id: 'dolphin-one', file: 'Dolphin.fbx', scale: 0.004, phase: 0.4, lane: 0, speed: 0.14, depth: 0.28, tone: 0.48, offshore: 8, range: 9, speciesId: 'dolphin' },
  { id: 'dolphin-two', file: 'Dolphin.fbx', scale: 0.0036, phase: 2.5, lane: 1, speed: 0.15, depth: 0.45, tone: 0.44, offshore: 11, range: 12, speciesId: 'dolphin' },
  { id: 'manta-one', file: 'MantaRay.fbx', scale: 0.004, phase: 1.2, lane: 2, speed: 0.08, depth: 2.8, tone: 0.62, offshore: 26, range: 30, speciesId: 'manta-ray' },
  { id: 'manta-two', file: 'MantaRay.fbx', scale: 0.0036, phase: 4.8, lane: -1, speed: 0.07, depth: 3.5, tone: 0.58, offshore: 31, range: 34, speciesId: 'manta-ray' },
  { id: 'shark-deep', file: 'Shark.fbx', scale: 0.0032, phase: 3.4, lane: 3, speed: 0.1, depth: 4.4, tone: 0.56, offshore: 36, range: 40, speciesId: 'shark' },
  { id: 'whale-offshore', file: 'Whale.fbx', scale: 0.008, phase: 5.7, lane: 5, speed: 0.035, depth: 5.8, tone: 0.5, offshore: 48, range: 54, speciesId: 'whale' },
] as const;

function OceanAnimal({
  config,
  playerPosition,
  onObserveSpecies,
}: {
  config: OceanAnimalConfig;
  playerPosition: MutableRefObject<Vector3>;
  onObserveSpecies: (id: ArchiveSpeciesId) => void;
}) {
  const anchorZ = useRef(playerPosition.current.z);
  const update = useCallback((group: Group, elapsed: number) => {
    if (Math.abs(playerPosition.current.z - anchorZ.current) > 125) {
      anchorZ.current = playerPosition.current.z;
    }
    const angle = elapsed * config.speed + config.phase;
    const nextAngle = angle + 0.018;
    const z = anchorZ.current + Math.sin(angle) * config.range + config.lane * 4;
    const nextZ = anchorZ.current + Math.sin(nextAngle) * config.range + config.lane * 4;
    const orbit = config.file === 'Dolphin.fbx' ? 5 : 11;
    const x = coastlineXAt(z) - config.offshore + Math.cos(angle) * orbit;
    const nextX = coastlineXAt(nextZ) - config.offshore + Math.cos(nextAngle) * orbit;
    const dolphin = config.file === 'Dolphin.fbx';
    const jumpPhase = Math.sin(angle * 2.4);
    const surfaceLift = dolphin ? Math.max(0, jumpPhase) * 2.4 : 0;
    group.position.set(
      x,
      dolphin
        ? WATER_LEVEL - 0.4 + surfaceLift
        : WATER_LEVEL - config.depth + Math.sin(angle * 1.8) * 0.22,
      z,
    );
    group.rotation.y = Math.atan2(nextX - x, nextZ - z);
    group.rotation.z = Math.sin(angle * 1.3) * 0.06;
    group.rotation.x = dolphin ? jumpPhase * 0.18 : 0;
    if (Math.hypot(
      x - playerPosition.current.x,
      group.position.y - playerPosition.current.y,
      z - playerPosition.current.z,
    ) < 20) {
      onObserveSpecies(config.speciesId);
    }
  }, [config, onObserveSpecies, playerPosition]);

  return (
    <AnimatedAquaticAnimal
      url={`${OCEAN_ROOT}/${config.file}`}
      scale={config.scale}
      animationSpeed={0.76 + config.speed * 2}
      materialTone={config.tone}
      update={update}
    />
  );
}

export default function ArchiveOceanLife({
  enabled,
  playerPosition,
  onObserveSpecies,
}: {
  enabled: boolean;
  playerPosition: MutableRefObject<Vector3>;
  onObserveSpecies: (id: ArchiveSpeciesId) => void;
}) {
  const player = playerPosition.current;
  const [deepOceanMounted, setDeepOceanMounted] = useState(() => (
    player.x < coastlineXAt(player.z) - 2
  ));
  const deepOceanMountedRef = useRef(deepOceanMounted);
  const depthFrame = useRef(0);
  useFrame(() => {
    depthFrame.current = (depthFrame.current + 1) % 15;
    if (depthFrame.current !== 0) return;
    const current = playerPosition.current;
    const next = current.x < coastlineXAt(current.z) + (deepOceanMountedRef.current ? 8 : -2);
    if (next === deepOceanMountedRef.current) return;
    deepOceanMountedRef.current = next;
    setDeepOceanMounted(next);
  });
  if (!enabled) return null;
  return (
    <group name="archive-world-ocean-life">
      {OCEAN_ANIMALS.filter((config) => (
        config.file === 'Dolphin.fbx' || deepOceanMounted
      )).map((config) => (
        <OceanAnimal
          key={config.id}
          config={config}
          playerPosition={playerPosition}
          onObserveSpecies={onObserveSpecies}
        />
      ))}
    </group>
  );
}
