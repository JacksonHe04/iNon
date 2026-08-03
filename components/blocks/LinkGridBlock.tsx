'use client';

import GlassCard from '@/components/GlassCard';
import { ExternalLink, Trash2 } from 'lucide-react';

export interface LinkGridItem {
  id: string;
  name: string;
  href: string;
  icon?: string;
  imageUrl?: string;
  imageAlt?: string;
  subtitle?: string;
}

interface LinkGridBlockProps {
  items: LinkGridItem[];
  title?: string;
  blockIcon: React.ComponentType<{ className?: string }>;
  themeColorClass?: 'teal' | 'purple' | 'blue' | 'indigo';
  countLabel?: string;
  defaultIcon?: string;
  onDelete?: (id: string) => void;
}

export default function LinkGridBlock({
  items = [],
  title,
  blockIcon: BlockIcon,
  themeColorClass = 'teal',
  countLabel = '个入口',
  defaultIcon = '🔗',
  onDelete,
}: LinkGridBlockProps) {
  const hoverBorderClasses: Record<string, string> = {
    teal: 'hover:border-teal-400/40',
    purple: 'hover:border-purple-400/40',
    blue: 'hover:border-blue-400/40',
    indigo: 'hover:border-indigo-400/40',
  };

  const iconBgClasses: Record<string, string> = {
    teal: 'bg-teal-500/10 text-teal-600 dark:text-teal-400',
    purple: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
    blue: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    indigo: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
  };

  const cardBorderClasses: Record<string, string> = {
    teal: 'hover:border-teal-400/50',
    purple: 'hover:border-purple-400/50',
    blue: 'hover:border-blue-400/50',
    indigo: 'hover:border-indigo-400/50',
  };

  const actionTextClasses: Record<string, string> = {
    teal: 'group-hover:text-teal-500',
    purple: 'group-hover:text-purple-500',
    blue: 'group-hover:text-blue-500',
    indigo: 'group-hover:text-indigo-500',
  };

  return (
    <GlassCard className={`p-5 space-y-4 transition duration-300 ${hoverBorderClasses[themeColorClass] || hoverBorderClasses.teal}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className={`p-2 rounded-lg ${iconBgClasses[themeColorClass] || iconBgClasses.teal}`}>
            <BlockIcon className="w-5 h-5" />
          </div>
          {title && <h3 className="font-bold text-base text-gray-900 dark:text-white">{title}</h3>}
        </div>
        <span className="text-xs text-gray-400 font-mono">
          {items.length} {countLabel}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        {items.map((item) => (
          <div
            key={item.id}
            className={`group relative flex items-center justify-between p-2.5 rounded-xl bg-white/40 dark:bg-gray-800/40 border border-white/20 transition text-xs font-medium ${cardBorderClasses[themeColorClass] || cardBorderClasses.teal}`}
          >
            <a
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 truncate pr-2 text-gray-800 dark:text-gray-200 hover:text-teal-600 dark:hover:text-teal-400"
            >
              {item.imageUrl ? (
                <img
                  src={item.imageUrl}
                  alt={item.imageAlt || item.name}
                  loading="lazy"
                  decoding="async"
                  fetchPriority="low"
                  className="h-5 w-5 rounded-full object-cover shrink-0"
                />
              ) : (
                <span className="text-sm">{item.icon || defaultIcon}</span>
              )}
              <span className="truncate">
                <span className="block font-semibold">{item.name}</span>
                {item.subtitle && (
                  <span className="block text-[10px] text-gray-500 truncate">{item.subtitle}</span>
                )}
              </span>
            </a>

            <div className="flex items-center gap-1 shrink-0">
              {onDelete && (
                <button
                  type="button"
                  onClick={() => onDelete(item.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 text-rose-500 hover:bg-rose-500/10 rounded transition"
                  title="删除"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
              <ExternalLink
                className={`w-3.5 h-3.5 text-gray-400 transition ${actionTextClasses[themeColorClass] || actionTextClasses.teal}`}
              />
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}
