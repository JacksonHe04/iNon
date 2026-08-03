'use client';

import { useState } from 'react';
import GlassCard from '@/components/GlassCard';
import { PenTool, Video, FileText, Mic, BookOpen, Quote, Eye, EyeOff } from 'lucide-react';
import CreationGalaxy from '@/components/scenes/CreationGalaxy';
import VideoGrid from './creation/VideoGrid';
import type { VideoItem } from './creation/VideoGrid';
import ArticleGrid from './creation/ArticleGrid';
import type { ArticleItem } from './creation/ArticleGrid';
import SpeechGrid from './creation/SpeechGrid';
import type { SpeechItem } from './creation/SpeechGrid';
import MottoAndQuoteGrid from './creation/MottoAndQuoteGrid';

interface CreationBlockProps {
  videos: VideoItem[];
  articles: ArticleItem[];
  speeches: SpeechItem[];
  mottos: string[];
  quotes: string[];
  title?: string;
  colSpan?: number;
}

const categoryOrder = [
  { id: 'videos', label: '视频', icon: Video },
  { id: 'articles', label: '文章', icon: FileText },
  { id: 'speeches', label: '演讲', icon: Mic },
  { id: 'mottos', label: '座右铭', icon: BookOpen },
  { id: 'quotes', label: '语录', icon: Quote },
] as const;

export default function CreationBlock({
  videos,
  articles,
  speeches,
  mottos,
  quotes,
  title,
  colSpan = 2,
}: CreationBlockProps) {
  const [activeCategory, setActiveCategory] = useState<string>('videos');
  const [showScene, setShowScene] = useState(true);

  const getCount = (catId: string) => {
    switch (catId) {
      case 'videos':
        return videos.length;
      case 'articles':
        return articles.length;
      case 'speeches':
        return speeches.length;
      case 'mottos':
        return mottos.length;
      case 'quotes':
        return quotes.length;
      default:
        return 0;
    }
  };

  return (
    <GlassCard className="p-5 space-y-5 hover:border-purple-400/40 transition-all duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400">
            <PenTool className="w-5 h-5" />
          </div>
          <div>
            {title && <h3 className="font-bold text-base text-gray-900 dark:text-white">{title}</h3>}
          </div>
        </div>
        <div className="flex items-center gap-2 self-end sm:self-auto">
          {colSpan === 2 && (
            <button
              onClick={() => setShowScene(!showScene)}
              className="flex items-center gap-1 px-2.5 py-1 text-xs rounded-xl bg-white/40 dark:bg-gray-800/40 border border-white/20 hover:bg-white/60 dark:hover:bg-gray-800/60 text-gray-600 dark:text-gray-300 font-medium transition"
            >
              {showScene ? (
                <>
                  <EyeOff className="w-3.5 h-3.5" />
                  <span>隐藏星系</span>
                </>
              ) : (
                <>
                  <Eye className="w-3.5 h-3.5" />
                  <span>显示星系</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {colSpan === 2 && showScene && (
        <div className="archive-embedded-field-panel">
          <CreationGalaxy
            activeCategory={activeCategory}
            categories={categoryOrder.map((c) => ({ id: c.id, label: c.label }))}
            onChange={setActiveCategory}
          />
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-1.5 border-b border-white/10 pb-1 overflow-x-auto whitespace-nowrap scrollbar-none">
        {categoryOrder.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
                isActive
                  ? 'bg-purple-500/10 border-purple-500/30 text-purple-600 dark:text-purple-400'
                  : 'bg-transparent border-transparent text-gray-500 hover:text-gray-800 hover:bg-white/20 dark:hover:bg-gray-800/20'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{cat.label}</span>
              <span className="text-[10px] font-mono opacity-70">({getCount(cat.id)})</span>
            </button>
          );
        })}
      </div>

      {/* Category Content */}
      <div className="space-y-3 min-h-[160px]">
        {activeCategory === 'videos' && (
          <VideoGrid videos={videos} colSpan={colSpan} />
        )}

        {activeCategory === 'articles' && (
          <ArticleGrid articles={articles} />
        )}

        {activeCategory === 'speeches' && (
          <SpeechGrid speeches={speeches} />
        )}

        {activeCategory === 'mottos' && (
          <MottoAndQuoteGrid items={mottos} />
        )}

        {activeCategory === 'quotes' && (
          <MottoAndQuoteGrid items={quotes} />
        )}
      </div>
    </GlassCard>
  );
}
export type { VideoItem, ArticleItem, SpeechItem };
