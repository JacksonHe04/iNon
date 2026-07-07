'use client';

import GlassCard from '@/components/GlassCard';
import { CalendarDays, MapPin, Tag } from 'lucide-react';

export interface PerformanceItem {
  type: string;
  name: string;
  date: string;
  genre: string;
  location: string;
}

interface EventsBlockProps {
  performances: PerformanceItem[];
  colSpan?: number;
}

export default function EventsBlock({ performances, colSpan = 2 }: EventsBlockProps) {
  // Let the first performance be the featured one
  const featured = performances[0];
  const list = performances.slice(1);

  return (
    <GlassCard className="p-5 space-y-5 hover:border-purple-400/40 transition-all duration-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400">
            <CalendarDays className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-gray-900 dark:text-white">Live 与活动</h3>
          </div>
        </div>
        <span className="text-xs text-gray-400 font-mono">{performances.length} 场活动</span>
      </div>

      <div className="space-y-4">
        {/* Featured Performance */}
        {featured && (
          <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 space-y-2">
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-700 dark:text-purple-300 text-[10px] font-bold">
                {featured.type}
              </span>
              <span className="text-[10px] text-gray-400 font-mono">{featured.date}</span>
            </div>
            <h4 className="font-bold text-sm text-gray-900 dark:text-white">{featured.name}</h4>
            <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-gray-600 dark:text-gray-300 pt-1">
              <div className="flex items-center gap-1">
                <Tag className="w-3 h-3 text-purple-500" />
                <span>{featured.genre}</span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-pink-500" />
                <span>{featured.location}</span>
              </div>
            </div>
          </div>
        )}

        {/* Other Performances Grid */}
        <div className={`grid gap-3 ${colSpan === 2 ? 'grid-cols-2' : 'grid-cols-1'}`}>
          {list.map((item, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl bg-white/40 dark:bg-gray-800/40 border border-white/20 hover:border-purple-400/30 transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="px-1.5 py-0.5 rounded bg-white/60 dark:bg-gray-700/60 text-gray-700 dark:text-gray-300 text-[9px] font-bold">
                    {item.type}
                  </span>
                  <span className="text-[9px] text-gray-400 font-mono">{item.date}</span>
                </div>
                <h5 className="font-semibold text-xs text-gray-800 dark:text-white leading-snug">
                  {item.name}
                </h5>
              </div>
              <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-gray-500 dark:text-gray-400 mt-3 pt-1.5 border-t border-white/5">
                <span className="truncate max-w-[100px]">🏷️ {item.genre}</span>
                <span className="truncate max-w-[120px]">📍 {item.location}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </GlassCard>
  );
}
