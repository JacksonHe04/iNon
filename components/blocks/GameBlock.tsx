'use client';

import GlassCard from '@/components/GlassCard';
import { Gamepad2, ExternalLink } from 'lucide-react';
import { getBlockTitle } from '@/lib/blocks/registry';

export interface GameItem {
  id: string;
  name: string;
  platform?: string;
  link?: string;
  status?: string;
}

interface GameBlockProps {
  items: GameItem[];
  title?: string;
}

export default function GameBlock({ items, title = getBlockTitle('games') }: GameBlockProps) {
  return (
    <GlassCard className="p-5 space-y-4 hover:border-cyan-400/40 transition">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
            <Gamepad2 className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-gray-900 dark:text-white">{title}</h3>
        </div>
        <span className="text-xs text-gray-400 font-mono">{items.length} 款游戏</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        {items.map((item) => (
          <div
            key={item.id}
            className="group relative p-2.5 rounded-xl bg-white/40 dark:bg-gray-800/40 border border-white/20 hover:border-cyan-400/50 transition flex items-center justify-between"
          >
            <div className="flex items-center gap-2 truncate pr-2 text-xs font-semibold text-gray-800 dark:text-gray-200">
              <span>🎮</span>
              <span className="truncate">{item.name}</span>
            </div>

            {item.link && (
              <a
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1 text-gray-400 hover:text-cyan-500 rounded transition"
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
