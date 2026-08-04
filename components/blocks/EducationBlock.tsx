'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import GlassCard from '@/components/GlassCard';
import { GraduationCap, Landmark, HelpCircle, Eye, EyeOff } from 'lucide-react';

const EducationScene = dynamic(() => import('@/components/scenes/EducationScene'), {
  ssr: false,
  loading: () => <div className="min-h-[300px]" aria-hidden="true" />,
});

export interface SchoolItem {
  degree: string;
  major: string;
  institution: string;
  start_date: string;
  end_date: string;
}

interface EducationBlockProps {
  schools: SchoolItem[];
  undergraduateMajor?: string;
  undergraduateAdvisor?: string;
  title?: string;
  colSpan?: number;
  mode?: 'readonly' | 'edit';
}

export default function EducationBlock({
  schools,
  undergraduateMajor,
  undergraduateAdvisor,
  title,
  colSpan = 2,
  mode = 'readonly',
}: EducationBlockProps) {
  const [showScene, setShowScene] = useState(true);

  return (
    <GlassCard className="p-5 space-y-5 hover:border-blue-400/40 transition-all duration-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <GraduationCap className="w-5 h-5" />
          </div>
          {title && <h3 className="font-bold text-base text-gray-900 dark:text-white">{title}</h3>}
        </div>
        <div className="flex items-center gap-2">
          {colSpan === 2 && (
            <button
              onClick={() => setShowScene(!showScene)}
              className="flex items-center gap-1 px-2.5 py-1 text-xs rounded-xl bg-white/40 dark:bg-gray-800/40 border border-white/20 hover:bg-white/60 dark:hover:bg-gray-800/60 text-gray-600 dark:text-gray-300 font-medium transition"
            >
              {showScene ? (
                <>
                  <EyeOff className="w-3.5 h-3.5" />
                  <span>隐藏 2D 互动</span>
                </>
              ) : (
                <>
                  <Eye className="w-3.5 h-3.5" />
                  <span>显示 2D 互动</span>
                </>
              )}
            </button>
          )}
          <span className="text-xs text-gray-400 font-mono">{schools.length} 所学校</span>
        </div>
      </div>

      {colSpan === 2 && showScene && (
        <div className="relative overflow-hidden rounded-2xl border border-white/20 bg-gradient-to-br from-blue-50/50 to-indigo-50/30 dark:from-blue-950/20 dark:to-indigo-950/10 p-2">
          <EducationScene schools={schools} mode={mode} />
        </div>
      )}

      <div className={`grid gap-4 ${colSpan === 2 ? 'grid-cols-2' : 'grid-cols-1'}`}>
        {schools.map((school, idx) => (
          <div
            key={idx}
            className="p-4 rounded-xl bg-white/40 dark:bg-gray-800/40 border border-white/20 hover:border-blue-400/30 transition space-y-2"
          >
            <div className="flex items-start gap-2.5">
              <Landmark className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
              <div className="min-w-0">
                <h4 className="font-bold text-sm text-gray-900 dark:text-white truncate">
                  {school.institution}
                </h4>
                <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                  {school.degree} · {school.major}
                </p>
                <p className="text-[10px] text-gray-400 font-mono mt-0.5">
                  {school.start_date} ~ {school.end_date}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {(undergraduateMajor || undergraduateAdvisor) && (
        <div className="pt-3 border-t border-white/10 flex flex-wrap gap-3 text-xs">
          {undergraduateMajor && (
            <div className="px-3 py-1.5 rounded-lg bg-blue-500/5 border border-blue-500/10 text-gray-700 dark:text-gray-300">
              <span className="text-gray-400">本科专业：</span>
              <span className="font-semibold">{undergraduateMajor}</span>
            </div>
          )}
          {undergraduateAdvisor && (
            <div className="px-3 py-1.5 rounded-lg bg-indigo-500/5 border border-indigo-500/10 text-gray-700 dark:text-gray-300">
              <span className="text-gray-400">本科导师：</span>
              <span className="font-semibold">{undergraduateAdvisor}</span>
            </div>
          )}
        </div>
      )}
    </GlassCard>
  );
}
