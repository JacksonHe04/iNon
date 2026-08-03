'use client';

import { useMemo, useRef, type MutableRefObject } from 'react';
import { useFrame } from '@react-three/fiber';
import { CuboidCollider, RigidBody } from '@react-three/rapier';
import { Group, Matrix4, Vector3 } from 'three';
import ArchiveHomeInterior from '@/components/world/ArchiveHomeInterior';
import { InstancedAsset, MEDIEVAL_ROOT, MedievalAsset, PROP_ROOT, PropAsset } from '@/components/world/ArchiveAsset';
import { RIVER_BRIDGE_POSITION, WORLD_HOME_POSITION } from '@/components/world/archiveWorldConstants';
import { terrainHeightAt } from '@/components/world/archiveTerrainMath';
import { ARCHIVE_HOME_ROTATION } from '@/components/world/archiveWorldZones';
import type { HomeExhibit, HomeInspectionId } from '@/components/world/archiveHomeRecords';

function structureTransform(x: number, y: number, z: number, yaw = 0) {
  return new Matrix4().makeRotationY(yaw).setPosition(x, y, z);
}

export function RiverFootbridge() {
  const floor = useMemo(() => Array.from({ length: 14 }, (_, index) => {
    const x = -13 + index * 2;
    return [-1, 1].map((z) => new Matrix4().makeTranslation(x, 0, z));
  }).flat(), []);
  const fences = useMemo(() => Array.from({ length: 14 }, (_, index) => {
    const x = -13 + index * 2;
    return [-2.05, 2.05].map((z) => new Matrix4().makeTranslation(x, 0.12, z));
  }).flat(), []);
  const even = useMemo(() => fences.filter((_, index) => Math.floor(index / 2) % 2 === 0), [fences]);
  const odd = useMemo(() => fences.filter((_, index) => Math.floor(index / 2) % 2 === 1), [fences]);
  return (
    <RigidBody type="fixed" colliders={false} position={[...RIVER_BRIDGE_POSITION]} rotation={[0, 0, -0.04]}>
      <CuboidCollider args={[14, 0.18, 2]} />
      <InstancedAsset src={`${MEDIEVAL_ROOT}/Floor_WoodDark.gltf`} transforms={floor} />
      <InstancedAsset src={`${MEDIEVAL_ROOT}/Prop_WoodenFence_Single.gltf`} transforms={even} />
      <InstancedAsset src={`${MEDIEVAL_ROOT}/Prop_WoodenFence_Extension1.gltf`} transforms={odd} />
      <PropAsset name="Lantern_Wall" position={[-10.7, 1.05, -2.18]} rotation={[0, Math.PI / 2, 0]} scale={1.05} />
      <PropAsset name="Lantern_Wall" position={[8.9, 1.05, 2.18]} rotation={[0, -Math.PI / 2, 0]} scale={1.05} />
    </RigidBody>
  );
}

function ArchiveHomeDoor({ playerPosition }: { playerPosition: MutableRefObject<Vector3> }) {
  const hinge = useRef<Group>(null);
  const doorWorldPosition = useMemo(() => new Vector3(
    WORLD_HOME_POSITION[0] - 2.45,
    0,
    WORLD_HOME_POSITION[2] + 5.05,
  ), []);
  useFrame((_, delta) => {
    if (!hinge.current) return;
    const distance = Math.hypot(
      playerPosition.current.x - doorWorldPosition.x,
      playerPosition.current.z - doorWorldPosition.z,
    );
    const target = distance < 6.2 ? 1.48 : 0;
    hinge.current.rotation.y += (target - hinge.current.rotation.y) * Math.min(1, delta * 3.6);
  });
  return (
    <group ref={hinge} position={[-1.55, 0.01, 3.06]}>
      <MedievalAsset name="Door_1_Round" tint="#7d846c" />
    </group>
  );
}

