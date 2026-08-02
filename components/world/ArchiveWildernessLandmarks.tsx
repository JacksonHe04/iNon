'use client';

import { TintedGltfAsset } from '@/components/world/ArchiveAsset';
import ArchiveMountainExpedition from '@/components/world/ArchiveMountainExpedition';
import {
  WATER_LEVEL,
  WORLD_TIDAL_COVE_POSITION,
} from '@/components/world/archiveWorldConstants';

const ROOT = '/archive-world/quaternius-survival';

function TidalRaft() {
  const [, , coveZ] = WORLD_TIDAL_COVE_POSITION;
  const raftX = -45;
  const raftZ = coveZ - 1;
  return (
    <group name="tidal-cove-raft">
      <TintedGltfAsset src={`${ROOT}/Raft.glb`} position={[raftX, WATER_LEVEL + 0.36, raftZ]} scale={0.26} rotation={[0, 0.16, 0]} />
      <TintedGltfAsset src={`${ROOT}/RaftPaddle.glb`} position={[raftX, WATER_LEVEL + 0.5, raftZ]} scale={0.24} rotation={[0, 1.3, 0]} />
    </group>
  );
}

export default function ArchiveWildernessLandmarks() {
  return (
    <group name="archive-wilderness-landmarks">
      <ArchiveMountainExpedition />
      <TidalRaft />
    </group>
  );
}
