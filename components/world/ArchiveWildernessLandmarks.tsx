'use client';

import ArchiveMountainExpedition from '@/components/world/ArchiveMountainExpedition';
import ArchiveTidalCove from '@/components/world/ArchiveTidalCove';

export default function ArchiveWildernessLandmarks({
  mountain,
  tidalCove,
}: {
  mountain: boolean;
  tidalCove: boolean;
}) {
  return (
    <group name="archive-wilderness-landmarks">
      {mountain && <ArchiveMountainExpedition />}
      {tidalCove && <ArchiveTidalCove />}
    </group>
  );
}
