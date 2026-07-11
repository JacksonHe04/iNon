'use client';

import { useState } from 'react';
import GlassCard from '@/components/GlassCard';
import { PenTool, Video, FileText, Mic, BookOpen, Quote, Eye, EyeOff, ExternalLink } from 'lucide-react';
import CreationGalaxy from '@/components/scenes/CreationGalaxy';
import BlockImage from './BlockImage';

export interface VideoItem {
  series: string;
  title: string;
  video_link: string;
  podcast_link: string;
  image_url?: string;
}

export interface ArticleItem {
  title: string;
  link: string;
  excerpt: string;
  image_url?: string;
}

export interface SpeechItem {
  speech_name: string;
  link: string;
  outline_doc: string;
  presentation_link: string;
  image_url?: string;
}

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
        <div className="relative overflow-hidden rounded-2xl border border-white/20 bg-gradient-to-br from-purple-50/50 to-pink-50/30 dark:from-purple-950/20 dark:to-pink-950/10 p-2">
          <CreationGalaxy
            activeCategory={activeCategory}
            categories={categoryOrder.map((c) => ({ id: c.id, label: c.label }))}
            onChange={setActiveCategory}
          />
          <p className="text-[10px] text-gray-400 text-center mt-2">
            💡 点击星系轨道上的创作星球切换展示类别。
          </p>
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
          <div className={`grid gap-3 ${colSpan === 2 ? 'grid-cols-2' : 'grid-cols-1'}`}>
            {videos.map((vid, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-white/40 dark:bg-gray-800/40 border border-white/20 hover:border-purple-400/30 transition flex flex-col justify-between"
              >
                <div>
                  {vid.image_url && (
                    <BlockImage
                      src={vid.image_url}
                      alt={vid.title}
                      className="w-full aspect-square rounded-lg mb-2 object-cover"
                      fallback={null}
                    />
                  )}
                  <span className="text-[10px] text-gray-400 font-mono">{vid.series}</span>
                  <h4 className="font-bold text-xs text-gray-800 dark:text-white mt-0.5">
                    {vid.title}
                  </h4>
                </div>
                <div className="flex gap-3 mt-3 pt-2 border-t border-white/5">
                  {vid.video_link && vid.video_link.trim() !== '' && (
                    <a
                      href={vid.video_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-0.5 font-medium"
                    >
                      <span>视频链接</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                  {vid.podcast_link && vid.podcast_link.trim() !== '' && (
                    <a
                      href={vid.podcast_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-pink-600 dark:text-pink-400 hover:underline flex items-center gap-0.5 font-medium"
                    >
                      <span>播客链接</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeCategory === 'articles' && (
          <div className="space-y-3">
            {articles.map((art, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-white/40 dark:bg-gray-800/40 border border-white/20 hover:border-purple-400/30 transition space-y-1.5"
              >
                {art.image_url && (
                  <BlockImage
                    src={art.image_url}
                    alt={art.title}
                    className="w-full aspect-square rounded-lg mb-2 object-cover"
                    fallback={null}
                  />
                )}
                <div className="flex items-start justify-between gap-3">
                  <h4 className="font-bold text-xs text-gray-800 dark:text-white leading-tight">
                    {art.title}
                  </h4>
                  {art.link && art.link.trim() !== '' && (
                    <a
                      href={art.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-0.5 flex-shrink-0 font-medium"
                    >
                      <span>阅读</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
                <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">{art.excerpt}</p>
              </div>
            ))}
          </div>
        )}

        {activeCategory === 'speeches' && (
          <div className="space-y-3">
            {speeches.map((sp, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-white/40 dark:bg-gray-800/40 border border-white/20 hover:border-purple-400/30 transition flex flex-col gap-3"
              >
                {sp.image_url && (
                  <BlockImage
                    src={sp.image_url}
                    alt={sp.speech_name}
                    className="w-full aspect-square rounded-lg object-cover"
                    fallback={null}
                  />
                )}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <h4 className="font-bold text-xs text-gray-800 dark:text-white leading-tight">
                    🎤 {sp.speech_name}
                  </h4>
                <div className="flex flex-wrap gap-2.5">
                  {sp.link && sp.link.trim() !== '' && (
                    <a
                      href={sp.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] bg-purple-500/10 px-2 py-0.5 rounded text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-0.5 font-medium"
                    >
                      <span>演示文稿</span>
                    </a>
                  )}
                  {sp.outline_doc && sp.outline_doc.trim() !== '' && (
                    <a
                      href={sp.outline_doc}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] bg-pink-500/10 px-2 py-0.5 rounded text-pink-600 dark:text-pink-400 hover:underline flex items-center gap-0.5 font-medium"
                    >
                      <span>大纲文档</span>
                    </a>
                  )}
                  {sp.presentation_link && sp.presentation_link.trim() !== '' && (
                    <a
                      href={sp.presentation_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] bg-blue-500/10 px-2 py-0.5 rounded text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-0.5 font-medium"
                    >
                      <span>讲稿</span>
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
          </div>
        )}

        {activeCategory === 'mottos' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {mottos.map((motto, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-white/40 dark:bg-gray-800/40 border border-white/20 flex items-center justify-center text-center"
              >
                <p className="text-xs italic font-medium text-gray-800 dark:text-gray-200">
                  “ {motto} ”
                </p>
              </div>
            ))}
          </div>
        )}

        {activeCategory === 'quotes' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {quotes.map((quote, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-white/40 dark:bg-gray-800/40 border border-white/20 flex items-center justify-center text-center"
              >
                <p className="text-xs italic font-medium text-gray-800 dark:text-gray-200">
                  “ {quote} ”
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </GlassCard>
  );
}
