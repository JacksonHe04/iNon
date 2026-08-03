'use client';

import { useMemo } from 'react';
import { Euler, Matrix4, Quaternion, Vector3 } from 'three';
import { InstancedAsset } from '@/components/world/ArchiveAsset';
import { QUATERNIUS_NATURE_ROOT } from '@/components/world/QuaterniusForest';
import { terrainHeightAt } from '@/components/world/archiveTerrainMath';
import {
  WORLD_FORAGE_PATCHES,
  type WorldForageKind,
} from '@/components/world/archiveWorldForage';

const FORAGE_ASSETS: Record<WorldForageKind, { file: string; scale: number }> = {
  clover: { file: 'Clover_2.gltf', scale: 0.52 },
  mushroom: { file: 'Mushroom_Common.gltf', scale: 0.46 },
  herb: { file: 'Plant_7_Big.gltf', scale: 0.42 },
};

const CLUSTER_OFFSETS = [
  [0, 0, 0], [0.72, 0.28, 0.45], [-0.64, -0.32, 0.38],
  [0.38, 0.7, -0.52], [-0.75, 0.95, -0.4],
] as const;

export default function ArchiveForagePatches({ collectedIds }: { collectedIds: string[] }) {
  const transforms = useMemo(() => {
    const collected = new Set(collectedIds);
    const groups = new Map<WorldForageKind, Matrix4[]>();
    WORLD_FORAGE_PATCHES.filter((patch) => !collected.has(patch.id)).forEach((patch, patchIndex) => {
      const asset = FORAGE_ASSETS[patch.kind];
      const matrices = groups.get(patch.kind) ?? [];
      CLUSTER_OFFSETS.forEach(([dx, rotation, dz], index) => {
        const x = patch.position[0] + dx;
        const z = patch.position[1] + dz;
        const scale = asset.scale * (0.86 + (index % 3) * 0.12);
        matrices.push(new Matrix4().compose(
          new Vector3(x, terrainHeightAt(x, z) + 0.02, z),
          new Quaternion().setFromEuler(new Euler(0, rotation + patchIndex * 0.7, 0)),
          new Vector3(scale, scale, scale),
        ));
      });
      groups.set(patch.kind, matrices);
    });
    return groups;
  }, [collectedIds]);

  return (
    <group name="quaternius-daily-forage-patches">
      {(Object.keys(FORAGE_ASSETS) as WorldForageKind[]).map((kind) => {
        const matrices = transforms.get(kind) ?? [];
        if (!matrices.length) return null;
        return (
          <InstancedAsset
            key={kind}
            src={`${QUATERNIUS_NATURE_ROOT}/${FORAGE_ASSETS[kind].file}`}
            transforms={matrices}
          />
        );
      })}
    </group>
  );
}
