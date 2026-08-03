'use client';

import { useEffect } from 'react';
import type { ReadmeData } from '@/types';
import type { LayoutConfig } from '@/types/layout';
import ArchiveCodexPanel from '@/components/world/ArchiveCodexPanel';
import ArchiveDialoguePanel from '@/components/world/ArchiveDialoguePanel';
import ArchiveHomeRecordPanel from '@/components/world/ArchiveHomeRecordPanel';
import ArchiveHomeExhibitPanel from '@/components/world/ArchiveHomeExhibitPanel';
import { exhibitIdFromInspection, type HomeExhibit, type HomeInspectionId, type HomeRecordId } from '@/components/world/archiveHomeRecords';
import type { ArchiveWorldMode } from '@/components/world/archiveWorldConfig';
import type { WorldDialogueContext } from '@/components/world/archiveWorldTelemetry';

export default function ArchiveWorldPanels({
  mode,
  data,
  layoutConfig,
  dialoguePersona,
  dialogueContext,
  homeSelection,
  homeExhibits,
  onCloseHome,
}: {
  mode: ArchiveWorldMode;
  data: ReadmeData;
  layoutConfig: LayoutConfig;
  dialoguePersona: 'owner' | 'companion';
  dialogueContext: WorldDialogueContext;
  homeSelection: HomeInspectionId | null;
  homeExhibits: HomeExhibit[];
  onCloseHome: () => void;
}) {
  const exhibitId = exhibitIdFromInspection(homeSelection);
  const exhibit = exhibitId ? homeExhibits.find((item) => item.id === exhibitId) : null;
  useEffect(() => {
    if (exhibitId && !exhibit) onCloseHome();
  }, [exhibit, exhibitId, onCloseHome]);
  return (
    <>
      {mode === 'archive' && <ArchiveCodexPanel data={data} layoutConfig={layoutConfig} />}
      {mode === 'dialogue' && (
        <ArchiveDialoguePanel data={data} persona={dialoguePersona} worldContext={dialogueContext} />
      )}
      {mode === 'world' && exhibit && (
        <ArchiveHomeExhibitPanel exhibit={exhibit} onClose={onCloseHome} />
      )}
      {mode === 'world' && homeSelection && !exhibitId && (
        <ArchiveHomeRecordPanel data={data} recordId={homeSelection as HomeRecordId} onClose={onCloseHome} />
      )}
    </>
  );
}
