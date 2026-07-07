'use client';

import GlassCard from '@/components/GlassCard';
import { Wrench, ExternalLink } from 'lucide-react';

export interface DevToolItem {
  name: string;
  link: string;
  comment: string;
  tags: string[];
}

interface DevToolsBlockProps {
  devTools: DevToolItem[];
  colSpan?: number;
}

export default function DevToolsBlock({ devTools = [], colSpan = 2 }: DevToolsBlockProps) {
  return (
    <GlassCard className="p-5 space-y-4 hover:border-blue-400/40 transition-all duration-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <Wrench className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-gray-900 dark:text-white">开发工具</h3>
          </div>
        </div>
        <span className="text-xs text-gray-400 font-mono">{devTools.length} 款工具</span>
      </div>

      <div className={`grid gap-3.5 ${colSpan === 2 ? 'grid-cols-2' : 'grid-cols-1'}`}>
        {devTools.map((tool, idx) => (
          <div
            key={idx}
            className="p-3.5 rounded-xl bg-white/40 dark:bg-gray-800/40 border border-white/20 hover:border-blue-400/30 transition flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-3">
                <h4 className="font-bold text-xs text-gray-800 dark:text-white">
                  🛠️ {tool.name}
                </h4>
                {tool.link && tool.link.trim() !== '' && (
                  <a
                    href={tool.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-0.5 flex-shrink-0 font-medium"
                  >
                    <span>访问</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
              <p className="text-[11px] text-gray-500 leading-relaxed mt-1.5">{tool.comment}</p>
            </div>

            <div className="flex flex-wrap gap-1 mt-3">
              {tool.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-1.5 py-0.5 rounded bg-blue-500/5 border border-blue-500/10 text-[9px] text-blue-600 dark:text-blue-400 font-mono"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}
