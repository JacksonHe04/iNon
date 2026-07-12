'use client';

import type { ReadmeData } from '@/types';
import type { LayoutConfig } from '@/types/layout';
import BlockCanvasEngine from '@/components/blocks/BlockCanvasEngine';
import FooterSection from '@/components/sections/FooterSection';
import DeepWaterSection from '@/components/sections/DeepWaterSection';

interface PublicBlockRendererProps {
  data: ReadmeData;
  layoutConfig?: LayoutConfig;
}

export default function PublicBlockRenderer({ data, layoutConfig }: PublicBlockRendererProps) {
  return (
    <div className="space-y-8 animate-fadeIn max-w-7xl mx-auto">
      {/* Dynamic Non Block Canvas Layout Engine (Readonly Mode) */}
      <BlockCanvasEngine
        data={data}
        initialLayoutConfig={layoutConfig}
        mode="readonly"
      />

      {/* Interactive Footer & DeepWater Sections */}
      <FooterSection data={data} />
      <DeepWaterSection data={data.thoughts} />
    </div>
  );
}
