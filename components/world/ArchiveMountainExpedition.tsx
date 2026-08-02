'use client';

import { useMemo } from 'react';
import { CuboidCollider, RigidBody } from '@react-three/rapier';
import { Euler, Matrix4, Quaternion, Vector3 } from 'three';
import {
  InstancedAsset,
  MedievalAsset,
  PropAsset,
  TintedGltfAsset,
} from '@/components/world/ArchiveAsset';
import { QUATERNIUS_NATURE_ROOT } from '@/components/world/QuaterniusForest';
import { WORLD_MOUNTAIN_SUMMIT_POSITION } from '@/components/world/archiveWorldConstants';
import { terrainHeightAt } from '@/components/world/archiveTerrainMath';

const SURVIVAL_ROOT = '/archive-world/quaternius-survival';
const [SUMMIT_X, , SUMMIT_Z] = WORLD_MOUNTAIN_SUMMIT_POSITION;

function groundedTransform(
  x: number,
  z: number,
  rotationY: number,
  scale: number,
  lift = 0,
) {
  return new Matrix4().compose(
    new Vector3(x, terrainHeightAt(x, z) + lift, z),
    new Quaternion().setFromEuler(new Euler(0, rotationY, 0)),
    new Vector3(scale, scale, scale),
  );
}

const CAIRN_POINTS = [
  [79, -49, 0.2], [84, -51, -0.3], [89, -53, 0.5],
  [94, -55, -0.1], [99, -56.4, 0.35],
] as const;

function TrailCairns() {
  const bases = useMemo(() => CAIRN_POINTS.map(([x, z, rotation]) => (
    groundedTransform(x, z, rotation, 0.22)
  )), []);
  const crowns = useMemo(() => CAIRN_POINTS.map(([x, z, rotation], index) => (
    groundedTransform(x, z, rotation + 0.7, 0.11, 0.25 + (index % 2) * 0.04)
  )), []);
  return (
    <group name="summit-trail-stone-cairns">
      <InstancedAsset src={`${QUATERNIUS_NATURE_ROOT}/Rock_Medium_2.gltf`} transforms={bases} />
      <InstancedAsset src={`${QUATERNIUS_NATURE_ROOT}/Rock_Medium_1.gltf`} transforms={crowns} />
    </group>
  );
}

function ExpeditionSupplies() {
  const x = SUMMIT_X - 8.1;
  const z = SUMMIT_Z + 5.4;
  const y = terrainHeightAt(x, z);
  return (
    <group name="expedition-supply-corner">
      <MedievalAsset name="Prop_Crate" position={[x, y, z]} rotation={[0, -0.18, 0]} scale={0.42} tint="#b7ad88" />
      <MedievalAsset name="Prop_Crate" position={[x + 0.65, y + 0.03, z - 0.3]} rotation={[0, 0.14, 0]} scale={0.34} tint="#b7ad88" />
      <PropAsset name="Barrel" position={[x - 0.8, terrainHeightAt(x - 0.8, z + 0.2), z + 0.2]} scale={0.42} tint="#b1aa88" />
      <PropAsset name="Bag" position={[x + 1.55, terrainHeightAt(x + 1.55, z + 0.35), z + 0.35]} rotation={[0, 0.6, 0]} scale={0.62} />
      <PropAsset name="Rope_1" position={[x + 0.15, y + 0.5, z]} rotation={[0, -0.2, 0]} scale={0.5} />
      <PropAsset name="Bucket_Metal" position={[x - 0.45, y, z + 0.8]} rotation={[0, 0.4, 0]} scale={0.54} />
    </group>
  );
}

function SummitCamp() {
  const tent = [SUMMIT_X - 8, SUMMIT_Z + 2] as const;
  const fire = [SUMMIT_X - 4, SUMMIT_Z + 3.2] as const;
  const tentY = terrainHeightAt(tent[0], tent[1]);
  const fireY = terrainHeightAt(fire[0], fire[1]);
  return (
    <group name="snow-ridge-expedition-camp">
      <TintedGltfAsset
        src={`${SURVIVAL_ROOT}/Tent.glb`}
        position={[tent[0], tentY + 0.05, tent[1]]}
        rotation={[0, -0.32, 0]}
        scale={0.12}
        tint="#d2d6bc"
      />
      <TintedGltfAsset
        src={`${SURVIVAL_ROOT}/Backpack.glb`}
        position={[tent[0] + 2.4, terrainHeightAt(tent[0] + 2.4, tent[1] + 1) + 0.04, tent[1] + 1]}
        rotation={[0, 0.72, 0]}
        scale={0.2}
        tint="#8b967c"
      />
      <TintedGltfAsset
        src={`${SURVIVAL_ROOT}/Bonfire.glb`}
        position={[fire[0], fireY, fire[1]]}
        rotation={[0, 0.2, 0]}
        scale={0.24}
        tint="#b3a47c"
      />
      {[[-1.9, 0.8, 0.2], [1.5, 1.1, -0.8], [0.4, -1.8, 1.1]].map(([dx, dz, rotation], index) => {
        const x = fire[0] + dx;
        const z = fire[1] + dz;
        return (
          <TintedGltfAsset
            key={`camp-seat-${index}`}
            src={`${SURVIVAL_ROOT}/WoodLog.glb`}
            position={[x, terrainHeightAt(x, z), z]}
            rotation={[0, rotation, 0]}
            scale={0.11}
            tint="#b9ad88"
          />
        );
      })}
      <pointLight position={[fire[0], fireY + 1.1, fire[1]]} color="#d49a58" intensity={8} distance={14} decay={2} />
      <ExpeditionSupplies />
      <RigidBody type="fixed" colliders={false}>
        <CuboidCollider args={[1.75, 0.95, 1.65]} position={[tent[0], tentY + 1.5, tent[1]]} rotation={[0, -0.32, 0]} />
        <CuboidCollider args={[1.8, 0.8, 0.75]} position={[SUMMIT_X - 8.1, terrainHeightAt(SUMMIT_X - 8.1, SUMMIT_Z + 5.4) + 0.8, SUMMIT_Z + 5.4]} rotation={[0, -0.38, 0]} />
      </RigidBody>
    </group>
  );
}

export default function ArchiveMountainExpedition() {
  return (
    <group name="archive-mountain-expedition">
      <TrailCairns />
      <SummitCamp />
    </group>
  );
}
