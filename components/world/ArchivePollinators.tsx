'use client';

import { useEffect, useMemo, useRef, type MutableRefObject } from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { Group, Mesh, Vector3 } from 'three';

const BEE_COUNT = 14;

export default function ArchivePollinators({
  enabled,
  playerPosition,
  heightAt,
}: {
  enabled: boolean;
  playerPosition: MutableRefObject<Vector3>;
  heightAt: (x: number, z: number) => number;
}) {
  const gltf = useGLTF('/archive-world/quaternius-animals/Bee.glb');
  const bees = useMemo(
    () => Array.from({ length: BEE_COUNT }, () => gltf.scene.clone(true)),
    [gltf.scene],
  );
  const groups = useRef<Array<Group | null>>([]);
  const anchor = useRef(new Vector3(playerPosition.current.x, 0, playerPosition.current.z));

  useEffect(() => {
    bees.forEach((bee) => bee.traverse((child) => {
      if (child instanceof Mesh) child.castShadow = true;
    }));
  }, [bees]);

  useFrame(({ clock }) => {
    if (!enabled) return;
    const player = playerPosition.current;
    if (Math.hypot(player.x - anchor.current.x, player.z - anchor.current.z) > 42) {
      anchor.current.set(player.x, 0, player.z);
    }
    groups.current.forEach((group, index) => {
      if (!group) return;
      const phase = index * 2.399;
      const radius = 7 + (index % 5) * 5.1;
      const angle = clock.elapsedTime * (0.28 + (index % 3) * 0.06) + phase;
      const x = anchor.current.x + Math.cos(angle) * radius + Math.sin(phase * 3.1) * 4;
      const z = anchor.current.z + Math.sin(angle * 1.17) * radius + Math.cos(phase * 2.3) * 4;
      const y = heightAt(x, z) + 1.3 + Math.sin(clock.elapsedTime * 3.2 + phase) * 0.48;
      group.position.set(x, y, z);
      group.rotation.y = -angle + Math.PI / 2;
      group.rotation.z = Math.sin(clock.elapsedTime * 5 + phase) * 0.12;
    });
  });

  if (!enabled) return null;
  return (
    <group name="archive-world-quaternius-bee-swarm">
      {bees.map((bee, index) => (
        <group
          key={index}
          ref={(group) => { groups.current[index] = group; }}
          scale={1 + (index % 3) * 0.12}
        >
          <primitive object={bee} />
        </group>
      ))}
    </group>
  );
}
