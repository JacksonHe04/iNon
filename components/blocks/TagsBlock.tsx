'use client';

import { useState } from 'react';
import GlassCard from '@/components/GlassCard';
import { Tag, Sparkles } from 'lucide-react';
import useNearViewportActivation from '@/hooks/useNearViewportActivation';

interface TagsBlockProps {
  keywords: string[];
  values: string[];
  tags: string[];
  habits: string[];
  workPreferences: string[];
  techStack: string[];
  expertise: string[];
  title?: string;
  colSpan?: number;
}

export default function TagsBlock({
  keywords = [],
  values = [],
  tags = [],
  habits = [],
  workPreferences = [],
  techStack = [],
  expertise = [],
  title,
  colSpan = 2,
}: TagsBlockProps) {
  // Collect all unique tags
  const allTags = Array.from(
    new Set([
      ...keywords,
      ...values,
      ...tags,
      ...habits,
      ...workPreferences,
      ...techStack,
      ...expertise,
    ])
  ).filter(Boolean);

  const [activeTags, setActiveTags] = useState<Set<string>>(new Set());
  const contentActivation = useNearViewportActivation('800px 0px');

  const toggleTag = (tag: string) => {
    const newActiveTags = new Set(activeTags);
    if (newActiveTags.has(tag)) {
      newActiveTags.delete(tag);
    } else {
      newActiveTags.add(tag);
    }
    setActiveTags(newActiveTags);
  };

  return (
    <GlassCard className="p-5 space-y-4 hover:border-purple-400/40 transition-all duration-300">
      <div ref={contentActivation.targetRef} className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400">
            <Tag className="w-5 h-5" />
          </div>
          <div>
            {title && <h3 className="font-bold text-base text-gray-900 dark:text-white">{title}</h3>}
            <p className="text-[10px] text-gray-500 mt-0.5">点亮标签表示你与我有相同特质或看法</p>
          </div>
        </div>
        <span className="text-xs text-gray-400 font-mono">{activeTags.size} / {allTags.length} 已点亮</span>
      </div>

      {contentActivation.active ? <div className={`grid gap-2 ${colSpan === 2 ? 'grid-cols-3 sm:grid-cols-4 md:grid-cols-6' : 'grid-cols-2 sm:grid-cols-3'}`}>
        {allTags.map((tag, idx) => {
          const isActive = activeTags.has(tag);
          return (
            <button
              key={idx}
              onClick={() => toggleTag(tag)}
              className={`flex flex-col justify-between p-2.5 rounded-xl border text-left text-xs transition-all duration-300 select-none relative overflow-hidden hover:-translate-y-0.5 active:scale-[0.96] ${
                isActive
                  ? 'border-purple-500/40 bg-gradient-to-br from-purple-500/15 to-pink-500/10 text-purple-600 dark:text-purple-300 shadow-md'
                  : 'border-white/20 bg-white/30 dark:bg-gray-800/30 text-gray-700 dark:text-gray-300 hover:border-purple-400/30 hover:bg-white/50 dark:hover:bg-gray-800/50'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-1">
                <span className="text-[9px] uppercase tracking-wide text-gray-400/70 font-mono">
                  #{String(idx + 1).padStart(2, '0')}
                </span>
                {isActive && <Sparkles className="w-3 h-3 text-purple-500 animate-pulse" />}
              </div>
              <p className="font-bold leading-tight truncate w-full">{tag}</p>
            </button>
          );
        })}
      </div> : (
        <div
          className={colSpan === 2 ? 'min-h-[520px]' : 'min-h-[760px]'}
          aria-hidden="true"
        />
      )}
    </GlassCard>
  );
}
