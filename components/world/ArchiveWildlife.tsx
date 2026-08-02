'use client';

import { Suspense, useEffect, useMemo, useRef, type MutableRefObject } from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import {
  AnimationMixer,
  Group,
  Mesh,
  MeshStandardMaterial,
  Vector3,
} from 'three';
import { clone as cloneSkeleton } from 'three/addons/utils/SkeletonUtils.js';
import {
  ANIMAL_BEHAVIOUR,
  ANIMAL_FILES,
  WORLD_ANIMALS,
  animalAppearsInHabitat,
  type AnimalConfig,
} from '@/components/world/archiveAnimalConfig';
import { worldBiomeAt } from '@/components/world/archiveWorldBiomes';

const ANIMAL_ROOT = '/archive-world/quaternius-animals';
const WATER_LEVEL = -1.05;
const ALPINE_SPECIES = new Set<AnimalConfig['species']>(['deer', 'fox', 'stag', 'wolf']);

function safeGroundPosition(
  heightAt: (x: number, z: number) => number,
  x: number,
  z: number,
  fallbackX: number,
  fallbackZ: number,
) {
  const proposedHeight = heightAt(x, z);
  if (proposedHeight > WATER_LEVEL + 0.38) return new Vector3(x, proposedHeight, z);
  return new Vector3(fallbackX, heightAt(fallbackX, fallbackZ), fallbackZ);
}