function ArchiveHomeModel({
  onInspect,
  playerPosition,
  exhibits,
}: {
  onInspect: (record: HomeInspectionId) => void;
  playerPosition: MutableRefObject<Vector3>;
  exhibits: HomeExhibit[];
}) {
  const straightWalls = useMemo(() => [
    structureTransform(-1, 0, -3, Math.PI),
    structureTransform(1, 0, -3, Math.PI),
    structureTransform(-2, 0, -2, Math.PI / 2),
    structureTransform(-2, 0, 2, Math.PI / 2),
    structureTransform(2, 0, -2, -Math.PI / 2),
    structureTransform(2, 0, 2, -Math.PI / 2),
  ], []);
  const windowWalls = useMemo(() => [
    structureTransform(1, 0, 3),
    structureTransform(-2, 0, 0, Math.PI / 2),
    structureTransform(2, 0, 0, -Math.PI / 2),
  ], []);
  const windows = useMemo(() => [
    structureTransform(1, 0, 3.06),
    structureTransform(-2.05, 0, 0, Math.PI / 2),
    structureTransform(2.05, 0, 0, -Math.PI / 2),
  ], []);
  const floors = useMemo(() => [-1, 1].flatMap((x) => (
    [-2, 0, 2].map((z) => structureTransform(x, 0.03, z))
  )), []);
  const roofFronts = useMemo(() => [
    structureTransform(0, 3, 3),
    structureTransform(0, 3, -3, Math.PI),
  ], []);
  const shellTint = '#8a9680';
  return (
    <group name="single-coastal-archive-home" rotation-y={-0.07} scale={[2.05, 1.48, 1.72]}>
      <MedievalAsset name="Wall_Plaster_Door_Round" position={[-1, 0, 3]} />
      <InstancedAsset src={`${MEDIEVAL_ROOT}/Wall_Plaster_Window_Wide_Round.gltf`} transforms={windowWalls} tint={shellTint} />
      <InstancedAsset src={`${MEDIEVAL_ROOT}/Window_Wide_Round1.gltf`} transforms={windows} tint={shellTint} />
      <MedievalAsset name="WindowShutters_Wide_Round_Open" position={[1, 0, 3.05]} />
      <InstancedAsset src={`${MEDIEVAL_ROOT}/Wall_Plaster_Straight.gltf`} transforms={straightWalls} tint={shellTint} />
      <InstancedAsset src={`${MEDIEVAL_ROOT}/Floor_WoodDark.gltf`} transforms={floors} tint={shellTint} />
      <MedievalAsset name="Roof_RoundTiles_4x6" position={[0, 3, 0]} rotation={[0, 0, 0.025]} />
      <InstancedAsset src={`${MEDIEVAL_ROOT}/Roof_Front_Brick4.gltf`} transforms={roofFronts} tint={shellTint} />
      <MedievalAsset name="Prop_Chimney" position={[-1.35, 3.8, -0.8]} scale={0.82} />
      <MedievalAsset name="Prop_Vine1" position={[1.8, 2.3, 3.13]} />
      <ArchiveHomeDoor playerPosition={playerPosition} />
      <ArchiveHomeInterior exhibits={exhibits} onInspect={onInspect} playerPosition={playerPosition} />
    </group>
  );
}

export function CoastalArchiveHome({
  onInspect,
  playerPosition,
  exhibits,
}: {
  onInspect: (record: HomeInspectionId) => void;
  playerPosition: MutableRefObject<Vector3>;
  exhibits: HomeExhibit[];
}) {
  const [x, , z] = WORLD_HOME_POSITION;
  return (
    <RigidBody
      type="fixed"
      colliders={false}
      name="single-coastal-archive-home"
      position={[x, terrainHeightAt(x, z), z]}
      rotation={[0, ARCHIVE_HOME_ROTATION, 0]}
    >
      <CuboidCollider args={[4.35, 2.25, 0.24]} position={[0, 2.25, -5.05]} />
      <CuboidCollider args={[0.24, 2.25, 5]} position={[-4.18, 2.25, 0]} />
      <CuboidCollider args={[0.24, 2.25, 5]} position={[4.18, 2.25, 0]} />
      <CuboidCollider args={[2.05, 2.25, 0.24]} position={[2.15, 2.25, 5.05]} />
      <ArchiveHomeModel exhibits={exhibits} onInspect={onInspect} playerPosition={playerPosition} />
    </RigidBody>
  );
}
