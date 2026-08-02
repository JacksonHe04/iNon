'use client';

import { useEffect, useMemo, useRef, type MutableRefObject } from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import {
  AnimationMixer,
  Group,
  Mesh,
  MeshStandardMaterial,
} from 'three';
import { clone as cloneSkeleton } from 'three/addons/utils/SkeletonUtils.js';

export type HorseMotion = 'Idle' | 'Walk' | 'Gallop';

export const ARCHIVE_HORSE_SPAWN = [3.4, 19] as const;

export default function ArchiveHorse({
  motion,
  scale = 0.78,
}: {
  motion: MutableRefObject<HorseMotion>;
  scale?: number;
}) {
  const gltf = useGLTF('/archive-world/quaternius-animals/Horse.glb');
  const root = useRef<Group>(null);
  const scene = useMemo(() => cloneSkeleton(gltf.scene), [gltf.scene]);
  const mixer = useMemo(() => new AnimationMixer(scene), [scene]);
  const currentMotion = useRef<HorseMotion>('Idle');
  const actions = useMemo(
    () => new Map(gltf.animations.map((clip) => [clip.name, mixer.clipAction(clip)])),
    [gltf.animations, mixer],
  );

  useEffect(() => {
    scene.traverse((child) => {
      if (!(child instanceof Mesh)) return;
      child.castShadow = true;
      child.receiveShadow = true;
      if (child.material instanceof MeshStandardMaterial) {
        child.material = child.material.clone();
        child.material.roughness = 0.96;
        child.material.metalness = 0;
        child.material.color.multiplyScalar(0.74);
      }
    });
  }, [scene]);

  useEffect(() => {
    const idle = actions.get('Idle') ?? actions.values().next().value;
    idle?.reset().fadeIn(0.2).play();
    currentMotion.current = 'Idle';
    return () => {
      mixer.stopAllAction();
    };
  }, [actions, mixer]);

  useFrame((_, delta) => {
    mixer.update(delta);
    if (motion.current === currentMotion.current) return;
    const previous = actions.get(currentMotion.current);
    const next = actions.get(motion.current) ?? actions.get('Idle');
    previous?.fadeOut(0.24);
    next?.reset().fadeIn(0.24).play();
    currentMotion.current = motion.current;
  });

  return (
    <group ref={root} scale={scale}>
      <primitive object={scene} />
    </group>
  );
}