function AnimatedAnimal({
  config,
  playerPosition,
  heightAt,
}: {
  config: AnimalConfig;
  playerPosition: MutableRefObject<Vector3>;
  heightAt: (x: number, z: number) => number;
}) {
  const behaviour = ANIMAL_BEHAVIOUR[config.species];
  const url = `${ANIMAL_ROOT}/${ANIMAL_FILES[config.species]}`;
  const gltf = useGLTF(url);
  const root = useRef<Group>(null);
  const scene = useMemo(() => cloneSkeleton(gltf.scene), [gltf.scene]);
  const mixer = useMemo(() => new AnimationMixer(scene), [scene]);
  const home = useRef(new Vector3(config.offset[0], 0, config.offset[1]));
  const target = useRef(new Vector3(config.offset[0] + 4, 0, config.offset[1] - 3));
  const locomotion = useRef('');
  const nextDecisionAt = useRef(0);
  const decision = useRef(0);
  const wasPlaced = useRef(false);
  const movementDirection = useRef(new Vector3());
  const fleeDirection = useRef(new Vector3());

  const actions = useMemo(() => {
    const map = new Map<string, ReturnType<typeof mixer.clipAction>>();
    gltf.animations.forEach((clip) => {
      const action = mixer.clipAction(clip);
      const semanticName = clip.name.split('|').at(-1) ?? clip.name;
      map.set(clip.name, action);
      map.set(semanticName, action);
      map.set(semanticName.replace(/^[A-Za-z]+_/, ''), action);
    });
    return map;
  }, [gltf.animations, mixer]);

  useEffect(() => {
    scene.traverse((child) => {
      if (!(child instanceof Mesh)) return;
      child.castShadow = true;
      child.receiveShadow = true;
      if (child.material instanceof MeshStandardMaterial) {
        child.material = child.material.clone();
        child.material.roughness = 0.96;
        child.material.metalness = 0;
        child.material.color.multiplyScalar(behaviour.materialTone);
      }
    });
  }, [behaviour.materialTone, scene]);

  useEffect(() => {
    const idle = actions.get('Idle') ?? actions.values().next().value;
    idle?.reset().fadeIn(0.2).play();
    locomotion.current = idle?.getClip().name ?? '';
    return () => {
      mixer.stopAllAction();
    };
  }, [actions, mixer]);

  useFrame(({ clock }, delta) => {
    const group = root.current;
    if (!group) return;

    if (!wasPlaced.current) {
      const start = safeGroundPosition(
        heightAt,
        config.offset[0],
        config.offset[1],
        config.offset[0] + 9,
        config.offset[1] + 7,
      );
      group.position.copy(start);
      home.current.copy(start);
      target.current.copy(start);
      wasPlaced.current = true;
      nextDecisionAt.current = clock.elapsedTime + 1 + config.phase;
    }

    const player = playerPosition.current;
    const playerHeight = heightAt(player.x, player.z);
    const playerBiome = worldBiomeAt(player.x, player.z, playerHeight);
    group.visible = animalAppearsInHabitat(config.species, playerBiome)
      && (playerHeight < 12 || ALPINE_SPECIES.has(config.species));
    if (!group.visible) return;
    mixer.update(delta);
    const distanceToPlayer = Math.hypot(group.position.x - player.x, group.position.z - player.z);

    if (distanceToPlayer > 118) {
      const reanchored = safeGroundPosition(
        heightAt,
        player.x + config.offset[0],
        player.z + config.offset[1],
        player.x - config.offset[0] * 0.72,
        player.z - config.offset[1] * 0.72,
      );
      group.position.copy(reanchored);
      home.current.copy(reanchored);
      target.current.copy(reanchored);
      nextDecisionAt.current = clock.elapsedTime + 1.4 + config.phase * 0.2;
    }

    const flee = distanceToPlayer < behaviour.fleeDistance;
    if (flee) {
      const away = fleeDirection.current.set(
        group.position.x - player.x,
        0,
        group.position.z - player.z,
      );
      if (away.lengthSq() < 0.01) away.set(1, 0, 0);
      away.normalize();
      target.current.set(group.position.x + away.x * 24, 0, group.position.z + away.z * 24);
      nextDecisionAt.current = clock.elapsedTime + 2.8;
    } else if (clock.elapsedTime >= nextDecisionAt.current) {
      decision.current += 1;
      const angle = config.phase * 2.3 + decision.current * 2.17;
      const radius = 4.5 + ((decision.current * 7 + Math.floor(config.phase * 10)) % 9);
      const proposedX = home.current.x + Math.cos(angle) * radius;
      const proposedZ = home.current.z + Math.sin(angle) * radius;
      const proposedHeight = heightAt(proposedX, proposedZ);
      if (proposedHeight > WATER_LEVEL + 0.38) {
        target.current.set(proposedX, proposedHeight, proposedZ);
      } else {
        target.current.set(home.current.x - Math.cos(angle) * radius, 0, home.current.z - Math.sin(angle) * radius);
      }
      nextDecisionAt.current = clock.elapsedTime + 5.8 + (decision.current % 4) * 1.6;
    }

    const direction = movementDirection.current.copy(target.current).sub(group.position);
    direction.y = 0;
    const distanceToTarget = direction.length();
    const moving = flee || distanceToTarget > 1.25;
    const walkAnimation = actions.has('Walk') ? 'Walk' : actions.has('Run') ? 'Run' : 'Idle';
    const fleeAnimation = actions.has('Gallop') ? 'Gallop' : actions.has('Run') ? 'Run' : walkAnimation;
    const forageAnimation = actions.has('Eating') ? 'Eating' : actions.has('Idle_Peck') ? 'Idle_Peck' : 'Idle';
    const requestedAnimation = flee
      ? fleeAnimation
      : moving
        ? walkAnimation
        : decision.current % 2 === 0 ? forageAnimation : 'Idle';

    if (requestedAnimation !== locomotion.current) {
      const next = actions.get(requestedAnimation) ?? actions.get('Idle');
      const current = actions.get(locomotion.current);
      current?.fadeOut(0.28);
      next?.reset().fadeIn(0.28).play();
      locomotion.current = next?.getClip().name ?? requestedAnimation;
    }

    if (moving && distanceToTarget > 0.01) {
      direction.normalize();
      const speed = flee ? behaviour.fleeingSpeed : behaviour.roamingSpeed;
      const nextX = group.position.x + direction.x * speed * delta;
      const nextZ = group.position.z + direction.z * speed * delta;
      const nextY = heightAt(nextX, nextZ);
      if (nextY > WATER_LEVEL + 0.3) {
        group.position.set(nextX, nextY, nextZ);
      } else {
        target.current.copy(home.current);
      }
      const desiredYaw = Math.atan2(direction.x, direction.z);
      const yawDelta = Math.atan2(Math.sin(desiredYaw - group.rotation.y), Math.cos(desiredYaw - group.rotation.y));
      group.rotation.y += yawDelta * Math.min(1, delta * 5.5);
    } else {
      group.position.y = heightAt(group.position.x, group.position.z);
    }
  });

  return (
    <group ref={root} scale={config.scale}>
      <primitive object={scene} />
    </group>
  );
}

export default function ArchiveWildlife({
  playerPosition,
  heightAt,
  animalsEnabled,
}: {
  playerPosition: MutableRefObject<Vector3>;
  heightAt: (x: number, z: number) => number;
  animalsEnabled: boolean;
}) {
  return (
    <group name="archive-world-wildlife">
      {animalsEnabled && (
        <>
          {WORLD_ANIMALS.map((config) => (
            <Suspense key={config.id} fallback={null}>
              <AnimatedAnimal
                config={config}
                playerPosition={playerPosition}
                heightAt={heightAt}
              />
            </Suspense>
          ))}
        </>
      )}
    </group>
  );
}
