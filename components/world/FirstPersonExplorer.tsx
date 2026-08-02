'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { type RapierRigidBody } from '@react-three/rapier';
import { Group, Vector3 } from 'three';
import { ARCHIVE_HORSE_SPAWN, horseWaitingPosition, type HorseMotion } from '@/components/world/ArchiveHorse';
import ExplorerRigs from '@/components/world/ExplorerRigs';
import { terrainKindAt } from '@/components/world/archiveTerrainMath';
import { WORLD_PLAYER_SPAWN } from '@/components/world/archiveWorldConstants';
import type {
  GameDestination,
  GameTelemetry,
  GameTravelRequest,
  FirstPersonExplorerProps,
} from '@/components/world/archiveGameTypes';

export default function FirstPersonExplorer({
  enabled,
  destinations,
  playerPosition,
  travelRequest,
  spawn = [...WORLD_PLAYER_SPAWN],
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
  const mountedRef = useRef(false);
  const canMount = useRef(false);
  const mountedHorse = useRef<Group>(null);
  const horseYaw = useRef(-0.8);
  const mountMotion = useRef<HorseMotion>('Idle');
  const waitingMotion = useRef<HorseMotion>('Idle');
  const [mounted, setMounted] = useState(false);
  const [horsePosition, setHorsePosition] = useState<[number, number, number]>(() => [
    ARCHIVE_HORSE_SPAWN[0],
    heightAt(ARCHIVE_HORSE_SPAWN[0], ARCHIVE_HORSE_SPAWN[1]),
    ARCHIVE_HORSE_SPAWN[1],
  ]);
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
      if (event.code !== 'KeyF' || event.repeat) return;
      if (mountedRef.current) {
        const translation = body.current?.translation();
        if (translation) {
          const sideX = Math.cos(yaw.current) * 2.35;
          const sideZ = -Math.sin(yaw.current) * 2.35;
          const nextX = translation.x + sideX;
          const nextZ = translation.z + sideZ;
          setHorsePosition([nextX, heightAt(nextX, nextZ), nextZ]);
          horseYaw.current = mountedHorse.current?.rotation.y
            ?? Math.atan2(-Math.sin(yaw.current), -Math.cos(yaw.current));
        }
        mountedRef.current = false;
        mountMotion.current = 'Idle';
        setMounted(false);
      } else if (canMount.current) {
        mountedRef.current = true;
        horseYaw.current = Math.atan2(-Math.sin(yaw.current), -Math.cos(yaw.current));
        setMounted(true);
      }
    };
    const up = (event: KeyboardEvent) => keys.current.delete(event.code);
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
    };
  }, [heightAt, onOpen]);

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
    const travel = (event: Event) => {
      const detail = (event as CustomEvent<GameTravelRequest>).detail;
      const rigidBody = body.current;
      if (!rigidBody || !detail) return;
      const [x, , z] = detail.position;
      const y = heightAt(x, z) + 0.12;
      rigidBody.setTranslation({ x, y, z }, true);
      rigidBody.setLinvel({ x: 0, y: 0, z: 0 }, true);
      playerPosition.current.set(x, y, z);
      if (!mountedRef.current) {
        setHorsePosition(horseWaitingPosition(x, z, heightAt, waterLevel));
      }
      if (typeof detail.yaw === 'number') yaw.current = detail.yaw;
      pitch.current = 0;
      appliedTravelId.current = detail.id;
      nearest.current = null;
      nearestKey.current = null;
      onNearby(null);
    };
    window.addEventListener('archive-world:travel', travel);
    return () => window.removeEventListener('archive-world:travel', travel);
  }, [heightAt, onNearby, playerPosition]);

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
      if (!mountedRef.current) {
        setHorsePosition(horseWaitingPosition(travelX, travelZ, heightAt, waterLevel));
      }
      if (typeof travelRequest.yaw === 'number') yaw.current = travelRequest.yaw;
      pitch.current = 0;
      appliedTravelId.current = travelRequest.id;
      nearest.current = null;
      nearestKey.current = null;
      onNearby(null);
    }
    const translation = rigidBody.translation();
    playerPosition.current.set(translation.x, translation.y, translation.z);
    const isMounted = mountedRef.current;

    eye.set(translation.x, translation.y + (isMounted ? 3.12 : 1.62), translation.z);
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
      Math.min(100, stamina.current + (sprinting ? (isMounted ? -14 : -22) : 17) * delta),
    );
    const speed = inWater
      ? isMounted ? 5.8 : 4.8
      : isMounted
        ? sprinting ? 34 : 18
        : sprinting ? 22 : 12;
    if (moving) direction.normalize().multiplyScalar(speed);
    if (isMounted) {
      mountMotion.current = moving ? (sprinting ? 'Gallop' : 'Walk') : 'Idle';
      if (moving && mountedHorse.current) {
        const desiredYaw = Math.atan2(direction.x, direction.z);
        const yawDelta = Math.atan2(
          Math.sin(desiredYaw - mountedHorse.current.rotation.y),
          Math.cos(desiredYaw - mountedHorse.current.rotation.y),
        );
        mountedHorse.current.rotation.y += yawDelta * Math.min(1, delta * 8);
      }
    }
    rigidBody.setLinvel({ x: direction.x, y: velocity.y, z: direction.z }, true);
    if (keys.current.has('Space') && Math.abs(velocity.y) < 0.09) {
      rigidBody.setLinvel({ x: direction.x, y: isMounted ? 7.2 : 6.4, z: direction.z }, true);
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

    canMount.current = !isMounted && Math.hypot(
      translation.x - horsePosition[0],
      translation.z - horsePosition[2],
    ) < 4.6;

    telemetryFrame.current += 1;
    if (telemetryFrame.current % 6 === 0) {
      const terrain = terrainKindAt(translation.x, translation.z, groundHeight);
      onTelemetry({
        x: translation.x,
        y: translation.y,
        z: translation.z,
        heading: ((-yaw.current * 180) / Math.PI + 360) % 360,
        speed: Math.hypot(direction.x, direction.z),
        stamina: stamina.current,
        inWater,
        mounted: isMounted,
        canMount: canMount.current,
        terrain,
      });
    }
  });

  return (
    <ExplorerRigs
      enabled={enabled}
      mounted={mounted}
      body={body}
      mountedHorse={mountedHorse}
      horsePosition={horsePosition}
      horseYaw={horseYaw}
      waitingMotion={waitingMotion}
      mountMotion={mountMotion}
      spawn={spawn}
    />
  );
}
