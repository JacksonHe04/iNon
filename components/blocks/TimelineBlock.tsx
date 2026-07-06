'use client';

import GlassCard from '@/components/GlassCard';
import { Milestone, Calendar } from 'lucide-react';

export interface TimelineItem {
  id: string;
  date: string;
  city?: string;
  description: string;
}

interface TimelineBlockProps {
  items: TimelineItem[];
  title?: string;
}

export default function TimelineBlock({ items, title = '动态时间线' }: TimelineBlockProps) {
  return (
    <GlassCard className="p-5 space-y-4 hover:border-pink-400/40 transition">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-pink-500/10 text-pink-600 dark:text-pink-400">
            <Milestone className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-gray-900 dark:text-white">{title}</h3>
        </div>
        <span className="text-xs text-gray-400 font-mono">{items.length} 个里程碑</span>
      </div>

      <div className="relative border-l-2 border-pink-500/30 ml-3 pl-4 space-y-4">
        {items.map((item) => (
          <div key={item.id} className="relative group">
            <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-pink-500 ring-4 ring-pink-500/20 group-hover:scale-125 transition" />
            <div className="flex items-center gap-2 text-xs font-semibold text-pink-600 dark:text-pink-400 font-mono">
              <Calendar className="w-3.5 h-3.5" />
              <span>{item.date}</span>
              {item.city && <span className="text-gray-400">· {item.city}</span>}
            </div>
            <p className="text-xs text-gray-700 dark:text-gray-300 mt-1 leading-relaxed">
              {item.description}
            </p>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}
