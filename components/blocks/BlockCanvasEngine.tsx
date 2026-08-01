'use client';

import type { ReadmeData } from '@/types';
import type { LayoutConfig, BlockConfig } from '@/types/layout';
import BlockRenderer from './BlockRenderer';
import LayoutSidebar from './LayoutSidebar';
import EditableBlockWrapper from './EditableBlockWrapper';
import useBlockLayout from '@/hooks/useBlockLayout';
import { Reorder } from 'framer-motion';
import { DEFAULT_LAYOUT_CONFIG } from '@/lib/content/default-layout';
import ArchiveBlockFrame from '@/components/archive/ArchiveBlockFrame';

interface BlockCanvasEngineProps {
  data: ReadmeData;
  initialLayoutConfig?: LayoutConfig;
  mode?: 'edit' | 'readonly';
  onSave?: (config: LayoutConfig) => Promise<void>;
}

export default function BlockCanvasEngine({
  data,
  initialLayoutConfig = DEFAULT_LAYOUT_CONFIG,
  mode = 'readonly',
  onSave,
}: BlockCanvasEngineProps) {
  const {
    layoutConfig,
    saving,
    savedSuccess,
    handleThemeChange,
    handleToggleVisibility,
    handleToggleColSpan,
    handleMoveBlock,
    handleReorderBlocks,
  } = useBlockLayout({ initialLayoutConfig, onSave });

  const activeBlocks = mode === 'readonly'
    ? layoutConfig.blocks.filter((b) => b.visible)
    : layoutConfig.blocks;

  if (mode === 'readonly') {
    return (
      <section className="archive-block-grid" aria-label="个人档案目录">
        <header className="archive-block-grid__prologue">
          <div>
            <p className="archive-kicker">Collected fragments · private field catalogue</p>
            <h2>个人档案索引</h2>
          </div>
          <p>
            <strong>{String(activeBlocks.length).padStart(2, '0')}</strong>
            份记录沿着时间、兴趣与创造彼此交叠。
          </p>
        </header>
        {activeBlocks.map((block, index) => {
          const isFullWidth = block.colSpan === 2;
          return (
            <ArchiveBlockFrame
              key={block.id}
              blockType={block.blockType}
              index={index}
              isWide={isFullWidth}
              id={block.sectionId || block.id}
            >
              <BlockRenderer block={block} data={data} />
            </ArchiveBlockFrame>
          );
        })}
      </section>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6 items-start w-full">
      {/* 左侧竖直 Block 目录列表 */}
      <div className="w-full lg:w-72 shrink-0 lg:sticky lg:top-24 z-20">
        <LayoutSidebar
          blocks={layoutConfig.blocks}
          currentTheme={layoutConfig.theme || 'green'}
          saving={saving}
          savedSuccess={savedSuccess}
          onThemeChange={handleThemeChange}
          onToggleVisibility={handleToggleVisibility}
          onReorderBlocks={handleReorderBlocks}
        />
      </div>

      {/* 右侧大画板主区域 */}
      <div className="flex-1 min-w-0 w-full">
        <Reorder.Group
          axis="y"
          values={layoutConfig.blocks}
          onReorder={handleReorderBlocks}
          className="space-y-4"
        >
          {layoutConfig.blocks.map((block, index) => (
            <EditableBlockWrapper
              key={block.id}
              block={block}
              index={index}
              totalBlocks={layoutConfig.blocks.length}
              onMoveBlock={handleMoveBlock}
              onToggleColSpan={handleToggleColSpan}
              onToggleVisibility={handleToggleVisibility}
            >
              <div id={block.sectionId || block.id}>
                <BlockRenderer block={block} data={data} mode="edit" />
              </div>
            </EditableBlockWrapper>
          ))}
        </Reorder.Group>
      </div>
    </div>
  );
}
