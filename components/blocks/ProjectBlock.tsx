'use client';

import GlassCard from '@/components/GlassCard';
import { Briefcase, ExternalLink, GitBranch } from 'lucide-react';
import ArchiveSectionHeading from '@/components/archive/ArchiveSectionHeading';

export interface ProjectItem {
  id?: string;
  project_name: string;
  description: string;
  link?: string;
  github?: string;
  tech_stack: string[];
}

interface ProjectBlockProps {
  projects: ProjectItem[];
  title?: string;
}

export default function ProjectBlock({ projects, title }: ProjectBlockProps) {
  return (
    <GlassCard className="p-5 space-y-4 hover:border-emerald-400/40 transition">
      <ArchiveSectionHeading title={title || '项目档案'} icon={Briefcase} count={projects.length} countLabel="PROJECTS" />

      <div className="space-y-3">
        {projects.map((proj, idx) => (
          <div
            key={idx}
            className="archive-index-card p-3.5 bg-white/40 dark:bg-gray-800/40 border border-[var(--archive-line)] hover:border-emerald-400/50 transition space-y-2"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-sm text-gray-900 dark:text-white">
                <GitBranch className="w-3.5 h-3.5 text-emerald-500" />
                <span>{proj.project_name}</span>
              </div>
              <a
                href={proj.link || proj.github}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1 hover:underline font-medium"
              >
                <span>查看</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2">{proj.description}</p>
            <div className="flex flex-wrap gap-1">
              {proj.tech_stack.map((tech) => (
                <span key={tech} className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 font-mono">
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
