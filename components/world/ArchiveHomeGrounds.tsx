'use client';

import { useMemo } from 'react';
import { CuboidCollider, CylinderCollider, RigidBody } from '@react-three/rapier';
import ArchiveHomeEcology from '@/components/world/ArchiveHomeEcology';
import {
  HOME_GROUNDS_ROOT,
  InstancedAsset,
  MEDIEVAL_ROOT,
  MedievalAsset,
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
import { HOME_FENCE_COLLIDERS, HOME_GROVE_COLLIDERS, makeHomeFenceTransforms } from '@/components/world/archiveHomeGroundLayout';

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
      <PropAsset name="Bucket_Metal" position={[12.7, 0.08, -5.4]} rotation={[0, -0.28, 0]} scale={0.52} />
      <PropAsset name="Bag" position={[10.9, 0.12, -4.9]} rotation={[0, 0.46, 0]} scale={0.5} />
    </group>
  );
}

function WorkingYard() {
  return (
    <group name="archive-home-working-yard">
      <PropAsset name="Workbench" position={[-12.2, 0.1, -7.1]} rotation={[0, 0.18, 0]} scale={0.86} />
      <PropAsset name="Workbench_Drawers" position={[-9.7, 0.1, -7.5]} rotation={[0, -0.12, 0]} scale={0.78} />
      <PropAsset name="Barrel" position={[-14.1, 0.1, -6.7]} scale={0.92} />
      <PropAsset name="Bucket_Wooden_1" position={[-13.8, 0.08, -3.9]} rotation={[0, 0.32, 0]} scale={0.62} />
      <PropAsset name="Rope_1" position={[-11.2, 0.12, -5.4]} rotation={[0, -0.46, 0]} scale={0.58} />
      <MedievalAsset name="Prop_Crate" position={[-9.3, 0.08, -5.8]} rotation={[0, 0.2, 0]} scale={0.74} tint="#78806a" />
      <MedievalAsset name="Prop_Wagon" position={[-13.3, 0.12, -0.7]} rotation={[0, 1.38, 0]} scale={0.72} tint="#7b846d" />
    </group>
  );
}

function FrontPorchLife() {
  return (
    <group name="archive-home-front-porch-life">
      <PropAsset name="Bench" position={[-6.1, 0.08, 5.7]} rotation={[0, 1.62, 0]} scale={0.78} />
      <PropAsset name="Bag" position={[-4.8, 0.1, 6.2]} rotation={[0, -0.34, 0]} scale={0.56} />
      <MedievalAsset name="Prop_Crate" position={[3.2, 0.08, 5.8]} rotation={[0, -0.18, 0]} scale={0.56} tint="#7d836b" />
      <PropAsset name="Lantern_Wall" position={[3.3, 0.66, 5.7]} rotation={[0, 0.18, 0]} scale={0.62} />
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
  const fences = useMemo(makeHomeFenceTransforms, []);
  return (
    <RigidBody
      type="fixed"
      colliders={false}
      position={[ARCHIVE_HOME_X, ARCHIVE_HOME_GROUND_Y, ARCHIVE_HOME_Z]}
      name="single-coastal-home-grounds"
    >
      <InstancedAsset src={`${MEDIEVAL_ROOT}/Prop_WoodenFence_Extension1.gltf`} transforms={fences} />
      {HOME_FENCE_COLLIDERS.map((collider, index) => (
        <CuboidCollider key={index} args={[...collider.args]} position={[...collider.position]} />
      ))}
      {HOME_GROVE_COLLIDERS.map(([x, z, radius]) => (
        <CylinderCollider
          key={`${x}:${z}`}
          args={[2.8, radius]}
          position={[x, archiveHomeLocalGroundY(x, z) + 2.8, z]}
        />
      ))}
      <GardenPlanting />
      <WorkingYard />
      <FrontPorchLife />
      <ArchiveHomeEcology />
      <FadedPool />
      <FireCircle />
    </RigidBody>
  );
}
