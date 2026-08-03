'use client';

import { useEffect, useMemo, useRef, type MutableRefObject } from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { AnimationMixer, Group, Mesh, MeshStandardMaterial, Vector3 } from 'three';
import { cloneAnimatedAsset } from '@/components/world/cloneAnimatedAsset';
import {
  chooseCompanionStep,
  companionDoorTarget,
  companionObstaclesAround,
  safeCompanionCatchUp,
  type CompanionObstacle,
} from '@/components/world/archiveCompanionNavigation';
import { isWalkableAnimalGround } from '@/components/world/archiveAnimalTerrain';

const DOG_URL = '/archive-world/quaternius-animals/ShibaInu.glb';
export const COMPANION_NAME = '苔苔';
export type CompanionBehavior = 'resting' | 'following' | 'catching-up' | 'waiting-for-safe-ground' | 'using-home-door';
export interface CompanionTelemetry {
  x: number;
  y: number;
  z: number;
  behavior: CompanionBehavior;
}
const ignoreCompanionTelemetry = () => undefined;

export default function ArchiveCompanionDog({
  enabled,
  playerPosition,
  heightAt,
  onProximity,
  onTelemetry = ignoreCompanionTelemetry,
}: {
  enabled: boolean;
  playerPosition: MutableRefObject<Vector3>;
  heightAt: (x: number, z: number) => number;
  onProximity: (nearby: boolean) => void;
  onTelemetry?: (telemetry: CompanionTelemetry) => void;
}) {
  const gltf = useGLTF(DOG_URL);
  const root = useRef<Group>(null);
  const scene = useMemo(() => cloneAnimatedAsset(gltf.scene), [gltf.scene]);
  const mixer = useMemo(() => new AnimationMixer(scene), [scene]);
  const actions = useMemo(
    () => new Map(gltf.animations.map((clip) => [clip.name, mixer.clipAction(clip)])),
    [gltf.animations, mixer],
  );
  const currentAnimation = useRef('');
  const wasPlaced = useRef(false);
  const wasNearby = useRef(false);
  const direction = useRef(new Vector3());
  const cameraDirection = useRef(new Vector3());
  const followTarget = useRef(new Vector3());
  const right = useRef(new Vector3());
  const obstacles = useRef<CompanionObstacle[]>([]);
  const obstacleCell = useRef('');
  const lastTelemetryAt = useRef(-Infinity);

  useEffect(() => {
    scene.traverse((child) => {
      if (!(child instanceof Mesh)) return;
      child.castShadow = true;
      child.receiveShadow = true;
      if (!(child.material instanceof MeshStandardMaterial)) return;
      child.material = child.material.clone();
      child.material.roughness = 0.92;
      child.material.metalness = 0;
      child.material.color.multiplyScalar(0.88);
    });
  }, [scene]);

  useEffect(() => {
    const idle = actions.get('Idle') ?? actions.values().next().value;
    idle?.reset().play();
    currentAnimation.current = idle?.getClip().name ?? '';
    return () => {
      mixer.stopAllAction();
    };
  }, [actions, mixer]);

  useEffect(() => {
    if (enabled) return;
    wasNearby.current = false;
    onProximity(false);
  }, [enabled, onProximity]);

  useFrame(({ clock, camera }, delta) => {
    const group = root.current;
    if (!group) return;
    mixer.update(delta);

    const player = playerPosition.current;
    if (!wasPlaced.current) {
      const ground = safeCompanionCatchUp(player.x, player.z, heightAt);
      if (ground) group.position.set(ground.x, ground.y, ground.z);
      wasPlaced.current = true;
    }

    let behavior: CompanionBehavior = 'resting';
    let playerDistance = Math.hypot(group.position.x - player.x, group.position.z - player.z);
    if (playerDistance > 58) {
      const ground = safeCompanionCatchUp(player.x, player.z, heightAt);
      if (ground) group.position.set(ground.x, ground.y, ground.z);
      playerDistance = Math.hypot(group.position.x - player.x, group.position.z - player.z);
      behavior = 'catching-up';
    }

    const nearby = enabled && playerDistance < 6.4;
    if (nearby !== wasNearby.current) {
      wasNearby.current = nearby;
      onProximity(nearby);
    }

    if (!enabled) return;
    camera.getWorldDirection(cameraDirection.current);
    cameraDirection.current.y = 0;
    cameraDirection.current.normalize();
    right.current.set(-cameraDirection.current.z, 0, cameraDirection.current.x);
    followTarget.current.copy(player)
      .addScaledVector(cameraDirection.current, -4.2)
      .addScaledVector(right.current, 2.1);
    const doorTarget = companionDoorTarget(
      group.position.x,
      group.position.z,
      player.x,
      player.z,
    );
    if (doorTarget) {
      followTarget.current.set(doorTarget.x, heightAt(doorTarget.x, doorTarget.z), doorTarget.z);
      behavior = 'using-home-door';
    }
    const targetDistance = Math.hypot(
      group.position.x - followTarget.current.x,
      group.position.z - followTarget.current.z,
    );
    const movingFast = targetDistance > 12;
    const moving = targetDistance > 1.25;
    const cell = `${Math.floor(group.position.x / 24)}:${Math.floor(group.position.z / 24)}`;
    if (cell !== obstacleCell.current) {
      obstacleCell.current = cell;
      obstacles.current = companionObstaclesAround(group.position.x, group.position.z, heightAt);
    }
    const speed = movingFast ? 7.4 : 2.3;
    const targetIsSafe = isWalkableAnimalGround(
      heightAt,
      'husky',
      followTarget.current.x,
      followTarget.current.z,
    );
    const nextGround = moving
      ? chooseCompanionStep({
        x: group.position.x,
        z: group.position.z,
        targetX: followTarget.current.x,
        targetZ: followTarget.current.z,
        step: Math.min(0.46, speed * delta),
        heightAt,
        obstacles: obstacles.current,
      })
      : null;
    if (moving && (!nextGround || !targetIsSafe)) behavior = 'waiting-for-safe-ground';
    else if (behavior === 'resting' && moving) behavior = movingFast ? 'catching-up' : 'following';
    const nextAnimation = moving && nextGround && movingFast
      ? 'Gallop'
      : moving && nextGround
        ? 'Walk'
        : Math.sin(clock.elapsedTime * 0.34) > 0.82
          ? 'Idle_2'
          : 'Idle';

    if (nextAnimation !== currentAnimation.current) {
      actions.get(currentAnimation.current)?.fadeOut(0.24);
      const next = actions.get(nextAnimation) ?? actions.get('Idle');
      next?.reset().fadeIn(0.24).play();
      currentAnimation.current = next?.getClip().name ?? nextAnimation;
    }

    if (!moving || !nextGround) {
      group.position.y = heightAt(group.position.x, group.position.z);
    } else {
      const travel = direction.current.set(
        nextGround.x - group.position.x,
        0,
        nextGround.z - group.position.z,
      ).normalize();
      group.position.set(nextGround.x, nextGround.y, nextGround.z);
      const desiredYaw = Math.atan2(travel.x, travel.z);
      const yawDelta = Math.atan2(
        Math.sin(desiredYaw - group.rotation.y),
        Math.cos(desiredYaw - group.rotation.y),
      );
      group.rotation.y += yawDelta * Math.min(1, delta * 7);
    }
    if (clock.elapsedTime - lastTelemetryAt.current >= 0.75) {
      lastTelemetryAt.current = clock.elapsedTime;
      onTelemetry({
        x: group.position.x,
        y: group.position.y,
        z: group.position.z,
        behavior,
      });
    }
  });

  return (
    <group ref={root} name="companion-dog-taitai" scale={0.72}>
      <primitive object={scene} />
    </group>
  );
}

useGLTF.preload(DOG_URL);
