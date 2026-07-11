'use client';

import { useState, useEffect, useRef } from 'react';
import type { ReadmeData } from '@/types';
import type { LayoutConfig, BlockConfig } from '@/types/layout';
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
import EducationBlock from '@/components/blocks/EducationBlock';
import WorkBlock from '@/components/blocks/WorkBlock';
import ProductsBlock from '@/components/blocks/ProductsBlock';
import CreationBlock from '@/components/blocks/CreationBlock';
import HiphopBlock from '@/components/blocks/HiphopBlock';
import EventsBlock from '@/components/blocks/EventsBlock';
import TagsBlock from '@/components/blocks/TagsBlock';
import SkillsBlock from '@/components/blocks/SkillsBlock';
import DevToolsBlock from '@/components/blocks/DevToolsBlock';
import { Reorder } from 'framer-motion';
import {
  GripVertical,
  Eye,
  EyeOff,
  Columns,
  Square,
  ArrowUp,
  ArrowDown,
  Save,
  RotateCcw,
  Check,
  Loader2,
  Sparkles,
  Layers,
  Palette,
} from 'lucide-react';
import { DEFAULT_LAYOUT_CONFIG } from '@/lib/content/default-layout';
import { getBlockTitle } from '@/lib/blocks/registry';

const THEMES = [
  { id: 'green', name: '翠绿 (Green)', previewBg: 'linear-gradient(135deg, #22c55e, #14b8a6)' },
  { id: 'red', name: '红粉 (Red-Pink)', previewBg: 'linear-gradient(135deg, #fb7185, #ec4899)' },
  { id: 'orange', name: '橙黄 (Orange-Yellow)', previewBg: 'linear-gradient(135deg, #fbbf24, #f97316)' },
  { id: 'blue', name: '天蓝 (Sky Blue)', previewBg: 'linear-gradient(135deg, #38bdf8, #3b82f6)' },
  { id: 'gray', name: '黑灰 (Black-Gray)', previewBg: 'linear-gradient(135deg, #9ca3af, #4b5563)' },
] as const;


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

  useEffect(() => {
    const currentTheme = layoutConfig.theme || 'green';
    document.documentElement.setAttribute('data-color-theme', currentTheme);
    window.dispatchEvent(new CustomEvent('color-theme-changed', { detail: { theme: currentTheme } }));
  }, [layoutConfig.theme]);

  const handleThemeChange = (newTheme: typeof THEMES[number]['id']) => {
    setLayoutConfig((prev) => {
      const nextConfig: LayoutConfig = { ...prev, theme: newTheme };
      document.documentElement.setAttribute('data-color-theme', newTheme);
      window.dispatchEvent(new CustomEvent('color-theme-changed', { detail: { theme: newTheme } }));
      autoSave(nextConfig);
      return nextConfig;
    });
  };

  const defaultBookmarks = [
    { id: '1', title: 'GitHub', url: 'https://github.com', icon: '🐙' },
    { id: '2', title: 'Vercel', url: 'https://vercel.com', icon: '▲' },
    { id: '3', title: 'Supabase', url: 'https://supabase.com', icon: '⚡' },
    { id: '4', title: 'Antigravity CLI', url: 'https://deepmind.google', icon: '🤖' },
  ];


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

  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const autoSave = (newConfig: LayoutConfig) => {
    if (!onSave) return;
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }
    autoSaveTimeoutRef.current = setTimeout(async () => {
      try {
        setSaving(true);
        await onSave(newConfig);
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 2000);
      } catch (e) {
        console.error('Failed to auto save layout:', e);
      } finally {
        setSaving(false);
      }
    }, 800);
  };

  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, []);

  const handleToggleVisibility = (blockId: string) => {
    setLayoutConfig((prev) => {
      const nextBlocks: BlockConfig[] = prev.blocks.map((b) => (b.id === blockId ? { ...b, visible: !b.visible } : b));
      const nextConfig: LayoutConfig = { ...prev, blocks: nextBlocks };
      autoSave(nextConfig);
      return nextConfig;
    });
  };

  const handleToggleColSpan = (blockId: string) => {
    setLayoutConfig((prev) => {
      const nextBlocks: BlockConfig[] = prev.blocks.map((b) =>
        b.id === blockId ? { ...b, colSpan: (b.colSpan === 2 ? 1 : 2) as (1 | 2) } : b
      );
      const nextConfig: LayoutConfig = { ...prev, blocks: nextBlocks };
      autoSave(nextConfig);
      return nextConfig;
    });
  };

  const handleMoveBlock = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= layoutConfig.blocks.length) return;

    const nextBlocks = [...layoutConfig.blocks];
    const temp = nextBlocks[index];
    nextBlocks[index] = nextBlocks[targetIndex];
    nextBlocks[targetIndex] = temp;

    setLayoutConfig((prev) => {
      const nextConfig: LayoutConfig = { ...prev, blocks: nextBlocks };
      autoSave(nextConfig);
      return nextConfig;
    });
  };

  const handleReorderBlocks = (newBlocks: BlockConfig[]) => {
    setLayoutConfig((prev) => {
      const nextConfig: LayoutConfig = { ...prev, blocks: newBlocks };
      autoSave(nextConfig);
      return nextConfig;
    });
  };

  const handleResetLayout = () => {
    setLayoutConfig(DEFAULT_LAYOUT_CONFIG);
    autoSave(DEFAULT_LAYOUT_CONFIG);
  };

  const renderBlockContent = (block: BlockConfig) => {
    const title = getBlockTitle(block.blockType);
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
        return <BookmarkBlock items={defaultBookmarks} title={title} />;
      case 'ai_clone':
        return <AiCloneBlock name={data.basic.name} title={title} />;
      case 'app_launcher':
        return <AppLauncherBlock title={title} />;
      case 'projects':
        return <ProjectBlock projects={data.development.projects} title={title} />;
      case 'timeline':
        return <TimelineBlock items={timelineItems} title={title} />;
      case 'music':
        return (
          <MusicBlock
            albums={data.music.albums}
            songs={data.music.songs}
            musicians={data.music.musicians}
            title={title}
            colSpan={block.colSpan}
          />
        );
      case 'movies':
        return (
          <MovieBlock
            films={data.films.films}
            directors={data.films.directors}
            title={title}
            colSpan={block.colSpan}
          />
        );
      case 'books':
        return (
          <BookBlock
            books={data.reading.books}
            authors={data.reading.authors}
            title={title}
            colSpan={block.colSpan}
          />
        );
      case 'friend_links':
        return <FriendLinkBlock items={friendLinks} title={title} />;
      case 'contact':
        return (
          <GlassCard className="p-6 space-y-4">
            <h3 className="font-extrabold text-base text-gray-900 dark:text-white">
              {title}
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              {data.contact.contact_info.map((c, idx) => {
                const isEmail = c.method_name === '邮箱' || c.content.includes('@');
                const isLink = c.content.startsWith('http') || c.method_name === '个人网站';
                return (
                  <div key={idx} className="p-3 rounded-xl bg-white/40 border border-white/20 hover:border-teal-500/30 transition">
                    <div className="text-[10px] text-gray-400 font-mono">{c.method_name}</div>
                    {isEmail ? (
                      <a href={`mailto:${c.content}`} className="font-bold text-teal-600 dark:text-teal-400 hover:underline mt-1 block">
                        {c.content}
                      </a>
                    ) : isLink ? (
                      <a href={c.content} target="_blank" rel="noopener noreferrer" className="font-bold text-teal-600 dark:text-teal-400 hover:underline mt-1 block truncate">
                        {c.content}
                      </a>
                    ) : (
                      <div className="font-bold text-gray-800 dark:text-gray-200 mt-1">{c.content}</div>
                    )}
                  </div>
                );
              })}
            </div>
          </GlassCard>
        );
      case 'education':
        return (
          <EducationBlock
            schools={data.education.schools}
            undergraduateMajor={data.education.undergraduate_major}
            undergraduateAdvisor={data.education.undergraduate_advisor}
            title={title}
            colSpan={block.colSpan}
          />
        );
      case 'work':
        return (
          <WorkBlock
            currentJob={data.work.current_job}
            jobs={data.work.jobs}
            workPreferences={data.work.work_preferences}
            title={title}
            colSpan={block.colSpan}
          />
        );
      case 'products':
        return (
          <ProductsBlock
            favoriteProducts={data.products.favorite_products}
            recommendedProducts={data.products.recommended_products}
            myHardware={data.products.my_hardware}
            favoriteBrands={data.products.favorite_brands}
            title={title}
            colSpan={block.colSpan}
          />
        );
      case 'creation':
        return (
          <CreationBlock
            videos={data.creation.videos}
            articles={data.creation.articles}
            speeches={data.creation.speeches}
            mottos={data.creation.mottos}
            quotes={data.creation.quotes}
            title={title}
            colSpan={block.colSpan}
          />
        );
      case 'hiphop':
        return (
          <HiphopBlock
            albums={data.hiphop.albums}
            songs={data.hiphop.songs}
            musicians={data.hiphop.musicians}
            title={title}
            colSpan={block.colSpan}
          />
        );
      case 'events':
        return (
          <EventsBlock
            performances={data.events.performances}
            title={title}
            colSpan={block.colSpan}
          />
        );
      case 'tags':
        return (
          <TagsBlock
            keywords={data.basic.keywords}
            values={data.basic.values}
            tags={data.basic.tags}
            habits={data.life.habits}
            workPreferences={data.work.work_preferences}
            techStack={data.development.skills.tech_stack}
            expertise={data.development.skills.expertise}
            title={title}
            colSpan={block.colSpan}
          />
        );
      case 'skills':
        return (
          <SkillsBlock
            techStack={data.development.skills.tech_stack}
            expertise={data.development.skills.expertise}
            title={title}
            colSpan={block.colSpan}
          />
        );
      case 'dev_tools':
        return (
          <DevToolsBlock
            devTools={data.development.dev_tools}
            title={title}
            colSpan={block.colSpan}
          />
        );
      default:
        return null;
    }
  };

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
              <div id={block.sectionId || block.id}>{renderBlockContent(block)}</div>
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
                <span>共 {layoutConfig.blocks.length} 个</span>
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
                const isActive = (layoutConfig.theme || 'green') === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => handleThemeChange(t.id)}
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
            values={layoutConfig.blocks}
            onReorder={handleReorderBlocks}
            className="space-y-2 flex-1 overflow-y-auto pr-1 scrollbar-none max-h-[50vh] lg:max-h-none"
          >
            {layoutConfig.blocks.map((block, index) => (
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
                  onClick={() => handleToggleVisibility(block.id)}
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
      </div>

        {/* 右侧大画板主区域 */}
        <div className="flex-1 min-w-0 w-full">
          <Reorder.Group
            axis="y"
            values={layoutConfig.blocks}
            onReorder={handleReorderBlocks}
            className="space-y-4"
          >
            {layoutConfig.blocks.map((block, index) => {
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
                        onClick={() => handleMoveBlock(index, 'up')}
                        disabled={index === 0}
                        className="p-1 rounded hover:bg-white/20 text-gray-300 disabled:opacity-30 transition cursor-pointer"
                        title="上移"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleMoveBlock(index, 'down')}
                        disabled={index === layoutConfig.blocks.length - 1}
                        className="p-1 rounded hover:bg-white/20 text-gray-300 disabled:opacity-30 transition cursor-pointer"
                        title="下移"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>

                      {/* ColSpan Toggle button */}
                      <button
                        onClick={() => handleToggleColSpan(block.id)}
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
                        onClick={() => handleToggleVisibility(block.id)}
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
                    <div id={block.sectionId || block.id}>{renderBlockContent(block)}</div>
                  </div>
                </Reorder.Item>
              );
            })}
          </Reorder.Group>
        </div>
      </div>
  );
}

