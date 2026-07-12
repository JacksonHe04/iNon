import React, { useState } from 'react';
import { Globe, Plus, Trash2 } from 'lucide-react';
import GlassCard from '@/components/GlassCard';
import type { ReadmeData } from '@/types';

interface Bookmark {
  id: string;
  title: string;
  url: string;
  icon: string;
}

interface ShortcutBookmarksManagerProps {
  initialDevTools: ReadmeData['development']['dev_tools'];
  developmentData: ReadmeData['development'];
}

export function ShortcutBookmarksManager({
  initialDevTools,
  developmentData,
}: ShortcutBookmarksManagerProps) {
  const initialBookmarks = initialDevTools.length > 0
    ? initialDevTools.map((t, idx) => ({
        id: String(idx),
        title: t.name,
        url: t.link,
        icon: t.comment || '🔗',
      }))
    : [
        { id: '1', title: 'GitHub', url: 'https://github.com', icon: '🐙' },
        { id: '2', title: 'Vercel', url: 'https://vercel.com', icon: '▲' },
        { id: '3', title: 'Supabase', url: 'https://supabase.com', icon: '⚡' },
        { id: '4', title: 'Antigravity CLI', url: 'https://deepmind.google', icon: '🤖' },
      ];

  const [bookmarks, setBookmarks] = useState<Bookmark[]>(initialBookmarks);
  const [newBookmarkTitle, setNewBookmarkTitle] = useState('');
  const [newBookmarkUrl, setNewBookmarkUrl] = useState('');
  const [savingBookmark, setSavingBookmark] = useState(false);

  const saveBookmarksToSupabase = async (updatedBookmarks: Bookmark[]) => {
    try {
      setSavingBookmark(true);
      const devTools = updatedBookmarks.map((b) => ({
        name: b.title,
        link: b.url,
        comment: b.icon || '',
        tags: [],
      }));

      await fetch('/api/account/content/development', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...developmentData,
          dev_tools: devTools,
        }),
      });
    } catch (e) {
      console.error('Failed to persist bookmarks to Supabase:', e);
    } finally {
      setSavingBookmark(false);
    }
  };

  const handleAddBookmark = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBookmarkTitle || !newBookmarkUrl) return;
    const nextList = [
      ...bookmarks,
      {
        id: String(Date.now()),
        title: newBookmarkTitle,
        url: newBookmarkUrl,
        icon: '🔗',
      },
    ];
    setBookmarks(nextList);
    setNewBookmarkTitle('');
    setNewBookmarkUrl('');
    await saveBookmarksToSupabase(nextList);
  };

  const handleDeleteBookmark = async (id: string) => {
    const nextList = bookmarks.filter((b) => b.id !== id);
    setBookmarks(nextList);
    await saveBookmarksToSupabase(nextList);
  };

  return (
    <GlassCard className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 font-bold text-base text-gray-900 dark:text-white">
          <Globe className="w-5 h-5 text-teal-500" />
          <h2>网页快捷入口 Block (直接编辑)</h2>
        </div>
        <span className="text-xs text-gray-500 font-mono">
          {savingBookmark ? '正在同步...' : `共 ${bookmarks.length} 个入口`}
        </span>
      </div>

      {/* Bookmarks Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {bookmarks.map((b) => (
          <div
            key={b.id}
            className="relative group p-3 rounded-xl bg-white/40 dark:bg-gray-800/40 border border-white/30 hover:border-teal-400/50 transition flex items-center justify-between"
          >
            <a
              href={b.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-xs font-semibold text-gray-800 dark:text-gray-200 truncate pr-4"
            >
              <span>{b.icon}</span>
              <span className="truncate">{b.title}</span>
            </a>
            <button
              onClick={() => handleDeleteBookmark(b.id)}
              className="opacity-0 group-hover:opacity-100 p-1 text-rose-500 hover:bg-rose-500/10 rounded transition"
              title="删除快捷方式"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      {/* Inline Add Bookmark Form */}
      <form onSubmit={handleAddBookmark} className="pt-3 border-t border-white/20 flex gap-2">
        <input
          type="text"
          required
          placeholder="网站名称 (如: GitHub)"
          value={newBookmarkTitle}
          onChange={(e) => setNewBookmarkTitle(e.target.value)}
          className="w-1/3 px-3 py-1.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white/50 text-xs focus:outline-none"
        />
        <input
          type="url"
          required
          placeholder="网址 (https://...)"
          value={newBookmarkUrl}
          onChange={(e) => setNewBookmarkUrl(e.target.value)}
          className="flex-1 px-3 py-1.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white/50 text-xs focus:outline-none"
        />
        <button
          type="submit"
          className="flex items-center gap-1 px-4 py-1.5 rounded-xl bg-teal-500 text-white text-xs font-semibold hover:bg-teal-600 transition"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>添加</span>
        </button>
      </form>
    </GlassCard>
  );
}
export default ShortcutBookmarksManager;
