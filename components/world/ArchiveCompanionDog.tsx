'use client';

import { useEffect, useMemo, useRef, type MutableRefObject } from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { AnimationMixer, Group, Mesh, MeshStandardMaterial, Vector3 } from 'three';
import { cloneAnimatedAsset } from '@/components/world/cloneAnimatedAsset';

const DOG_URL = '/archive-world/quaternius-animals/ShibaInu.glb';
export const COMPANION_NAME = '苔苔';

export default function ArchiveCompanionDog({
  enabled,
  playerPosition,
  heightAt,
  onProximity,
}: {
  enabled: boolean;
  playerPosition: MutableRefObject<Vector3>;
  heightAt: (x: number, z: number) => number;
  onProximity: (nearby: boolean) => void;
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
      const x = player.x + 4.2;
      const z = player.z + 2.6;
      group.position.set(x, heightAt(x, z), z);
      wasPlaced.current = true;
    }

    const playerDistance = Math.hypot(group.position.x - player.x, group.position.z - player.z);
    if (playerDistance > 58) {
      const x = player.x + 4.4;
      const z = player.z + 3.6;
      group.position.set(x, heightAt(x, z), z);
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
    const targetDistance = Math.hypot(
      group.position.x - followTarget.current.x,
      group.position.z - followTarget.current.z,
    );
    const movingFast = targetDistance > 12;
    const moving = targetDistance > 1.25;
    const nextAnimation = movingFast
      ? 'Gallop'
      : moving
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

    if (!moving) {
      group.position.y = heightAt(group.position.x, group.position.z);
      return;
    }

    const travel = direction.current.set(
      followTarget.current.x - group.position.x,
      0,
      followTarget.current.z - group.position.z,
    ).normalize();
    const speed = movingFast ? 7.4 : 2.3;
    const nextX = group.position.x + travel.x * speed * delta;
    const nextZ = group.position.z + travel.z * speed * delta;
    group.position.set(nextX, heightAt(nextX, nextZ), nextZ);
    const desiredYaw = Math.atan2(travel.x, travel.z);
    const yawDelta = Math.atan2(
      Math.sin(desiredYaw - group.rotation.y),
      Math.cos(desiredYaw - group.rotation.y),
    );
    group.rotation.y += yawDelta * Math.min(1, delta * 7);
  });

  return (
    <group ref={root} name="companion-dog-taitai" scale={0.72}>
      <primitive object={scene} />
    </group>
  );
}

useGLTF.preload(DOG_URL);
