'use client';

import { useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import { CuboidCollider, RigidBody } from '@react-three/rapier';
import { Color, Mesh, type Group } from 'three';
import {
  WATER_LEVEL,
  WORLD_MOUNTAIN_SUMMIT_POSITION,
  WORLD_TIDAL_COVE_POSITION,
} from '@/components/world/archiveWorldConstants';
import { terrainHeightAt } from '@/components/world/archiveTerrainMath';

const ROOT = '/archive-world/quaternius-survival';

function useFadedAsset(file: string) {
  const gltf = useGLTF(`${ROOT}/${file}`);
  return useMemo(() => {
    const clone = gltf.scene.clone(true) as Group;
    clone.traverse((object) => {
      if (!(object instanceof Mesh)) return;
      object.castShadow = true;
      object.receiveShadow = true;
      const materials = Array.isArray(object.material) ? object.material : [object.material];
      const faded = materials.map((material) => {
        const next = material.clone();
        if ('color' in next && next.color instanceof Color) next.color.multiply(new Color('#a8aa8f'));
        if ('roughness' in next && typeof next.roughness === 'number') next.roughness = Math.max(0.82, next.roughness);
        return next;
      });
      object.material = Array.isArray(object.material) ? faded : faded[0];
    });
    return clone;
  }, [gltf.scene]);
}

function Asset({
  file,
  position,
  scale,
  rotation = 0,
}: {
  file: string;
  position: [number, number, number];
  scale: number;
  rotation?: number;
}) {
  const scene = useFadedAsset(file);
  return <primitive object={scene} position={position} scale={scale} rotation-y={rotation} />;
}

function MountainBivouac() {
  const [summitX, , summitZ] = WORLD_MOUNTAIN_SUMMIT_POSITION;
  const tentX = summitX - 8;
  const tentZ = summitZ + 2;
  const fireX = summitX - 3.8;
  const fireZ = summitZ + 2.8;
  return (
    <group name="snow-ridge-bivouac">
      <Asset file="Tent.glb" position={[tentX, terrainHeightAt(tentX, tentZ) + 1.2, tentZ]} scale={0.18} rotation={-0.5} />
      <Asset file="Backpack.glb" position={[summitX - 5.8, terrainHeightAt(summitX - 5.8, summitZ + 4) + 0.45, summitZ + 4]} scale={0.3} rotation={0.5} />
      <Asset file="Bonfire.glb" position={[fireX, terrainHeightAt(fireX, fireZ), fireZ]} scale={0.38} />
      <Asset file="WoodLog.glb" position={[summitX - 4, terrainHeightAt(summitX - 4, summitZ + 5.5), summitZ + 5.5]} scale={0.48} rotation={0.9} />
      <pointLight position={[fireX, terrainHeightAt(fireX, fireZ) + 1.2, fireZ]} color="#d69a58" intensity={7} distance={13} decay={2} />
      <RigidBody type="fixed" colliders={false}>
        <CuboidCollider args={[1.35, 0.95, 2.25]} position={[tentX, terrainHeightAt(tentX, tentZ) + 2.15, tentZ]} rotation={[0, -0.5, 0]} />
        <CuboidCollider args={[1.1, 0.3, 1.1]} position={[summitX - 4, terrainHeightAt(summitX - 4, summitZ + 5.5) + 0.3, summitZ + 5.5]} rotation={[0, 0.9, 0]} />
      </RigidBody>
    </group>
  );
}

function TidalRaft() {
  const [, , coveZ] = WORLD_TIDAL_COVE_POSITION;
  const raftX = -45;
  const raftZ = coveZ - 1;
  return (
    <group name="tidal-cove-raft">
      <Asset file="Raft.glb" position={[raftX, WATER_LEVEL + 0.36, raftZ]} scale={0.26} rotation={0.16} />
      <Asset file="RaftPaddle.glb" position={[raftX, WATER_LEVEL + 0.5, raftZ]} scale={0.24} rotation={1.3} />
    </group>
  );
}

export default function ArchiveWildernessLandmarks() {
  return (
    <group name="archive-wilderness-landmarks">
      <MountainBivouac />
      <TidalRaft />
    </group>
  );
}
