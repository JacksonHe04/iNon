'use client';

import type { ReadmeData } from '@/types';
import type { LayoutConfig, BlockConfig } from '@/types/layout';
import BlockRenderer from './BlockRenderer';
import LayoutSidebar from './LayoutSidebar';
import EditableBlockWrapper from './EditableBlockWrapper';
import useBlockLayout from '@/hooks/useBlockLayout';
import { Reorder } from 'framer-motion';
import { DEFAULT_LAYOUT_CONFIG } from '@/lib/content/default-layout';

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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {activeBlocks.map((block) => {
          const isFullWidth = block.colSpan === 2;
          return (
            <div
              key={block.id}
              className={`relative transition-all duration-300 ${
                isFullWidth ? 'col-span-1 md:col-span-2' : 'col-span-1'
              }`}
            >
              <div id={block.sectionId || block.id}>
                <BlockRenderer block={block} data={data} />
              </div>
            </div>
          );
        })}
      </div>
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
                <BlockRenderer block={block} data={data} />
              </div>
            </EditableBlockWrapper>
          ))}
        </Reorder.Group>
      </div>
    </div>
  );
}
