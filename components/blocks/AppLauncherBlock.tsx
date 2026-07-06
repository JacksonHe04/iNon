'use client';

import GlassCard from '@/components/GlassCard';
import { AppWindow, ExternalLink } from 'lucide-react';

export interface AppItem {
  id: string;
  name: string;
  category: string;
  link: string;
  icon?: string;
}

interface AppLauncherBlockProps {
  apps: AppItem[];
}

export default function AppLauncherBlock({ apps }: AppLauncherBlockProps) {
  return (
    <GlassCard className="p-5 space-y-4 hover:border-purple-400/40 transition">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400">
            <AppWindow className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-gray-900 dark:text-white">App 快捷启动</h3>
        </div>
        <span className="text-xs text-gray-400 font-mono">{apps.length} 个应用</span>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        {apps.map((app) => (
          <a
            key={app.id}
            href={app.link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-3 rounded-xl bg-white/40 dark:bg-gray-800/40 border border-white/20 hover:border-purple-400/50 transition"
          >
            <div className="flex items-center gap-2.5 truncate">
              <span className="text-base">{app.icon || '🚀'}</span>
              <div className="truncate">
                <div className="text-xs font-bold text-gray-900 dark:text-white truncate">{app.name}</div>
                <div className="text-[10px] text-gray-500 truncate">{app.category}</div>
              </div>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
          </a>
        ))}
      </div>
    </GlassCard>
  );
}
