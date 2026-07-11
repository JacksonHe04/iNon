'use client';

import GlassCard from '@/components/GlassCard';
import { Cpu } from 'lucide-react';

interface SkillsBlockProps {
  techStack: string[];
  expertise: string[];
  title?: string;
  colSpan?: number;
}

export default function SkillsBlock({
  techStack = [],
  expertise = [],
  title,
  colSpan = 2,
}: SkillsBlockProps) {
  return (
    <GlassCard className="p-5 space-y-4 hover:border-blue-400/40 transition-all duration-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            {title && <h3 className="font-bold text-base text-gray-900 dark:text-white">{title}</h3>}
          </div>
        </div>
      </div>

      <div className={`grid gap-4 ${colSpan === 2 ? 'grid-cols-2' : 'grid-cols-1'}`}>
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-gray-400">技术栈</h4>
          <div className="flex flex-wrap gap-2">
            {techStack.map((tech, idx) => (
              <span
                key={idx}
                className="px-2.5 py-1 bg-blue-500/10 border border-blue-500/15 rounded-lg text-xs font-semibold text-blue-600 dark:text-blue-400 font-mono"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="text-xs font-bold text-gray-400">专长领域</h4>
          <div className="flex flex-wrap gap-2">
            {expertise.map((exp, idx) => (
              <span
                key={idx}
                className="px-2.5 py-1 bg-purple-500/10 border border-purple-500/15 rounded-lg text-xs font-semibold text-purple-600 dark:text-purple-400"
              >
                {exp}
              </span>
            ))}
          </div>
        </div>
      </div>
    </GlassCard>
  );
}
