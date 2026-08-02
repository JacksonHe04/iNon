'use client';

import { useEffect, useMemo, useRef, type MutableRefObject } from 'react';
import { useFrame } from '@react-three/fiber';
import {
  Color,
  DoubleSide,
  DynamicDrawUsage,
  Group,
  InstancedMesh,
  Object3D,
  ShaderMaterial,
  type Vector3,
} from 'three';
import { WORLD_KEEPSAKES, WORLD_KEEPSAKE_COUNT } from '@/components/world/archiveWorldConstants';
import { seededRandom, terrainHeightAt } from '@/components/world/archiveTerrainMath';
import { weatherFragment, weatherVertex } from '@/components/world/archiveWorldShaders';

export function FallingPaperSnow({
  playerPosition,
  count = 980,
}: {
  playerPosition: MutableRefObject<Vector3>;
  count?: number;
}) {
  const group = useRef<Group>(null);
  const mesh = useRef<InstancedMesh>(null);
  const material = useRef<ShaderMaterial>(null);
  const dummy = useMemo(() => new Object3D(), []);
  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uPaper: { value: new Color('#e7e4d2') },
    uOchre: { value: new Color('#c4a45d') },
  }), []);

  useEffect(() => {
    if (!mesh.current) return;
    const random = seededRandom(3141592);
    for (let index = 0; index < count; index += 1) {
      dummy.position.set((random() - 0.5) * 76, random() * 20, (random() - 0.5) * 76);
      const scale = 0.075 + random() * 0.19;
      dummy.scale.set(scale, scale * (0.42 + random() * 0.88), scale);
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
    group.current.position.z = playerPosition.current.z;
  });

  return (
    <group ref={group}>
      <instancedMesh ref={mesh} args={[undefined, undefined, count]} frustumCulled={false}>
        <planeGeometry args={[1, 0.54]} />
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
  const mesh = useRef<InstancedMesh>(null);
  const dummy = useMemo(() => new Object3D(), []);
  const collectedSet = useMemo(() => new Set(collected), [collected]);
  const announced = useRef(new Set<string>());

  useEffect(() => {
    if (!mesh.current) return;
    WORLD_KEEPSAKES.forEach(([id, x, z], index) => {
      const hidden = collectedSet.has(id);
      dummy.position.set(hidden ? 0 : x, hidden ? -200 : terrainHeightAt(x, z) + 1.1, hidden ? 0 : z);
      dummy.rotation.set(-0.18, index * 0.83, (index % 5 - 2) * 0.08);
      dummy.scale.setScalar(hidden ? 0.001 : 0.42);
      dummy.updateMatrix();
      mesh.current?.setMatrixAt(index, dummy.matrix);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
  }, [collectedSet, dummy]);

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
    <instancedMesh ref={mesh} args={[undefined, undefined, WORLD_KEEPSAKE_COUNT]} name="collectible-field-pages">
      <planeGeometry args={[1, 0.72]} />
      <meshStandardMaterial color="#d8cca2" emissive="#8b7746" emissiveIntensity={0.72} roughness={0.92} side={DoubleSide} />
    </instancedMesh>
  );
}
