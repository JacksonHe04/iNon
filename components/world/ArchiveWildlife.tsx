'use client';

import { useEffect, useMemo, useRef, type MutableRefObject } from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import {
  AnimationMixer,
  BufferAttribute,
  BufferGeometry,
  DoubleSide,
  DynamicDrawUsage,
  Group,
  InstancedMesh,
  Mesh,
  MeshStandardMaterial,
  Object3D,
  Vector3,
} from 'three';
import { clone as cloneSkeleton } from 'three/addons/utils/SkeletonUtils.js';

const ANIMAL_ROOT = '/archive-world/quaternius-animals';
const WATER_LEVEL = -1.05;

type AnimalSpecies = 'deer' | 'fox';

interface AnimalConfig {
  id: string;
  species: AnimalSpecies;
  offset: readonly [number, number];
  scale: number;
  phase: number;
}

const ANIMALS: readonly AnimalConfig[] = [
  { id: 'doe-near', species: 'deer', offset: [63, -43], scale: 0.78, phase: 0.3 },
  { id: 'doe-far', species: 'deer', offset: [71, -49], scale: 0.72, phase: 1.7 },
  { id: 'doe-young', species: 'deer', offset: [58, -51], scale: 0.6, phase: 3.1 },
  { id: 'fox-ridge', species: 'fox', offset: [-31, 26], scale: 0.62, phase: 4.4 },
  { id: 'fox-wood', species: 'fox', offset: [-39, 38], scale: 0.56, phase: 5.8 },
] as const;

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
  const url = `${ANIMAL_ROOT}/${config.species === 'deer' ? 'Deer' : 'Fox'}.gltf`;
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
        child.material.color.multiplyScalar(config.species === 'deer' ? 0.76 : 0.72);
      }
    });
  }, [config.species, scene]);

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
    mixer.update(delta);

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

    const flee = distanceToPlayer < (config.species === 'deer' ? 12 : 9);
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
    const requestedAnimation = flee ? 'Gallop' : moving ? 'Walk' : decision.current % 2 === 0 ? 'Eating' : 'Idle';

    if (requestedAnimation !== locomotion.current) {
      const next = actions.get(requestedAnimation) ?? actions.get('Idle');
      const current = actions.get(locomotion.current);
      current?.fadeOut(0.28);
      next?.reset().fadeIn(0.28).play();
      locomotion.current = next?.getClip().name ?? requestedAnimation;
    }

    if (moving && distanceToTarget > 0.01) {
      direction.normalize();
      const speed = flee ? (config.species === 'deer' ? 7.1 : 6.2) : config.species === 'deer' ? 1.05 : 1.28;
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

function wingGeometry(direction: -1 | 1) {
  const geometry = new BufferGeometry();
  geometry.setAttribute(
    'position',
    new BufferAttribute(
      new Float32Array([
        0, 0, 0.1,
        direction * 0.84, 0, -0.14,
        direction * 0.56, 0, 0.3,
      ]),
      3,
    ),
  );
  geometry.setIndex([0, 1, 2]);
  geometry.computeVertexNormals();
  return geometry;
}

function MigratingBirds({ playerPosition, count = 28 }: { playerPosition: MutableRefObject<Vector3>; count?: number }) {
  const left = useRef<InstancedMesh>(null);
  const right = useRef<InstancedMesh>(null);
  const leftWing = useMemo(() => wingGeometry(-1), []);
  const rightWing = useMemo(() => wingGeometry(1), []);
  const dummy = useMemo(() => new Object3D(), []);
  const flock = useMemo(
    () => Array.from({ length: count }, (_, index) => ({
      radius: 24 + ((index * 17) % 58),
      altitude: 12 + ((index * 11) % 22),
      speed: 0.025 + (index % 7) * 0.0036,
      phase: index * 2.399,
      wingSpeed: 5.4 + (index % 5) * 0.72,
      scale: 0.52 + (index % 4) * 0.11,
    })),
    [count],
  );

  useEffect(() => {
    left.current?.instanceMatrix.setUsage(DynamicDrawUsage);
    right.current?.instanceMatrix.setUsage(DynamicDrawUsage);
    return () => {
      leftWing.dispose();
      rightWing.dispose();
    };
  }, [leftWing, rightWing]);

  useFrame(({ clock }) => {
    if (!left.current || !right.current) return;
    const time = clock.elapsedTime;
    const centerX = Math.round(playerPosition.current.x / 120) * 120;
    const centerZ = Math.round(playerPosition.current.z / 120) * 120;

    flock.forEach((bird, index) => {
      const angle = time * bird.speed + bird.phase;
      const x = centerX + Math.cos(angle) * bird.radius + Math.sin(angle * 2.1) * 7;
      const z = centerZ + Math.sin(angle) * bird.radius * 0.66;
      const y = playerPosition.current.y + bird.altitude + Math.sin(time * 0.18 + bird.phase) * 3.2;
      const yaw = -angle + Math.PI * 0.5;
      const flap = Math.sin(time * bird.wingSpeed + bird.phase) * 0.52;

      dummy.position.set(x, y, z);
      dummy.rotation.set(0, yaw, flap);
      dummy.scale.setScalar(bird.scale);
      dummy.updateMatrix();
      left.current?.setMatrixAt(index, dummy.matrix);

      dummy.rotation.set(0, yaw, -flap);
      dummy.updateMatrix();
      right.current?.setMatrixAt(index, dummy.matrix);
    });

    left.current.instanceMatrix.needsUpdate = true;
    right.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <group name="migrating-bird-flocks">
      <instancedMesh ref={left} args={[leftWing, undefined, count]} frustumCulled={false}>
        <meshStandardMaterial color="#263a2e" roughness={1} side={DoubleSide} />
      </instancedMesh>
      <instancedMesh ref={right} args={[rightWing, undefined, count]} frustumCulled={false}>
        <meshStandardMaterial color="#263a2e" roughness={1} side={DoubleSide} />
      </instancedMesh>
    </group>
  );
}

export default function ArchiveWildlife({
  playerPosition,
  heightAt,
}: {
  playerPosition: MutableRefObject<Vector3>;
  heightAt: (x: number, z: number) => number;
}) {
  return (
    <group name="archive-world-wildlife">
      <MigratingBirds playerPosition={playerPosition} />
      {ANIMALS.map((config) => (
        <AnimatedAnimal
          key={config.id}
          config={config}
          playerPosition={playerPosition}
          heightAt={heightAt}
        />
      ))}
    </group>
  );
}

useGLTF.preload(`${ANIMAL_ROOT}/Deer.gltf`);
useGLTF.preload(`${ANIMAL_ROOT}/Fox.gltf`);
