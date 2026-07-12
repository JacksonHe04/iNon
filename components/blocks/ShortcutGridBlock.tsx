'use client';

import React from 'react';
import GlassCard from '@/components/GlassCard';
import { ExternalLink } from 'lucide-react';

export interface ShortcutItem {
  id: string;
  name: string;
  link?: string;
  icon?: string;
  [key: string]: any;
}

interface ShortcutGridBlockProps {
  items: ShortcutItem[];
  title: string;
  blockIcon: React.ComponentType<{ className?: string }>;
  themeColorClass?: string; // e.g. 'cyan', 'blue'
  countText?: string;
  defaultEmoji?: string;
}

export default function ShortcutGridBlock({
  items = [],
  title,
  blockIcon: BlockIcon,
  themeColorClass = 'cyan',
  countText = '个入口',
  defaultEmoji = '🔗',
}: ShortcutGridBlockProps) {
  
  const hoverBorderClasses: Record<string, string> = {
    cyan: 'hover:border-cyan-400/40',
    blue: 'hover:border-blue-400/40',
  };

  const textColors: Record<string, string> = {
    cyan: 'text-cyan-600 dark:text-cyan-400 group-hover:text-cyan-500',
    blue: 'text-blue-600 dark:text-blue-400 group-hover:text-blue-500',
  };

  const bgClasses: Record<string, string> = {
    cyan: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400',
    blue: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  };

  const hoverItemBorderClasses: Record<string, string> = {
    cyan: 'hover:border-cyan-400/50',
    blue: 'hover:border-blue-400/50',
  };

  return (
    <GlassCard className={`p-5 space-y-4 transition duration-300 ${hoverBorderClasses[themeColorClass] || hoverBorderClasses.cyan}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className={`p-2 rounded-lg ${bgClasses[themeColorClass] || bgClasses.cyan}`}>
            <BlockIcon className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-gray-900 dark:text-white">{title}</h3>
        </div>
        <span className="text-xs text-gray-400 font-mono">
          {items.length} {countText}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        {items.map((item) => {
          const cardContent = (
            <div className="flex items-center gap-2 truncate pr-2">
              <span className="text-sm">{item.icon || defaultEmoji}</span>
              <span className={`truncate text-gray-800 dark:text-gray-200 ${item.link ? (textColors[themeColorClass] || textColors.cyan) : ''}`}>
                {item.name}
              </span>
            </div>
          );

          if (item.link) {
            return (
              <a
                key={item.id}
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className={`group relative flex items-center justify-between p-2.5 rounded-xl bg-white/40 dark:bg-gray-800/40 border border-white/20 transition text-xs font-medium ${hoverItemBorderClasses[themeColorClass] || hoverItemBorderClasses.cyan}`}
              >
                {cardContent}
                <ExternalLink className="w-3.5 h-3.5 text-gray-400 group-hover:text-cyan-500 transition shrink-0" />
              </a>
            );
          }

          return (
            <div
              key={item.id}
              className="group relative p-2.5 rounded-xl bg-white/40 dark:bg-gray-800/40 border border-white/20 transition flex items-center justify-between text-xs font-semibold"
            >
              {cardContent}
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
}
