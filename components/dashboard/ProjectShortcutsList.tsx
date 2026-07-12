import React from 'react';
import { Briefcase, ExternalLink } from 'lucide-react';
import GlassCard from '@/components/GlassCard';
import type { ReadmeData } from '@/types';

interface ProjectShortcutsListProps {
  projects: ReadmeData['development']['projects'];
}

export function ProjectShortcutsList({ projects }: ProjectShortcutsListProps) {
  return (
    <GlassCard className="p-6 space-y-4">
      <div className="flex items-center gap-2 font-bold text-base text-gray-900 dark:text-white">
        <Briefcase className="w-5 h-5 text-purple-500" />
        <h2>项目快捷入口 Block</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {projects.slice(0, 4).map((proj, idx) => (
          <div
            key={idx}
            className="p-4 rounded-xl bg-white/40 dark:bg-gray-800/40 border border-white/30 space-y-2 hover:border-purple-400/50 transition"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-gray-900 dark:text-white">{proj.project_name}</h3>
              <a
                href={proj.link || proj.github}
                target="_blank"
                rel="noreferrer"
                className="text-purple-600 dark:text-purple-400 text-xs flex items-center gap-1 hover:underline"
              >
                <span>查看项目</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2">{proj.description}</p>
            <div className="flex flex-wrap gap-1 pt-1">
              {proj.tech_stack.map((tech) => (
                <span key={tech} className="px-2 py-0.5 rounded text-[10px] bg-purple-500/10 text-purple-600 border border-purple-500/20">
                  {tech}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}
export default ProjectShortcutsList;
