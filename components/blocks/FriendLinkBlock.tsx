'use client';

import GlassCard from '@/components/GlassCard';
import { Users, ExternalLink } from 'lucide-react';
import { getBlockTitle } from '@/lib/blocks/registry';

export interface FriendLinkItem {
  id: string;
  name: string;
  link: string;
  avatarUrl?: string;
  description?: string;
}

interface FriendLinkBlockProps {
  items: FriendLinkItem[];
  title?: string;
}

export default function FriendLinkBlock({ items, title = getBlockTitle('friend_links') }: FriendLinkBlockProps) {
  return (
    <GlassCard className="p-5 space-y-4 hover:border-blue-400/40 transition">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <Users className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-gray-900 dark:text-white">{title}</h3>
        </div>
        <span className="text-xs text-gray-400 font-mono">{items.length} 个友链</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        {items.map((item) => (
          <a
            key={item.id}
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative flex items-center justify-between p-2.5 rounded-xl bg-white/40 dark:bg-gray-800/40 border border-white/20 hover:border-blue-400/50 transition text-xs font-medium"
          >
            <div className="flex items-center gap-2 truncate pr-2">
              <span className="text-sm">🌐</span>
              <span className="truncate text-gray-800 dark:text-gray-200 group-hover:text-blue-500">
                {item.name}
              </span>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-gray-400 group-hover:text-blue-500 transition" />
          </a>
        ))}
      </div>
    </GlassCard>
  );
}
