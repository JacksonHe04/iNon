'use client';

import { useLoader } from '@react-three/fiber';
import { Group } from 'three';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';
import AnimatedAnimalScene from '@/components/world/AnimatedAnimalScene';

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
  return (
    <AnimatedAnimalScene
      source={source}
      animations={source.animations}
      scale={scale}
      animationSpeed={animationSpeed}
      materialTone={materialTone}
      update={update}
    />
  );
}
