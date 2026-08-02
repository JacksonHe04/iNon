'use client';

import type { ReadmeData } from '@/types';
import type { LayoutConfig } from '@/types/layout';
import BlockCanvasEngine from '@/components/blocks/BlockCanvasEngine';

export default function ArchiveCodexPanel({
  data,
  layoutConfig,
}: {
  data: ReadmeData;
  layoutConfig: LayoutConfig;
}) {
  return (
    <section className="archive-world-codex archive-world-codex--mode" aria-label="完整档案总览">
      <header>
        <div>
          <p className="archive-kicker">ALL RECOVERED RECORDS / READING ROOM</p>
          <h1>完整档案</h1>
        </div>
        <p>保留原有数据结构与收藏卡片，以可检索、可阅读的二维方式呈现。</p>
      </header>
      <div className="archive-world-codex__scroll">
        <BlockCanvasEngine data={data} initialLayoutConfig={layoutConfig} mode="readonly" />
      </div>
    </section>
  );
}
