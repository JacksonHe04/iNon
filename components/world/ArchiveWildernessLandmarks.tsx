'use client';

import { lazy } from 'react';

const ArchiveMountainExpedition = lazy(() => import('@/components/world/ArchiveMountainExpedition'));
const ArchiveTidalCove = lazy(() => import('@/components/world/ArchiveTidalCove'));

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
