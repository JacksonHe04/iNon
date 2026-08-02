'use client';

import ArchiveMountainExpedition from '@/components/world/ArchiveMountainExpedition';
import ArchiveTidalCove from '@/components/world/ArchiveTidalCove';

export default function ArchiveWildernessLandmarks() {
  return (
    <group name="archive-wilderness-landmarks">
      <ArchiveMountainExpedition />
      <ArchiveTidalCove />
    </group>
  );
}
