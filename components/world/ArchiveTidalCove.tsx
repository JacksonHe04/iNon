'use client';

import { useMemo } from 'react';
import { BallCollider, CuboidCollider, RigidBody } from '@react-three/rapier';
import { Euler, Matrix4, Quaternion, Vector3 } from 'three';
import {
  InstancedAsset,
  MEDIEVAL_ROOT,
  MedievalAsset,
  PropAsset,
  TintedGltfAsset,
} from '@/components/world/ArchiveAsset';
import { QUATERNIUS_NATURE_ROOT } from '@/components/world/QuaterniusForest';
import { WATER_LEVEL, WORLD_TIDAL_COVE_POSITION } from '@/components/world/archiveWorldConstants';
import { terrainHeightAt } from '@/components/world/archiveTerrainMath';

const SURVIVAL_ROOT = '/archive-world/quaternius-survival';
const COVE_Z = WORLD_TIDAL_COVE_POSITION[2];
const DOCK_Y = WATER_LEVEL + 1.18;

type Placement = readonly [x: number, z: number, rotation: number, scale: number, lift?: number];

function groundTransform([x, z, rotation, scale, lift = 0]: Placement) {
  return new Matrix4().compose(
    new Vector3(x, terrainHeightAt(x, z) + lift, z),
    new Quaternion().setFromEuler(new Euler(0, rotation, 0)),
    new Vector3(scale, scale, scale),
  );
}

function fixedTransform(x: number, y: number, z: number, rotation: number, scale: number) {
  return new Matrix4().compose(
    new Vector3(x, y, z),
    new Quaternion().setFromEuler(new Euler(0, rotation, 0)),
    new Vector3(scale, scale, scale),
  );
}

const NORTH_ROCKS: readonly Placement[] = [
  [-34.3, -84.5, 0.2, 0.58], [-35.8, -88.8, -0.5, 0.72],
  [-36.5, -93, 0.8, 0.54], [-32.5, -88, -0.2, 0.36],
];
const SOUTH_ROCKS: readonly Placement[] = [
  [-36, -103.8, -0.3, 0.62], [-35.2, -108, 0.5, 0.78],
  [-33.2, -112, -0.7, 0.5], [-32.8, -106, 0.35, 0.34],
];
const COASTAL_PLANTS: readonly Placement[] = [
  [-31, -84.2, 0.2, 0.66], [-31.7, -87.3, -0.4, 0.58],
  [-30.8, -110, 0.7, 0.64], [-31.5, -106.8, -0.2, 0.6],
  [-26.8, -84, 0.3, 0.5], [-27.3, -111.5, -0.5, 0.54],
  [-25.2, -94.4, 0.5, 0.46], [-25.4, -101.8, -0.3, 0.48],
  [-28.4, -102.2, 0.7, 0.5], [-27.6, -94, -0.6, 0.44],
];
const COVE_EDGE_PLANTS: readonly Placement[] = [
  [-23.8, -94.2, 0.2, 0.5], [-24, -102.6, -0.5, 0.54],
  [-30.2, -103, 0.7, 0.58], [-30.5, -93.4, -0.2, 0.52],
];
const POOL_RIM: readonly Placement[] = [
  [-32.2, -86, 0.1, 0.42], [-30.5, -82.5, -0.2, 0.38],
  [-27.4, -80.8, 0.3, 0.44], [-24.6, -82.3, -0.4, 0.4],
  [-23.8, -85.8, 0.2, 0.42], [-25.2, -89.4, -0.1, 0.38],
];
const PATH_STONES: readonly Placement[] = [
  [-23.7, -98, 0.08, 0.74], [-25.8, -98.1, -0.12, 0.7],
  [-27.8, -98, 0.14, 0.76], [-29.6, -98.1, -0.08, 0.72],
];

