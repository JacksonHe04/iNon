'use client';

import { useEffect, useMemo, useRef, type MutableRefObject } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import {
  CapsuleCollider,
  RigidBody,
  type RapierRigidBody,
} from '@react-three/rapier';
import { Vector3 } from 'three';
import type {
  GameDestination,
  GameTelemetry,
  GameTravelRequest,
} from '@/components/world/ArchiveGameScene';

interface FirstPersonExplorerProps {
  enabled: boolean;
  destinations: GameDestination[];
  playerPosition: MutableRefObject<Vector3>;
  travelRequest: GameTravelRequest | null;
  spawn?: [number, number, number];
  heightAt: (x: number, z: number) => number;
  waterLevel: number;
  onOpen: (type: GameDestination['blockType']) => void;
  onNearby: (destination: GameDestination | null) => void;
  onTelemetry: (telemetry: GameTelemetry) => void;
}

export default function FirstPersonExplorer({
  enabled,
  destinations,
  playerPosition,
  travelRequest,
  spawn = [0, 1.45, 22],
  heightAt,
  waterLevel,
  onOpen,
  onNearby,
  onTelemetry,
}: FirstPersonExplorerProps) {
  const body = useRef<RapierRigidBody>(null);
  const keys = useRef(new Set<string>());
  const dragging = useRef(false);
  const previous = useRef({ x: 0, y: 0 });
  const yaw = useRef(0);
  const pitch = useRef(0);
  const stamina = useRef(100);
  const nearest = useRef<GameDestination | null>(null);
  const nearestKey = useRef<string | null>(null);
  const telemetryFrame = useRef(0);
  const appliedTravelId = useRef<number | null>(null);
  const { camera, gl } = useThree();
  const forward = useMemo(() => new Vector3(), []);
  const right = useMemo(() => new Vector3(), []);
  const direction = useMemo(() => new Vector3(), []);
  const eye = useMemo(() => new Vector3(), []);
  const lookDirection = useMemo(() => new Vector3(), []);
  const lookTarget = useMemo(() => new Vector3(), []);

  useEffect(() => {
    const down = (event: KeyboardEvent) => {
      keys.current.add(event.code);
      if (event.code === 'KeyE' && nearest.current) onOpen(nearest.current.blockType);
    };
    const up = (event: KeyboardEvent) => keys.current.delete(event.code);
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
    };
  }, [onOpen]);

  useEffect(() => {
    if (!enabled) return;
    const canvas = gl.domElement;
    const start = (event: PointerEvent) => {
      dragging.current = true;
      previous.current = { x: event.clientX, y: event.clientY };
      canvas.setPointerCapture?.(event.pointerId);
    };
    const move = (event: PointerEvent) => {
      if (!dragging.current) return;
      const dx = event.clientX - previous.current.x;
      const dy = event.clientY - previous.current.y;
      previous.current = { x: event.clientX, y: event.clientY };
      // Conventional FPS look: drag right turns right, drag down looks down.
      yaw.current -= dx * 0.0038;
      pitch.current = Math.max(-1.18, Math.min(1.18, pitch.current - dy * 0.0032));
    };
    const end = (event: PointerEvent) => {
      dragging.current = false;
      canvas.releasePointerCapture?.(event.pointerId);
    };
    canvas.addEventListener('pointerdown', start);
    canvas.addEventListener('pointermove', move);
    canvas.addEventListener('pointerup', end);
    canvas.addEventListener('pointercancel', end);
    return () => {
      canvas.removeEventListener('pointerdown', start);
      canvas.removeEventListener('pointermove', move);
      canvas.removeEventListener('pointerup', end);
      canvas.removeEventListener('pointercancel', end);
    };
  }, [enabled, gl]);

  useEffect(() => {
    const rigidBody = body.current;
    if (!rigidBody || !travelRequest) return;
    const [x, , z] = travelRequest.position;
    const y = heightAt(x, z) + 0.12;
    rigidBody.setTranslation({ x, y, z }, true);
    rigidBody.setLinvel({ x: 0, y: 0, z: 0 }, true);
    playerPosition.current.set(x, y, z);
    if (typeof travelRequest.yaw === 'number') yaw.current = travelRequest.yaw;
    pitch.current = 0;
    appliedTravelId.current = travelRequest.id;
    nearest.current = null;
    nearestKey.current = null;
  }, [heightAt, playerPosition, travelRequest]);

  useEffect(() => {
    const travel = (event: Event) => {
      const detail = (event as CustomEvent<GameTravelRequest>).detail;
      const rigidBody = body.current;
      if (!rigidBody || !detail) return;
      const [x, , z] = detail.position;
      const y = heightAt(x, z) + 0.12;
      rigidBody.setTranslation({ x, y, z }, true);
      rigidBody.setLinvel({ x: 0, y: 0, z: 0 }, true);
      playerPosition.current.set(x, y, z);
      if (typeof detail.yaw === 'number') yaw.current = detail.yaw;
      pitch.current = 0;
      appliedTravelId.current = detail.id;
      nearest.current = null;
      nearestKey.current = null;
    };
    window.addEventListener('archive-world:travel', travel);
    return () => window.removeEventListener('archive-world:travel', travel);
  }, [heightAt, playerPosition]);

  useEffect(() => {
    const restore = () => {
      stamina.current = 100;
    };
    window.addEventListener('archive-world:restore-stamina', restore);
    return () => window.removeEventListener('archive-world:restore-stamina', restore);
  }, []);

  useFrame((_, delta) => {
    const rigidBody = body.current;
    if (!rigidBody) return;
    if (travelRequest && appliedTravelId.current !== travelRequest.id) {
      const [travelX, , travelZ] = travelRequest.position;
      const travelY = heightAt(travelX, travelZ) + 0.12;
      rigidBody.setTranslation({ x: travelX, y: travelY, z: travelZ }, true);
      rigidBody.setLinvel({ x: 0, y: 0, z: 0 }, true);
      playerPosition.current.set(travelX, travelY, travelZ);
      if (typeof travelRequest.yaw === 'number') yaw.current = travelRequest.yaw;
      pitch.current = 0;
      appliedTravelId.current = travelRequest.id;
      nearest.current = null;
      nearestKey.current = null;
    }
    const translation = rigidBody.translation();
    playerPosition.current.set(translation.x, translation.y, translation.z);

    eye.set(translation.x, translation.y + 1.62, translation.z);
    lookDirection.set(
      -Math.sin(yaw.current) * Math.cos(pitch.current),
      Math.sin(pitch.current),
      -Math.cos(yaw.current) * Math.cos(pitch.current),
    );
    lookTarget.copy(eye).add(lookDirection);
    camera.position.copy(eye);
    camera.lookAt(lookTarget);
    if (!enabled) return;

    const velocity = rigidBody.linvel();
    const groundHeight = heightAt(translation.x, translation.z);
    const inWater = groundHeight <= waterLevel + 0.18;
    const wantsToSprint = keys.current.has('ShiftLeft') || keys.current.has('ShiftRight');
    forward.set(-Math.sin(yaw.current), 0, -Math.cos(yaw.current));
    right.set(Math.cos(yaw.current), 0, -Math.sin(yaw.current));
    direction.set(0, 0, 0);
    if (keys.current.has('KeyW') || keys.current.has('ArrowUp')) direction.add(forward);
    if (keys.current.has('KeyS') || keys.current.has('ArrowDown')) direction.sub(forward);
    if (keys.current.has('KeyD') || keys.current.has('ArrowRight')) direction.add(right);
    if (keys.current.has('KeyA') || keys.current.has('ArrowLeft')) direction.sub(right);

    const moving = direction.lengthSq() > 0;
    const sprinting = wantsToSprint && moving && stamina.current > 2 && !inWater;
    stamina.current = Math.max(
      0,
      Math.min(100, stamina.current + (sprinting ? -22 : 17) * delta),
    );
    const speed = inWater ? 4.8 : sprinting ? 22 : 12;
    if (moving) direction.normalize().multiplyScalar(speed);
    rigidBody.setLinvel({ x: direction.x, y: velocity.y, z: direction.z }, true);
    if (keys.current.has('Space') && Math.abs(velocity.y) < 0.09) {
      rigidBody.setLinvel({ x: direction.x, y: 6.4, z: direction.z }, true);
    }

    if (translation.y < groundHeight - 5) {
      rigidBody.setTranslation(
        { x: translation.x, y: groundHeight + 0.12, z: translation.z },
        true,
      );
      rigidBody.setLinvel({ x: 0, y: 0, z: 0 }, true);
    }

    let candidate: GameDestination | null = null;
    let candidateDistance = 13;
    for (const destination of destinations) {
      const distance = Math.hypot(
        translation.x - destination.position[0],
        translation.z - destination.position[2],
      );
      if (distance < candidateDistance) {
        candidate = destination;
        candidateDistance = distance;
      }
    }
    nearest.current = candidate;
    const candidateKey = candidate?.blockType ?? null;
    if (candidateKey !== nearestKey.current) {
      nearestKey.current = candidateKey;
      onNearby(candidate);
    }

    telemetryFrame.current += 1;
    if (telemetryFrame.current % 6 === 0) {
      const terrain: GameTelemetry['terrain'] = inWater
        ? 'river'
        : Math.hypot(translation.x, translation.z + 3) < 34
          ? 'village'
          : groundHeight > 4.5
            ? 'mountain'
            : 'forest';
      onTelemetry({
        x: translation.x,
        y: translation.y,
        z: translation.z,
        heading: ((-yaw.current * 180) / Math.PI + 360) % 360,
        speed: Math.hypot(direction.x, direction.z),
        stamina: stamina.current,
        inWater,
        mounted: false,
        canMount: false,
        terrain,
      });
    }
  });

  return (
    <RigidBody
      ref={body}
      position={spawn}
      colliders={false}
      enabledRotations={[false, false, false]}
      linearDamping={9}
      friction={1.05}
      canSleep={false}
      ccd
    >
      <CapsuleCollider args={[0.52, 0.34]} position={[0, 0.84, 0]} />
    </RigidBody>
  );
}
