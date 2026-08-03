'use client';

import { useMemo, useRef, type MutableRefObject } from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import {
  InstancedMesh,
  Material,
  Mesh,
  Object3D,
  Vector3,
  type BufferGeometry,
} from 'three';
import type { ArchiveSpeciesId } from '@/components/world/archiveSpeciesCatalog';

const BIRD_URL = '/archive-world/quaternius-animals/Bird.glb';
const BIRD_COUNT = 18;

interface BirdPart {
  geometry: BufferGeometry;
  material: Material | Material[];
}

export default function ArchiveBirdFlock({
  enabled,
  playerPosition,
  heightAt,
  onObserveSpecies,
}: {
  enabled: boolean;
  playerPosition: MutableRefObject<Vector3>;
  heightAt: (x: number, z: number) => number;
  onObserveSpecies: (id: ArchiveSpeciesId) => void;
}) {
  const gltf = useGLTF(BIRD_URL);
  const meshes = useRef<Array<InstancedMesh | null>>([]);
  const dummy = useMemo(() => new Object3D(), []);
  const anchor = useRef(new Vector3(28, 0, -34));
  const parts = useMemo(() => {
    const result: BirdPart[] = [];
    gltf.scene.updateMatrixWorld(true);
    gltf.scene.traverse((child) => {
      if (!(child instanceof Mesh)) return;
      const geometry = child.geometry.clone();
      geometry.applyMatrix4(child.matrixWorld);
      result.push({ geometry, material: child.material });
    });
    return result;
  }, [gltf.scene]);

  useFrame(({ clock }) => {
    if (!enabled) return;
    const player = playerPosition.current;
    let nearestBirdDistance = Number.POSITIVE_INFINITY;
    const dx = anchor.current.x - player.x;
    const dz = anchor.current.z - player.z;
    if (dx * dx + dz * dz > 170 * 170) {
      anchor.current.set(player.x + 34, 0, player.z - 42);
    }

    for (let index = 0; index < BIRD_COUNT; index += 1) {
      const lane = index % 3;
      const radius = 18 + lane * 8 + (index % 5) * 1.7;
      const speed = 0.065 + lane * 0.014;
      const angle = clock.elapsedTime * speed + index * 2.399;
      const x = anchor.current.x + Math.cos(angle) * radius;
      const z = anchor.current.z + Math.sin(angle) * radius * 0.68;
      const altitude = 18 + lane * 6 + Math.sin(angle * 2.2 + index) * 2.4;
      const y = Math.max(9, heightAt(x, z)) + altitude;
      nearestBirdDistance = Math.min(nearestBirdDistance, Math.hypot(x - player.x, y - player.y, z - player.z));
      dummy.position.set(x, y, z);
      dummy.rotation.set(
        Math.sin(angle * 2.1 + index) * 0.05,
        -angle + Math.PI * 0.5,
        Math.sin(angle * 1.8 + index) * 0.16,
      );
      const scale = 0.72 + (index % 4) * 0.08;
      dummy.scale.setScalar(scale);
      dummy.updateMatrix();
      meshes.current.forEach((mesh) => mesh?.setMatrixAt(index, dummy.matrix));
    }
    meshes.current.forEach((mesh) => {
      if (mesh) mesh.instanceMatrix.needsUpdate = true;
    });
    if (nearestBirdDistance < 38) onObserveSpecies('jay');
  });

  return (
    <group name="archive-world-bird-flock">
      {parts.map((part, index) => (
        <instancedMesh
          key={`${part.geometry.uuid}-${index}`}
          ref={(mesh) => { meshes.current[index] = mesh; }}
          args={[part.geometry, part.material, BIRD_COUNT]}
          castShadow
          frustumCulled={false}
        />
      ))}
    </group>
  );
}
