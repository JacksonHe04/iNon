import React from 'react';
import { Reorder } from 'framer-motion';
import { GripVertical, ArrowUp, ArrowDown, Square, Columns, Eye, EyeOff } from 'lucide-react';
import type { BlockConfig } from '@/types/layout';
import { getBlockTitle } from '@/lib/blocks/registry';

interface EditableBlockWrapperProps {
  block: BlockConfig;
  index: number;
  totalBlocks: number;
  children: React.ReactNode;
  onMoveBlock: (index: number, direction: 'up' | 'down') => void;
  onToggleColSpan: (blockId: string) => void;
  onToggleVisibility: (blockId: string) => void;
}

export function EditableBlockWrapper({
  block,
  index,
  totalBlocks,
  children,
  onMoveBlock,
  onToggleColSpan,
  onToggleVisibility,
}: EditableBlockWrapperProps) {
  const isFullWidth = block.colSpan === 2;

  return (
    <Reorder.Item
      key={block.id}
      value={block}
      className={`relative rounded-2xl border-2 transition-shadow select-none ${
        block.visible
          ? 'border-teal-500/40 hover:border-teal-400 bg-white/20 dark:bg-black/20 shadow-sm'
          : 'border-dashed border-gray-400/40 opacity-60 bg-gray-500/5'
      }`}
    >
      {/* Controls Bar in Edit Mode */}
      <div className="flex items-center justify-between bg-gray-900/90 text-white px-3 py-2 rounded-t-xl text-xs font-semibold backdrop-blur-md">
        <div className="flex items-center gap-2 cursor-grab active:cursor-grabbing">
          <GripVertical className="w-4 h-4 text-teal-400 shrink-0" />
          <span className="font-mono text-[11px] text-teal-300">#{index + 1}</span>
          <span className="truncate max-w-[200px] font-bold">{getBlockTitle(block.blockType)}</span>
        </div>

        <div className="flex items-center gap-1">
          {/* Up / Down Reorder buttons */}
          <button
            onClick={() => onMoveBlock(index, 'up')}
            disabled={index === 0}
            className="p-1 rounded hover:bg-white/20 text-gray-300 disabled:opacity-30 transition cursor-pointer"
            title="上移"
          >
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onMoveBlock(index, 'down')}
            disabled={index === totalBlocks - 1}
            className="p-1 rounded hover:bg-white/20 text-gray-300 disabled:opacity-30 transition cursor-pointer"
            title="下移"
          >
            <ArrowDown className="w-3.5 h-3.5" />
          </button>

          {/* ColSpan Toggle button */}
          <button
            onClick={() => onToggleColSpan(block.id)}
            className="flex items-center gap-1 px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 text-[10px] font-mono transition ml-1 cursor-pointer"
            title="切换宽度 (50% / 100%)"
          >
            {isFullWidth ? (
              <>
                <Square className="w-3 h-3 text-emerald-400" />
                <span>全宽 100%</span>
              </>
            ) : (
              <>
                <Columns className="w-3 h-3 text-purple-400" />
                <span>半宽 50%</span>
              </>
            )}
          </button>

          {/* Visibility Toggle button */}
          <button
            onClick={() => onToggleVisibility(block.id)}
            className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold transition ml-1 cursor-pointer ${
              block.visible
                ? 'bg-teal-500/30 text-teal-300 border border-teal-400/40'
                : 'bg-rose-500/30 text-rose-300 border border-rose-400/40'
            }`}
            title="显示/隐藏此 Block"
          >
            {block.visible ? (
              <>
                <Eye className="w-3 h-3" />
                <span>显示</span>
              </>
            ) : (
              <>
                <EyeOff className="w-3 h-3" />
                <span>隐藏</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Block Content Container */}
      <div className="p-3">
        {children}
      </div>
    </Reorder.Item>
  );
}
export default EditableBlockWrapper;
