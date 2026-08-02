'use client';

import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { AnimationMixer, Group, Mesh, MeshStandardMaterial } from 'three';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';
import { clone as cloneSkeleton } from 'three/addons/utils/SkeletonUtils.js';

export default function AnimatedAquaticAnimal({
  url,
  scale,
  animationSpeed = 1,
  materialTone = 0.76,
  update,
}: {
  url: string;
  scale: number;
  animationSpeed?: number;
  materialTone?: number;
  update: (group: Group, elapsed: number, delta: number) => void;
}) {
  const source = useLoader(FBXLoader, url);
  const root = useRef<Group>(null);
  const scene = useMemo(() => cloneSkeleton(source), [source]);
  const mixer = useMemo(() => new AnimationMixer(scene), [scene]);

  useEffect(() => {
    scene.traverse((child) => {
      if (!(child instanceof Mesh)) return;
      child.castShadow = true;
      if (!(child.material instanceof MeshStandardMaterial)) return;
      child.material = child.material.clone();
      child.material.roughness = 0.78;
      child.material.metalness = 0;
      child.material.color.multiplyScalar(materialTone);
    });
  }, [materialTone, scene]);

  useEffect(() => {
    const clip = source.animations[0];
    if (!clip) return;
    const action = mixer.clipAction(clip);
    action.timeScale = animationSpeed;
    action.play();
    return () => {
      mixer.stopAllAction();
    };
  }, [animationSpeed, mixer, source.animations]);

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
