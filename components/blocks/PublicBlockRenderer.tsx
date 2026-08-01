'use client';

import dynamic from 'next/dynamic';
import type { ReadmeData } from '@/types';
import type { LayoutConfig } from '@/types/layout';

const ArchiveWorld = dynamic(() => import('@/components/world/ArchiveWorld'), {
  ssr: false,
  loading: () => (
    <div className="archive-world-loading">
      <span />
      <p>正在生成绿迹世界坐标……</p>
    </div>
  ),
});

interface PublicBlockRendererProps {
  data: ReadmeData;
  layoutConfig?: LayoutConfig;
}

export default function PublicBlockRenderer({ data, layoutConfig }: PublicBlockRendererProps) {
  return <ArchiveWorld data={data} layoutConfig={layoutConfig} />;
}
