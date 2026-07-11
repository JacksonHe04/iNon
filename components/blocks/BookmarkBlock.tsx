'use client';

import GlassCard from '@/components/GlassCard';
import { Bookmark, ExternalLink, Plus, Trash2 } from 'lucide-react';

export interface BookmarkItem {
  id: string;
  title: string;
  url: string;
  icon?: string;
  category?: string;
}

interface BookmarkBlockProps {
  items: BookmarkItem[];
  editable?: boolean;
  title?: string;
  onAdd?: (title: string, url: string) => void;
  onDelete?: (id: string) => void;
}

export default function BookmarkBlock({
  items,
  editable = false,
  title,
  onAdd,
  onDelete,
}: BookmarkBlockProps) {
  return (
    <GlassCard className="p-5 space-y-4 hover:border-teal-400/40 transition">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400">
            <Bookmark className="w-5 h-5" />
          </div>
          {title && <h3 className="font-bold text-base text-gray-900 dark:text-white">{title}</h3>}
        </div>
        <span className="text-xs text-gray-400 font-mono">{items.length} 个收藏</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        {items.map((item) => (
          <div
            key={item.id}
            className="group relative flex items-center justify-between p-2.5 rounded-xl bg-white/40 dark:bg-gray-800/40 border border-white/20 hover:border-teal-400/50 transition text-xs font-medium"
          >
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 truncate pr-2 text-gray-800 dark:text-gray-200 hover:text-teal-600 dark:hover:text-teal-400"
            >
              <span>{item.icon || '🔗'}</span>
              <span className="truncate">{item.title}</span>
            </a>

            {editable && onDelete && (
              <button
                onClick={() => onDelete(item.id)}
                className="opacity-0 group-hover:opacity-100 p-1 text-rose-500 hover:bg-rose-500/10 rounded transition"
                title="删除"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        ))}
      </div>
    </GlassCard>
  );
}
