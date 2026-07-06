'use client';

import GlassCard from '@/components/GlassCard';
import { Music, Disc, ExternalLink } from 'lucide-react';

export interface MusicItem {
  id: string;
  name: string;
  artist: string;
  album?: string;
  coverUrl?: string;
  link?: string;
  comment?: string;
}

interface MusicBlockProps {
  items: MusicItem[];
  title?: string;
}

export default function MusicBlock({ items, title = '音乐收藏卡片' }: MusicBlockProps) {
  return (
    <GlassCard className="p-5 space-y-4 hover:border-emerald-400/40 transition">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <Music className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-gray-900 dark:text-white">{title}</h3>
        </div>
        <span className="text-xs text-gray-400 font-mono">{items.length} 首/辑</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {items.map((item) => (
          <div
            key={item.id}
            className="group relative flex items-center justify-between p-3 rounded-xl bg-white/40 dark:bg-gray-800/40 border border-white/20 hover:border-emerald-400/50 transition space-x-3"
          >
            <div className="flex items-center gap-3 truncate min-w-0">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold flex-shrink-0">
                <Disc className="w-5 h-5 animate-spin-slow" />
              </div>
              <div className="truncate min-w-0">
                <h4 className="text-xs font-bold text-gray-900 dark:text-white truncate">
                  {item.name}
                </h4>
                <p className="text-[11px] text-gray-500 truncate">{item.artist}</p>
              </div>
            </div>

            {item.link && (
              <a
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 text-gray-400 hover:text-emerald-500 rounded-lg transition flex-shrink-0"
                title="打开试听"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        ))}
      </div>
    </GlassCard>
  );
}
