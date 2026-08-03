import type { ReadmeData } from '@/types';
import type { LayoutConfig } from '@/types/layout';
import PublicExperienceClient from '@/components/blocks/PublicExperienceClient';
import ArchiveCodexPanel from '@/components/world/ArchiveCodexPanel';

interface PublicBlockRendererProps {
  data: ReadmeData;
  layoutConfig?: LayoutConfig;
}

export default function PublicBlockRenderer({ data, layoutConfig }: PublicBlockRendererProps) {
  const config = layoutConfig;
  if (!config) return null;

  return (
    <PublicExperienceClient
      data={data}
      archive={<ArchiveCodexPanel data={data} layoutConfig={config} />}
    />
  );
}
