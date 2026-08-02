'use client';

import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import {
  AnimationClip,
  AnimationMixer,
  Group,
  Mesh,
  MeshStandardMaterial,
  Object3D,
} from 'three';
import { clone as cloneSkeleton } from 'three/addons/utils/SkeletonUtils.js';

export default function AnimatedAnimalScene({
  source,
  animations,
  animationName,
  scale,
  animationSpeed = 1,
  materialTone = 0.76,
  update,
}: {
  source: Object3D;
  animations: readonly AnimationClip[];
  animationName?: string;
  scale: number;
  animationSpeed?: number;
  materialTone?: number;
  update: (group: Group, elapsed: number, delta: number) => void;
}) {
  const root = useRef<Group>(null);
  const scene = useMemo(() => cloneSkeleton(source), [source]);
  const mixer = useMemo(() => new AnimationMixer(scene), [scene]);

  useEffect(() => {
    scene.traverse((child) => {
      if (!(child instanceof Mesh)) return;
      child.castShadow = true;
      child.receiveShadow = true;
      if (!(child.material instanceof MeshStandardMaterial)) return;
      child.material = child.material.clone();
      child.material.roughness = 0.82;
      child.material.metalness = 0;
      child.material.color.multiplyScalar(materialTone);
    });
  }, [materialTone, scene]);

  useEffect(() => {
    const clip = animations.find((item) => (
      item.name.split('|').at(-1) === animationName
    )) ?? animations[0];
    if (!clip) return;
    const action = mixer.clipAction(clip);
    action.timeScale = animationSpeed;
    action.play();
    return () => {
      mixer.stopAllAction();
    };
  }, [animationName, animationSpeed, animations, mixer]);

  useFrame(({ clock }, delta) => {
    if (!root.current) return;
    mixer.update(delta);
    update(root.current, clock.elapsedTime, delta);
  });

  return (
    <group ref={root} scale={scale}>
      <primitive object={scene} />
    </group>
  );
}