function TidalDock() {
  const floor = useMemo(() => Array.from({ length: 7 }, (_, index) => {
    const x = -29.5 - index * 1.85;
    return fixedTransform(x, DOCK_Y + (index % 2) * 0.018, COVE_Z, 0, 0.96);
  }), []);
  const rail = useMemo(() => [-31, -34.7, -38.4].map((x) => (
    fixedTransform(x, DOCK_Y + 0.1, COVE_Z - 1.12, 0, 0.82)
  )), []);
  return (
    <group name="weathered-tidal-launch-dock">
      <InstancedAsset src={`${MEDIEVAL_ROOT}/Floor_WoodDark.gltf`} transforms={floor} />
      <InstancedAsset src={`${MEDIEVAL_ROOT}/Prop_WoodenFence_Single.gltf`} transforms={rail} />
      <MedievalAsset
        name="Floor_WoodDark"
        position={[-42.8, -0.17, COVE_Z]}
        rotation={[0, 0, 0.29]}
        scale={[1.4, 1, 0.96]}
        tint="#8f9279"
      />
      <MedievalAsset
        name="Floor_WoodDark"
        position={[-45.3, -0.92, COVE_Z]}
        rotation={[0, 0, 0.29]}
        scale={[1.4, 1, 0.96]}
        tint="#7f8974"
      />
      <CuboidCollider args={[6.6, 0.22, 1.08]} position={[-35.1, DOCK_Y + 0.02, COVE_Z]} />
      <TintedGltfAsset
        src={`${SURVIVAL_ROOT}/Raft.glb`}
        position={[-43, WATER_LEVEL + 0.36, COVE_Z + 2.65]}
        rotation={[0, -0.1, 0]}
        scale={0.24}
        tint="#87937d"
      />
      <TintedGltfAsset
        src={`${SURVIVAL_ROOT}/RaftPaddle.glb`}
        position={[-42.7, WATER_LEVEL + 0.5, COVE_Z + 2.65]}
        rotation={[0, 1.28, 0]}
        scale={0.22}
        tint="#a8a17f"
      />
    </group>
  );
}

function ShoreSupplies() {
  const x = -29.2;
  const z = COVE_Z + 4.5;
  const y = terrainHeightAt(x, z);
  return (
    <group name="tidal-launch-supplies">
      <MedievalAsset name="Prop_Crate" position={[x, y, z]} rotation={[0, -0.12, 0]} scale={0.28} tint="#aa9e79" />
      <PropAsset name="Barrel" position={[x + 0.7, terrainHeightAt(x + 0.7, z + 0.2), z + 0.2]} scale={0.28} tint="#9b9577" />
      <PropAsset name="Rope_2" position={[x - 0.3, y + 0.43, z]} rotation={[0, 0.4, 0]} scale={0.3} />
      <PropAsset name="Bucket_Metal" position={[x + 0.15, y, z + 0.8]} rotation={[0, -0.2, 0]} scale={0.42} />
    </group>
  );
}

function CoveEcology() {
  const north = useMemo(() => NORTH_ROCKS.map(groundTransform), []);
  const south = useMemo(() => SOUTH_ROCKS.map(groundTransform), []);
  const plants = useMemo(() => COASTAL_PLANTS.map(groundTransform), []);
  const edgePlants = useMemo(() => COVE_EDGE_PLANTS.map(groundTransform), []);
  const rim = useMemo(() => POOL_RIM.map(groundTransform), []);
  const path = useMemo(() => PATH_STONES.map(groundTransform), []);
  return (
    <group name="rocky-cove-ecology">
      <InstancedAsset src={`${QUATERNIUS_NATURE_ROOT}/Rock_Medium_2.gltf`} transforms={north} />
      <InstancedAsset src={`${QUATERNIUS_NATURE_ROOT}/Rock_Medium_3.gltf`} transforms={south} />
      <InstancedAsset src={`${QUATERNIUS_NATURE_ROOT}/Grass_Wispy_Tall.gltf`} transforms={plants} />
      <InstancedAsset src={`${QUATERNIUS_NATURE_ROOT}/Plant_7_Big.gltf`} transforms={edgePlants} />
      <InstancedAsset src={`${QUATERNIUS_NATURE_ROOT}/RockPath_Round_Small_2.gltf`} transforms={rim} />
      <InstancedAsset src={`${QUATERNIUS_NATURE_ROOT}/RockPath_Round_Small_1.gltf`} transforms={path} />
      {[...NORTH_ROCKS, ...SOUTH_ROCKS].map(([x, z, , scale], index) => (
        <BallCollider
          key={`cove-rock-${index}`}
          args={[Math.max(0.45, scale * 1.45)]}
          position={[x, terrainHeightAt(x, z) + scale * 0.7, z]}
        />
      ))}
    </group>
  );
}

export default function ArchiveTidalCove() {
  return (
    <RigidBody type="fixed" colliders={false} name="archive-tidal-cove">
      <CoveEcology />
      <TidalDock />
      <ShoreSupplies />
    </RigidBody>
  );
}
