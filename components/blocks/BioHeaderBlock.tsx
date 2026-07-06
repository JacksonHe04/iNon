'use client';

import GlassCard from '@/components/GlassCard';
import { User, MapPin, Sparkles, Send } from 'lucide-react';

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
    <GlassCard className="p-6 md:p-8 space-y-6 relative overflow-hidden border-teal-500/30 bg-gradient-to-br from-teal-500/10 via-transparent to-emerald-500/10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-3 flex-1">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-teal-500/20 text-teal-600 dark:text-teal-300 border border-teal-500/30 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" />
              <span>Bio Card</span>
            </span>
            {currentCity && (
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-white/40 dark:bg-gray-800/40 text-gray-600 dark:text-gray-300 border border-white/20 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-rose-500" />
                <span>{currentCity}</span>
              </span>
            )}
            {mbti?.life_mbti && (
              <span className="px-3 py-1 rounded-full text-xs font-mono font-semibold bg-purple-500/15 text-purple-600 dark:text-purple-300 border border-purple-500/30">
                MBTI: {mbti.life_mbti}
              </span>
            )}
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            {name}
          </h1>

          <p className="text-sm md:text-base text-gray-700 dark:text-gray-200 leading-relaxed max-w-2xl">
            {intro}
          </p>

          {keywords.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {keywords.map((kw, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-0.5 rounded-lg text-xs font-medium bg-teal-500/10 text-teal-700 dark:text-teal-300 border border-teal-500/20"
                >
                  #{kw}
                </span>
              ))}
            </div>
          )}
        </div>

        {currentStatus && (
          <div className="p-4 rounded-2xl bg-white/50 dark:bg-gray-800/60 border border-white/30 space-y-1.5 min-w-[220px] shadow-lg">
            <div className="flex items-center gap-1.5 text-xs font-bold text-teal-600 dark:text-teal-400">
              <Sparkles className="w-4 h-4" />
              <span>CURRENT STATUS</span>
            </div>
            <p className="text-xs font-medium text-gray-800 dark:text-gray-200">
              {currentStatus}
            </p>
          </div>
        )}
      </div>
    </GlassCard>
  );
}
