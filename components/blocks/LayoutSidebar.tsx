import React from 'react';
import { Reorder } from 'framer-motion';
import { Layers, Palette, Check, GripVertical, Eye, EyeOff } from 'lucide-react';
import type { BlockConfig } from '@/types/layout';
import { getBlockTitle } from '@/lib/blocks/registry';

const THEMES = [
  { id: 'green', name: '翠绿 (Green)', previewBg: 'linear-gradient(135deg, #22c55e, #14b8a6)' },
  { id: 'red', name: '红粉 (Red-Pink)', previewBg: 'linear-gradient(135deg, #fb7185, #ec4899)' },
  { id: 'orange', name: '橙黄 (Orange-Yellow)', previewBg: 'linear-gradient(135deg, #fbbf24, #f97316)' },
  { id: 'blue', name: '天蓝 (Sky Blue)', previewBg: 'linear-gradient(135deg, #38bdf8, #3b82f6)' },
  { id: 'gray', name: '黑灰 (Black-Gray)', previewBg: 'linear-gradient(135deg, #9ca3af, #4b5563)' },
] as const;

interface LayoutSidebarProps {
  blocks: BlockConfig[];
  currentTheme: 'green' | 'red' | 'orange' | 'blue' | 'gray';
  saving: boolean;
  savedSuccess: boolean;
  onThemeChange: (theme: 'green' | 'red' | 'orange' | 'blue' | 'gray') => void;
  onToggleVisibility: (blockId: string) => void;
  onReorderBlocks: (newBlocks: BlockConfig[]) => void;
}

export function LayoutSidebar({
  blocks,
  currentTheme,
  saving,
  savedSuccess,
  onThemeChange,
  onToggleVisibility,
  onReorderBlocks,
}: LayoutSidebarProps) {
  return (
    <div className="rounded-2xl border border-white/20 bg-white/10 dark:bg-black/10 p-4 space-y-4 backdrop-blur-md flex flex-col h-auto lg:h-[calc(100vh-140px)]">
      <div className="flex items-center justify-between border-b border-white/10 pb-2">
        <span className="font-extrabold text-xs text-gray-900 dark:text-white flex items-center gap-1.5">
          <Layers className="w-4 h-4 text-teal-500" />
          Block 目录排版
        </span>
        <span className="text-[10px] text-gray-400 font-mono">
          {saving ? (
            <span className="text-teal-500 animate-pulse">● 正在保存...</span>
          ) : savedSuccess ? (
            <span className="text-emerald-500">✓ 已保存</span>
          ) : (
            <span>共 {blocks.length} 个</span>
          )}
        </span>
      </div>
      
      {/* 主题配色选择 */}
      <div className="border-b border-white/10 pb-3.5 space-y-2">
        <span className="font-extrabold text-xs text-gray-900 dark:text-white flex items-center gap-1.5">
          <Palette className="w-4 h-4 text-teal-500" />
          个性化主题配色
        </span>
        <div className="flex flex-wrap gap-2 pt-1">
          {THEMES.map((t) => {
            const isActive = currentTheme === t.id;
            return (
              <button
                key={t.id}
                onClick={() => onThemeChange(t.id)}
                className={`relative w-8 h-8 rounded-full border-2 transition-all flex items-center justify-center cursor-pointer ${
                  isActive
                    ? 'border-white scale-110 shadow-md ring-2 ring-teal-500/50'
                    : 'border-transparent hover:scale-105'
                }`}
                style={{ background: t.previewBg }}
                title={t.name}
              >
                {isActive && (
                  <Check className="w-3.5 h-3.5 text-white drop-shadow-md" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      <Reorder.Group
        axis="y"
        values={blocks}
        onReorder={onReorderBlocks}
        className="space-y-2 flex-1 overflow-y-auto pr-1 scrollbar-none max-h-[50vh] lg:max-h-none"
      >
        {blocks.map((block, index) => (
          <Reorder.Item
            key={`list-${block.id}`}
            value={block}
            className={`flex items-center justify-between p-2.5 rounded-xl border text-xs transition-colors cursor-grab active:cursor-grabbing select-none ${
              block.visible
                ? 'bg-white/30 dark:bg-gray-800/30 border-teal-500/20 hover:border-teal-500/40 text-gray-800 dark:text-gray-200'
                : 'bg-gray-500/5 border-dashed border-gray-400/20 opacity-60 text-gray-400'
            }`}
          >
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <GripVertical className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <span className="font-mono text-[10px] text-gray-400 shrink-0">#{index + 1}</span>
              <span className="truncate font-semibold">{getBlockTitle(block.blockType)}</span>
            </div>
            
            <button
              onClick={() => onToggleVisibility(block.id)}
              className={`p-1.5 rounded-lg transition ml-2 cursor-pointer shrink-0 ${
                block.visible
                  ? 'text-teal-600 dark:text-teal-400 hover:bg-teal-500/10'
                  : 'text-rose-500 hover:bg-rose-500/10'
              }`}
              title={block.visible ? "隐藏此 Block" : "显示此 Block"}
            >
              {block.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            </button>
          </Reorder.Item>
        ))}
      </Reorder.Group>
    </div>
  );
}
export default LayoutSidebar;
