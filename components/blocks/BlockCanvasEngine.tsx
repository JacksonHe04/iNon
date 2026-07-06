'use client';

import { useState } from 'react';
import type { ReadmeData } from '@/types';
import type { LayoutConfig, BlockConfig, BlockType } from '@/types/layout';
import BioHeaderBlock from '@/components/blocks/BioHeaderBlock';
import BookmarkBlock from '@/components/blocks/BookmarkBlock';
import AiCloneBlock from '@/components/blocks/AiCloneBlock';
import AppLauncherBlock from '@/components/blocks/AppLauncherBlock';
import ProjectBlock from '@/components/blocks/ProjectBlock';
import MusicBlock from '@/components/blocks/MusicBlock';
import MovieBlock from '@/components/blocks/MovieBlock';
import BookBlock from '@/components/blocks/BookBlock';
import GameBlock from '@/components/blocks/GameBlock';
import TimelineBlock from '@/components/blocks/TimelineBlock';
import FriendLinkBlock from '@/components/blocks/FriendLinkBlock';
import ContactBlock from '@/components/blocks/ContactBlock';
import GlassCard from '@/components/GlassCard';
import {
  GripVertical,
  Eye,
  EyeOff,
  Columns,
  Square,
  ArrowUp,
  ArrowDown,
  Plus,
  Save,
  RotateCcw,
  Check,
  Loader2,
  Sparkles,
} from 'lucide-react';
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
  const [layoutConfig, setLayoutConfig] = useState<LayoutConfig>(initialLayoutConfig);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [showAddDrawer, setShowAddDrawer] = useState(false);

  const defaultBookmarks = [
    { id: '1', title: 'GitHub', url: 'https://github.com', icon: '🐙' },
    { id: '2', title: 'Vercel', url: 'https://vercel.com', icon: '▲' },
    { id: '3', title: 'Supabase', url: 'https://supabase.com', icon: '⚡' },
    { id: '4', title: 'Antigravity CLI', url: 'https://deepmind.google', icon: '🤖' },
  ];

  const musicItems = data.music.albums.map((a, i) => ({
    id: String(i),
    name: a.name,
    artist: a.artist,
    link: a.link,
    comment: a.comment,
  }));

  const movieItems = data.films.films.map((f, i) => ({
    id: String(i),
    name: f.name,
    director: f.director,
    country: f.country,
    link: f.link,
    comment: f.comment,
  }));

  const bookItems = data.reading.books.map((b, i) => ({
    id: String(i),
    name: b.name,
    author: b.author,
    country: b.country,
    link: b.link,
    comment: b.comment,
  }));

  const timelineItems = data.experience.experience.map((e, i) => ({
    id: String(i),
    date: e.date,
    city: e.city,
    description: e.description,
  }));

  const friendLinks = (data.contact.platform_accounts || []).map((acc, i) => ({
    id: String(i),
    name: acc.platform_name,
    link: acc.homepage_link,
  }));

  const handleToggleVisibility = (blockId: string) => {
    setLayoutConfig((prev) => ({
      ...prev,
      blocks: prev.blocks.map((b) => (b.id === blockId ? { ...b, visible: !b.visible } : b)),
    }));
  };

  const handleToggleColSpan = (blockId: string) => {
    setLayoutConfig((prev) => ({
      ...prev,
      blocks: prev.blocks.map((b) =>
        b.id === blockId ? { ...b, colSpan: b.colSpan === 2 ? 1 : 2 } : b
      ),
    }));
  };

  const handleMoveBlock = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= layoutConfig.blocks.length) return;

    const nextBlocks = [...layoutConfig.blocks];
    const temp = nextBlocks[index];
    nextBlocks[index] = nextBlocks[targetIndex];
    nextBlocks[targetIndex] = temp;

    setLayoutConfig((prev) => ({
      ...prev,
      blocks: nextBlocks,
    }));
  };

  const handleResetLayout = () => {
    setLayoutConfig(DEFAULT_LAYOUT_CONFIG);
  };

  const handleSaveLayout = async () => {
    if (!onSave) return;
    try {
      setSaving(true);
      await onSave(layoutConfig);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    } catch (e) {
      console.error('Failed to save layout:', e);
    } finally {
      setSaving(false);
    }
  };

  const renderBlockContent = (block: BlockConfig) => {
    switch (block.blockType) {
      case 'bio':
        return (
          <BioHeaderBlock
            name={data.basic.name}
            intro={data.basic.intro}
            currentStatus={data.basic.current_status}
            currentCity={data.life.current_city}
            mbti={data.life.mbti}
            keywords={data.basic.keywords}
          />
        );
      case 'bookmarks':
        return <BookmarkBlock items={defaultBookmarks} />;
      case 'ai_clone':
        return <AiCloneBlock name={data.basic.name} />;
      case 'app_launcher':
        return <AppLauncherBlock />;
      case 'projects':
        return <ProjectBlock projects={data.development.projects} />;
      case 'timeline':
        return <TimelineBlock items={timelineItems} />;
      case 'music':
        return <MusicBlock items={musicItems} />;
      case 'movies':
        return <MovieBlock items={movieItems} />;
      case 'books':
        return <BookBlock items={bookItems} />;
      case 'friend_links':
        return <FriendLinkBlock items={friendLinks} />;
      case 'contact':
        return (
          <GlassCard className="p-6 space-y-4">
            <h3 className="font-extrabold text-base text-gray-900 dark:text-white">
              📫 联系方式与社交账号
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              {data.contact.contact_info.map((c, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-white/40 border border-white/20">
                  <div className="text-[10px] text-gray-400 font-mono">{c.method_name}</div>
                  <div className="font-bold text-gray-800 dark:text-gray-200 mt-1">{c.content}</div>
                </div>
              ))}
            </div>
          </GlassCard>
        );
      default:
        return null;
    }
  };

  const activeBlocks = mode === 'readonly'
    ? layoutConfig.blocks.filter((b) => b.visible)
    : layoutConfig.blocks;

  return (
    <div className="space-y-6">
      {/* Editor Top Toolbar */}
      {mode === 'edit' && (
        <GlassCard className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-teal-500/30 bg-teal-500/5">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-teal-500" />
            <div>
              <h2 className="font-bold text-sm text-gray-900 dark:text-white">
                公开页 Block 画布排版配置器
              </h2>
              <p className="text-[11px] text-gray-500">
                可自由调整 Block 位置顺序、隐藏/显示、单双栏宽度 (50%/100%)，与公开页即时闭环。
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleResetLayout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-200 text-xs font-semibold hover:bg-gray-300 transition"
              title="重置为默认结构"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>重置默认</span>
            </button>

            <button
              onClick={handleSaveLayout}
              disabled={saving}
              className="flex items-center gap-1.5 px-5 py-1.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 text-white text-xs font-bold shadow-md hover:opacity-90 transition disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>保存中...</span>
                </>
              ) : savedSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>排版已保存！</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>保存画板排版</span>
                </>
              )}
            </button>
          </div>
        </GlassCard>
      )}

      {/* Grid Canvas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {activeBlocks.map((block, index) => {
          const isFullWidth = block.colSpan === 2;

          return (
            <div
              key={block.id}
              className={`relative transition-all duration-300 ${
                isFullWidth ? 'col-span-1 md:col-span-2' : 'col-span-1'
              } ${
                mode === 'edit'
                  ? `p-2 rounded-2xl border-2 transition ${
                      block.visible
                        ? 'border-teal-500/40 hover:border-teal-400 bg-white/20 dark:bg-black/20'
                        : 'border-dashed border-gray-400/40 opacity-50 bg-gray-500/5'
                    }`
                  : ''
              }`}
            >
              {/* Controls Overlay in Edit Mode */}
              {mode === 'edit' && (
                <div className="flex items-center justify-between bg-gray-900/90 text-white px-3 py-1.5 rounded-xl text-xs font-semibold mb-2 shadow-lg backdrop-blur-md">
                  <div className="flex items-center gap-2">
                    <GripVertical className="w-4 h-4 text-teal-400 cursor-grab" />
                    <span className="font-mono text-[11px] text-teal-300">#{index + 1}</span>
                    <span className="truncate max-w-[180px]">{block.title}</span>
                  </div>

                  <div className="flex items-center gap-1">
                    {/* Up / Down Reorder buttons */}
                    <button
                      onClick={() => handleMoveBlock(index, 'up')}
                      disabled={index === 0}
                      className="p-1 rounded hover:bg-white/20 text-gray-300 disabled:opacity-30 transition"
                      title="上移"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleMoveBlock(index, 'down')}
                      disabled={index === activeBlocks.length - 1}
                      className="p-1 rounded hover:bg-white/20 text-gray-300 disabled:opacity-30 transition"
                      title="下移"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>

                    {/* ColSpan Toggle button */}
                    <button
                      onClick={() => handleToggleColSpan(block.id)}
                      className="flex items-center gap-1 px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 text-[10px] font-mono transition ml-1"
                      title="切换宽度 (50% / 100%)"
                    >
                      {block.colSpan === 2 ? (
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
                      onClick={() => handleToggleVisibility(block.id)}
                      className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold transition ml-1 ${
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
              )}

              {/* Render Actual Block Component */}
              <div id={block.sectionId || block.id}>{renderBlockContent(block)}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
