'use client';

import { useEffect, useMemo, useRef, useState, type MutableRefObject } from 'react';
import { useTexture } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { RigidBody, TrimeshCollider } from '@react-three/rapier';
import {
  BackSide,
  BufferAttribute,
  BufferGeometry,
  Color,
  Group,
  RepeatWrapping,
  ShaderMaterial,
  SRGBColorSpace,
  type Vector3,
} from 'three';
import { TERRAIN_CHUNK_SIZE, TERRAIN_SEGMENTS, WATER_LEVEL } from '@/components/world/archiveWorldConstants';
import { terrainHeightAt } from '@/components/world/archiveTerrainMath';
import { terrainFragment, terrainVertex, waterFragment, waterVertex } from '@/components/world/archiveWorldShaders';

interface TerrainTile {
  key: string;
  centerX: number;
  centerZ: number;
  vertices: Float32Array;
  indices: Uint32Array;
  geometry: BufferGeometry;
}

function buildTerrainTile(chunkX: number, chunkZ: number): TerrainTile {
  const centerX = chunkX * TERRAIN_CHUNK_SIZE;
  const centerZ = chunkZ * TERRAIN_CHUNK_SIZE;
  const row = TERRAIN_SEGMENTS + 1;
  const vertices = new Float32Array(row * row * 3);
  const indices = new Uint32Array(TERRAIN_SEGMENTS * TERRAIN_SEGMENTS * 6);
  let vertexIndex = 0;
  for (let zIndex = 0; zIndex <= TERRAIN_SEGMENTS; zIndex += 1) {
    const localZ = (zIndex / TERRAIN_SEGMENTS - 0.5) * TERRAIN_CHUNK_SIZE;
    for (let xIndex = 0; xIndex <= TERRAIN_SEGMENTS; xIndex += 1) {
      const localX = (xIndex / TERRAIN_SEGMENTS - 0.5) * TERRAIN_CHUNK_SIZE;
      vertices.set([localX, terrainHeightAt(centerX + localX, centerZ + localZ), localZ], vertexIndex);
      vertexIndex += 3;
    }
  }
  let index = 0;
  for (let zIndex = 0; zIndex < TERRAIN_SEGMENTS; zIndex += 1) {
    for (let xIndex = 0; xIndex < TERRAIN_SEGMENTS; xIndex += 1) {
      const a = zIndex * row + xIndex;
      const b = a + 1;
      const c = a + row;
      const d = c + 1;
      indices.set([a, c, b, b, c, d], index);
      index += 6;
    }
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new BufferAttribute(vertices, 3));
  geometry.setIndex(new BufferAttribute(indices, 1));
  geometry.computeVertexNormals();
  geometry.computeBoundingSphere();
  return { key: `${chunkX}:${chunkZ}`, centerX, centerZ, vertices, indices, geometry };
}

function terrainTilesAround(chunkX: number, chunkZ: number) {
  const tiles: TerrainTile[] = [];
  for (let x = -1; x <= 1; x += 1) {
    for (let z = -1; z <= 1; z += 1) tiles.push(buildTerrainTile(chunkX + x, chunkZ + z));
  }
  return tiles;
}

export function InfiniteTerrain({ playerPosition }: { playerPosition: MutableRefObject<Vector3> }) {
  const [chunk, setChunk] = useState({ x: 0, z: 0 });
  const chunkRef = useRef(chunk);
  const groundTexture = useTexture('/archive-world/forest-floor-albedo-v2.webp');
  groundTexture.wrapS = RepeatWrapping;
  groundTexture.wrapT = RepeatWrapping;
  groundTexture.colorSpace = SRGBColorSpace;
  const uniforms = useMemo(() => ({
    uGround: { value: groundTexture },
    uMoss: { value: new Color('#62785c') },
    uForest: { value: new Color('#243d2d') },
    uPath: { value: new Color('#9a8b67') },
  }), [groundTexture]);
  const tiles = useMemo(() => terrainTilesAround(chunk.x, chunk.z), [chunk.x, chunk.z]);

  useFrame(() => {
    const x = Math.round(playerPosition.current.x / TERRAIN_CHUNK_SIZE);
    const z = Math.round(playerPosition.current.z / TERRAIN_CHUNK_SIZE);
    if (x === chunkRef.current.x && z === chunkRef.current.z) return;
    chunkRef.current = { x, z };
    setChunk({ x, z });
  });
  useEffect(() => () => tiles.forEach((tile) => tile.geometry.dispose()), [tiles]);

  return tiles.map((tile) => (
    <RigidBody key={tile.key} type="fixed" colliders={false} position={[tile.centerX, 0, tile.centerZ]}>
      <TrimeshCollider args={[tile.vertices, tile.indices]} friction={1.15} />
      <mesh receiveShadow geometry={tile.geometry}>
        <shaderMaterial uniforms={uniforms} vertexShader={terrainVertex} fragmentShader={terrainFragment} />
      </mesh>
    </RigidBody>
  ));
}

export function MountainPanorama({ playerPosition }: { playerPosition: MutableRefObject<Vector3> }) {
  const texture = useTexture('/archive-world/verdant-mountain-panorama-v2.webp');
  const group = useRef<Group>(null);
  texture.colorSpace = SRGBColorSpace;
  texture.wrapS = RepeatWrapping;
  texture.wrapT = RepeatWrapping;
  texture.offset.y = -0.12;
  useFrame(() => {
    if (!group.current) return;
    group.current.position.set(playerPosition.current.x, 18, playerPosition.current.z);
  });
  return (
    <group ref={group}>
      <mesh rotation-y={Math.PI * 0.58}>
        <sphereGeometry args={[255, 64, 32]} />
        <meshBasicMaterial map={texture} side={BackSide} fog={false} toneMapped={false} />
      </mesh>
    </group>
  );
}

export function InfiniteWater({ playerPosition }: { playerPosition: MutableRefObject<Vector3> }) {
  const group = useRef<Group>(null);
  const material = useRef<ShaderMaterial>(null);
  const uniforms = useMemo(() => ({ uTime: { value: 0 } }), []);
  useFrame(({ clock }) => {
    if (material.current) material.current.uniforms.uTime.value = clock.elapsedTime;
    if (!group.current) return;
    group.current.position.x = Math.round(playerPosition.current.x / 160) * 160;
    group.current.position.z = Math.round(playerPosition.current.z / 160) * 160;
  });
  return (
    <group ref={group} position={[0, WATER_LEVEL, 0]}>
      <mesh rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[720, 720, 96, 96]} />
        <shaderMaterial ref={material} uniforms={uniforms} vertexShader={waterVertex} fragmentShader={waterFragment} transparent depthWrite={false} />
      </mesh>
    </group>
  );
}
