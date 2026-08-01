'use client';

import GlassCard from '@/components/GlassCard';
import { MapPin, Sparkles } from 'lucide-react';

export interface BioHeaderBlockProps {
  name: string;
  intro: string;
  currentStatus?: string;
  currentCity?: string;
  mbti?: {
    life_mbti?: string;
    work_mbti?: string;
  };
  keywords?: string[];
}

export default function BioHeaderBlock({
  name,
  intro,
  currentStatus,
  currentCity,
  mbti,
  keywords = [],
}: BioHeaderBlockProps) {
  return (
    <GlassCard className="archive-bio p-6 md:p-9 space-y-6 relative overflow-hidden">
      <div className="archive-bio__specimen" aria-hidden="true" />
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 relative z-10">
        <div className="space-y-3 flex-1">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="archive-kicker border-b border-[var(--archive-line-strong)] pb-1">
              Personal dossier · No. 001
            </span>
            {currentCity && (
              <span className="px-2 py-1 text-[10px] font-medium text-gray-600 border border-[var(--archive-line)] flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-rose-500" />
                <span>{currentCity}</span>
              </span>
            )}
            {mbti?.life_mbti && (
              <span className="px-2 py-1 text-[9px] font-mono font-semibold text-purple-600 border border-purple-500/30">
                MBTI: {mbti.life_mbti}
              </span>
            )}
          </div>

          <h2 className="text-4xl sm:text-6xl font-medium tracking-[-0.045em] leading-[0.95] text-gray-900 dark:text-white">
            {name}
          </h2>

          <p className="text-sm md:text-base text-gray-700 dark:text-gray-200 leading-relaxed max-w-2xl">
            {intro}
          </p>

          {keywords.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {keywords.map((kw, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-0.5 text-[10px] font-mono font-medium text-teal-700 dark:text-teal-300 border-b border-teal-500/30"
                >
                  #{kw}
                </span>
              ))}
            </div>
          )}
        </div>

        {currentStatus && (
          <aside className="archive-bio__note p-4 border border-[var(--archive-line-strong)] space-y-2 min-w-[220px]">
            <div className="flex items-center gap-1.5 text-[9px] font-mono font-bold tracking-[0.14em] uppercase text-teal-600 dark:text-teal-400">
              <Sparkles className="w-4 h-4" />
              <span>CURRENT STATUS</span>
            </div>
            <p className="text-xs font-medium text-gray-800 dark:text-gray-200">
              {currentStatus}
            </p>
          </aside>
        )}
      </div>
    </GlassCard>
  );
}
