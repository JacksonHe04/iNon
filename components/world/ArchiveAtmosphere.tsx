'use client';

import { useEffect, useMemo, useRef, type MutableRefObject } from 'react';
import { useGLTF, useTexture } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import {
  Color,
  DoubleSide,
  DynamicDrawUsage,
  Group,
  InstancedMesh,
  Matrix4,
  Object3D,
  SRGBColorSpace,
  ShaderMaterial,
  type Vector3,
} from 'three';
import { PROP_ROOT } from '@/components/world/ArchiveAsset';
import { collectQuaterniusParts } from '@/components/world/QuaterniusForest';
import { WORLD_KEEPSAKES, WORLD_KEEPSAKE_COUNT } from '@/components/world/archiveWorldConstants';
import { seededRandom, terrainHeightAt } from '@/components/world/archiveTerrainMath';
import { weatherFragment, weatherVertex } from '@/components/world/archiveWorldShaders';

export function FallingPaperSnow({
  playerPosition,
  count = 1680,
}: {
  playerPosition: MutableRefObject<Vector3>;
  count?: number;
}) {
  const group = useRef<Group>(null);
  const mesh = useRef<InstancedMesh>(null);
  const material = useRef<ShaderMaterial>(null);
  const dummy = useMemo(() => new Object3D(), []);
  const paperAtlas = useTexture('/archive-world/weather/aged-paper-fragments-v1.webp');
  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uPaperAtlas: { value: paperAtlas },
    uMistTint: { value: new Color('#d8d8c8') },
    uOchreTint: { value: new Color('#c4a45d') },
  }), [paperAtlas]);

  useEffect(() => {
    paperAtlas.colorSpace = SRGBColorSpace;
    paperAtlas.needsUpdate = true;
  }, [paperAtlas]);

  useEffect(() => {
    if (!mesh.current) return;
    const random = seededRandom(3141592);
    for (let index = 0; index < count; index += 1) {
      dummy.position.set((random() - 0.5) * 58, random() * 26, (random() - 0.5) * 58);
      const scale = 0.12 + random() * 0.24;
      dummy.scale.setScalar(scale);
      dummy.rotation.set(random() * Math.PI, random() * Math.PI, random() * Math.PI);
      dummy.updateMatrix();
      mesh.current.setMatrixAt(index, dummy.matrix);
    }
    mesh.current.instanceMatrix.setUsage(DynamicDrawUsage);
    mesh.current.instanceMatrix.needsUpdate = true;
  }, [count, dummy]);

  useFrame(({ clock }) => {
    if (material.current) material.current.uniforms.uTime.value = clock.elapsedTime;
    if (!group.current) return;
    group.current.position.x = playerPosition.current.x;
    group.current.position.y = playerPosition.current.y;
    group.current.position.z = playerPosition.current.z;
  });

  return (
    <group ref={group}>
      <instancedMesh ref={mesh} args={[undefined, undefined, count]} frustumCulled={false}>
        <planeGeometry args={[1, 1]} />
        <shaderMaterial
          ref={material}
          uniforms={uniforms}
          vertexShader={weatherVertex}
          fragmentShader={weatherFragment}
          transparent
          depthWrite={false}
          side={DoubleSide}
        />
      </instancedMesh>
    </group>
  );
}

export function WorldKeepsakes({
  enabled,
  playerPosition,
  collected,
  onCollect,
}: {
  enabled: boolean;
  playerPosition: MutableRefObject<Vector3>;
  collected: string[];
  onCollect: (id: string) => void;
}) {
  const scroll = useGLTF(`${PROP_ROOT}/Scroll_2.gltf`);
  const parts = useMemo(() => collectQuaterniusParts(scroll.scene), [scroll.scene]);
  const meshes = useRef<Array<InstancedMesh | null>>([]);
  const dummy = useMemo(() => new Object3D(), []);
  const placement = useMemo(() => new Matrix4(), []);
  const collectedSet = useMemo(() => new Set(collected), [collected]);
  const announced = useRef(new Set<string>());

  useEffect(() => {
    WORLD_KEEPSAKES.forEach(([id, x, z], index) => {
      const hidden = collectedSet.has(id);
      dummy.position.set(hidden ? 0 : x, hidden ? -200 : terrainHeightAt(x, z) + 0.22, hidden ? 0 : z);
      dummy.rotation.set(0, index * 0.83, (index % 5 - 2) * 0.04);
      dummy.scale.setScalar(hidden ? 0.001 : 0.86);
      dummy.updateMatrix();
      parts.forEach((part, partIndex) => {
        const target = meshes.current[partIndex];
        if (!target) return;
        placement.multiplyMatrices(dummy.matrix, part.localMatrix);
        target.setMatrixAt(index, placement);
      });
    });
    meshes.current.forEach((target) => {
      if (!target) return;
      target.instanceMatrix.needsUpdate = true;
      target.computeBoundingSphere();
    });
  }, [collectedSet, dummy, parts, placement]);

  useFrame(() => {
    if (!enabled) return;
    WORLD_KEEPSAKES.forEach(([id, x, z]) => {
      if (collectedSet.has(id) || announced.current.has(id)) return;
      if (Math.hypot(playerPosition.current.x - x, playerPosition.current.z - z) >= 1.65) return;
      announced.current.add(id);
      onCollect(id);
    });
  });

  return (
    <group name="collectible-quaternius-field-scrolls">
      {parts.map((part, index) => (
        <instancedMesh
          key={index}
          ref={(target) => { meshes.current[index] = target; }}
          args={[part.geometry, part.material, WORLD_KEEPSAKE_COUNT]}
          castShadow
          receiveShadow
        />
      ))}
    </group>
  );
}
