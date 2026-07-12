'use client';

import BlockCanvasEngine from '@/components/blocks/BlockCanvasEngine';
import { GlassCardContext } from '@/components/GlassCard';
import type { ReadmeData } from '@/types';
import type { LayoutConfig } from '@/types/layout';

interface WebsiteCanvasClientProps {
  data: ReadmeData;
  layoutConfig: LayoutConfig;
}

export default function WebsiteCanvasClient({ data, layoutConfig }: WebsiteCanvasClientProps) {
  return (
    <div className="space-y-6 animate-fadeIn">
      <GlassCardContext.Provider value={{ hoverEnabled: false }}>
        <BlockCanvasEngine
          data={data}
          mode="edit"
          initialLayoutConfig={layoutConfig}
          onSave={async (newLayoutConfig: LayoutConfig) => {
            const res = await fetch('/api/account/layout', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ layoutConfig: newLayoutConfig }),
            });
            if (!res.ok) {
              const errData = await res.json();
              throw new Error(errData.error || '保存排版方案失败');
            }
          }}
        />
      </GlassCardContext.Provider>
    </div>
  );
}
