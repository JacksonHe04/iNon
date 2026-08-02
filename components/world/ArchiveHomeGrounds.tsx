'use client';

import { useMemo } from 'react';
import { CuboidCollider, RigidBody } from '@react-three/rapier';
import { Matrix4 } from 'three';
import ArchiveHomeEcology from '@/components/world/ArchiveHomeEcology';
import {
  HOME_GROUNDS_ROOT,
  InstancedAsset,
  MEDIEVAL_ROOT,
  PROP_ROOT,
  PropAsset,
  TintedGltfAsset,
} from '@/components/world/ArchiveAsset';
import { QUATERNIUS_NATURE_ROOT } from '@/components/world/QuaterniusForest';
import {
  ARCHIVE_HOME_GROUND_Y,
  ARCHIVE_HOME_X,
  ARCHIVE_HOME_Z,
  archiveHomeGroundTransform,
  archiveHomeLocalGroundY,
} from '@/components/world/archiveHomeGroundMath';

function makeFenceTransforms() {
  const placements: Matrix4[] = [];
  for (let x = -14; x <= 16; x += 2) {
    placements.push(archiveHomeGroundTransform(x, -11, 0, 1.04));
    if (x < -4 || x > 2) placements.push(archiveHomeGroundTransform(x, 26, Math.PI, 1.04));
  }
  for (let z = -9; z <= 24; z += 2) {
    placements.push(archiveHomeGroundTransform(-16, z, Math.PI / 2, 1.04));
    placements.push(archiveHomeGroundTransform(17, z, -Math.PI / 2, 1.04));
  }
  return placements;
}

function GardenPatch({ position, rotation = 0 }: { position: [number, number]; rotation?: number }) {
  const [x, z] = position;
  const y = archiveHomeLocalGroundY(x, z);
  return (
    <group position={[x, y, z]} rotation-y={rotation}>
      <TintedGltfAsset
        src={`${HOME_GROUNDS_ROOT}/Flowers.glb`}
        tint="#a0aa83"
        scale={1.15}
      />
      <PropAsset name="Bucket_Wooden_1" position={[4.1, 0, -0.6]} scale={0.76} />
    </group>
  );
}

function GardenPlanting() {
  const ferns = useMemo(() => [
    archiveHomeGroundTransform(4.5, -3.6, 0.2, 0.86),
    archiveHomeGroundTransform(7.7, -3.8, -0.5, 1.05),
    archiveHomeGroundTransform(11, -2.4, 0.8, 0.9),
    archiveHomeGroundTransform(12.8, -0.3, -0.3, 1.08),
  ], []);
  return (
    <group name="archive-home-garden">
      <InstancedAsset src={`${QUATERNIUS_NATURE_ROOT}/Fern_1.gltf`} transforms={ferns} />
      <GardenPatch position={[4.1, -8.2]} rotation={0.12} />
      <GardenPatch position={[8.5, -8]} rotation={-0.08} />
      <GardenPatch position={[11.6, -6.7]} rotation={-0.42} />
      <PropAsset name="Bench" position={[7.2, 0.08, -1.5]} rotation={[0, Math.PI, 0]} scale={0.92} />
    </group>
  );
}

function FireCircle() {
  const x = -10.5;
  const z = 14.5;
  const y = archiveHomeLocalGroundY(x, z);
  const firstLogY = archiveHomeLocalGroundY(x - 3.4, z + 0.8) - y + 0.32;
  const secondLogY = archiveHomeLocalGroundY(x - 2.7, z + 2.6) - y + 0.29;
  return (
    <group name="archive-home-fire-circle" position={[x, y, z]}>
      <TintedGltfAsset src={`${HOME_GROUNDS_ROOT}/Campfire.glb`} tint="#d0ba83" scale={0.38} />
      <pointLight position={[0, 2.1, 0]} color="#d59a52" intensity={14} distance={16} decay={2} />
      <TintedGltfAsset
        src={`${HOME_GROUNDS_ROOT}/LogPile.glb`}
        position={[-3.4, firstLogY, 0.8]}
        rotation={[0, 0.62, 0]}
        scale={4.2}
        tint="#858f72"
      />
      <TintedGltfAsset
        src={`${HOME_GROUNDS_ROOT}/LogPile.glb`}
        position={[-2.7, secondLogY, 2.6]}
        rotation={[0, 1.28, 0]}
        scale={3.7}
        tint="#858f72"
      />
      <PropAsset name="Axe_Bronze" position={[-4.4, 0.12, -0.5]} rotation={[0, -0.7, -1.15]} scale={0.85} />
    </group>
  );
}

function FadedPool() {
  const x = 9;
  const z = 10.5;
  const y = archiveHomeLocalGroundY(x, z) - 0.55;
  return (
    <group name="archive-home-swimming-pool" position={[x, y, z]} rotation-y={-0.08}>
      <TintedGltfAsset
        src={`${HOME_GROUNDS_ROOT}/PublicPool.glb`}
        tint="#536b58"
        scale={0.92}
      />
      <CuboidCollider args={[5.2, 0.6, 0.22]} position={[0, 0.7, -5]} />
      <CuboidCollider args={[5.2, 0.6, 0.22]} position={[0, 0.7, 5]} />
      <CuboidCollider args={[0.22, 0.6, 4.8]} position={[-5, 0.7, 0]} />
      <CuboidCollider args={[0.22, 0.6, 4.8]} position={[5, 0.7, 0]} />
    </group>
  );
}

export default function ArchiveHomeGrounds() {
  const fences = useMemo(makeFenceTransforms, []);
  return (
    <RigidBody
      type="fixed"
      colliders={false}
      position={[ARCHIVE_HOME_X, ARCHIVE_HOME_GROUND_Y, ARCHIVE_HOME_Z]}
      name="single-coastal-home-grounds"
    >
      <InstancedAsset src={`${MEDIEVAL_ROOT}/Prop_WoodenFence_Extension1.gltf`} transforms={fences} />
      <CuboidCollider args={[0.24, 0.8, 18.5]} position={[-16, 0.8, 7.5]} />
      <CuboidCollider args={[0.24, 0.8, 18.5]} position={[17, 0.8, 7.5]} />
      <CuboidCollider args={[16.5, 0.8, 0.24]} position={[0.5, 0.8, -11]} />
      <CuboidCollider args={[5.6, 0.8, 0.24]} position={[-10.4, 0.8, 26]} />
      <CuboidCollider args={[6.4, 0.8, 0.24]} position={[10.6, 0.8, 26]} />
      <GardenPlanting />
      <ArchiveHomeEcology />
      <FadedPool />
      <FireCircle />
      <PropAsset name="Barrel" position={[-14.1, 0.1, -6.7]} scale={0.92} />
      <PropAsset name="Workbench" position={[-12.2, 0.1, -7.1]} rotation={[0, 0.18, 0]} scale={0.86} />
    </RigidBody>
  );
}
