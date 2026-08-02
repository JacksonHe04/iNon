'use client';

import { useEffect, useMemo, useRef, type MutableRefObject } from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { AnimationMixer, Group, Mesh, MeshStandardMaterial, Vector3 } from 'three';
import { clone as cloneSkeleton } from 'three/addons/utils/SkeletonUtils.js';
import { WATER_LEVEL } from '@/components/world/archiveWorldConstants';
import { riverCenterAt } from '@/components/world/archiveTerrainMath';

const FISH_ROOT = '/archive-world/quaternius-fish';

interface FishConfig {
  id: string;
  file: 'Fish1.glb' | 'Fish2.glb' | 'Fish3.glb';
  scale: number;
  phase: number;
  lane: number;
  speed: number;
}

const RIVER_FISH: readonly FishConfig[] = Array.from({ length: 18 }, (_, index) => ({
  id: `river-fish-${index + 1}`,
  file: `Fish${(index % 3) + 1}.glb` as FishConfig['file'],
  scale: [0.082, 0.0048, 0.0052][index % 3] * (0.78 + (index % 4) * 0.08),
  phase: index * 7.73,
  lane: (index % 5) - 2,
  speed: 0.88 + (index % 4) * 0.14,
}));

function AnimatedRiverFish({
  config,
  playerPosition,
}: {
  config: FishConfig;
  playerPosition: MutableRefObject<Vector3>;
}) {
  const gltf = useGLTF(`${FISH_ROOT}/${config.file}`);
  const root = useRef<Group>(null);
  const scene = useMemo(() => cloneSkeleton(gltf.scene), [gltf.scene]);
  const mixer = useMemo(() => new AnimationMixer(scene), [scene]);
  const anchorZ = useRef(playerPosition.current.z);

  useEffect(() => {
    scene.traverse((child) => {
      if (!(child instanceof Mesh)) return;
      child.castShadow = true;
      if (!(child.material instanceof MeshStandardMaterial)) return;
      child.material = child.material.clone();
      child.material.roughness = 0.78;
      child.material.metalness = 0;
      child.material.color.multiplyScalar(0.76);
    });
  }, [scene]);

  useEffect(() => {
    const action = mixer.clipAction(gltf.animations[0]);
    action.timeScale = 0.72 + (config.phase % 4) * 0.08;
    action.play();
    return () => {
      mixer.stopAllAction();
    };
  }, [config.phase, gltf.animations, mixer]);

  useFrame(({ clock }, delta) => {
    const group = root.current;
    if (!group) return;
    mixer.update(delta);
    if (Math.abs(playerPosition.current.z - anchorZ.current) > 90) {
      anchorZ.current = playerPosition.current.z;
    }

    const route = (clock.elapsedTime * config.speed * 3.4 + config.phase) % 52;
    const z = anchorZ.current + route - 26;
    const laneOffset = config.lane * 1.28;
    const x = riverCenterAt(z) + laneOffset + Math.sin(clock.elapsedTime * 0.7 + config.phase) * 0.7;
    const nextX = riverCenterAt(z + 0.5) + laneOffset;
    const depth = 0.24 + (Math.abs(config.lane) % 3) * 0.14;
    group.position.set(
      x,
      WATER_LEVEL - depth + Math.sin(clock.elapsedTime * 0.8 + config.phase) * 0.16,
      z,
    );
    group.rotation.y = Math.atan2(nextX - x, 0.5);
    group.rotation.z = Math.sin(clock.elapsedTime * 0.55 + config.phase) * 0.035;
  });

  return (
    <group ref={root} scale={config.scale}>
      <primitive object={scene} />
    </group>
  );
}

export default function ArchiveAquaticLife({
  enabled,
  playerPosition,
}: {
  enabled: boolean;
  playerPosition: MutableRefObject<Vector3>;
}) {
  if (!enabled) return null;
  return (
    <group name="archive-world-river-fish">
      {RIVER_FISH.map((config) => (
        <AnimatedRiverFish key={config.id} config={config} playerPosition={playerPosition} />
      ))}
    </group>
  );
}

useGLTF.preload(`${FISH_ROOT}/Fish1.glb`);
useGLTF.preload(`${FISH_ROOT}/Fish2.glb`);
useGLTF.preload(`${FISH_ROOT}/Fish3.glb`);
