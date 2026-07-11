import { motion } from 'framer-motion';
import { LayoutDashboard, Library, Palette, UserCog, Eye, ExternalLink } from 'lucide-react';

export const DASHBOARD_TABS = [
  { id: 'home', label: '控制台', icon: LayoutDashboard },
  { id: 'content', label: '内容管理', icon: Library },
  { id: 'canvas', label: '公开网站', icon: Palette },
  { id: 'account', label: '账号管理', icon: UserCog },
] as const;

export type DashboardTabId = (typeof DASHBOARD_TABS)[number]['id'];

interface DashboardSideNavProps {
  activeTab: DashboardTabId;
  onTabChange: (tab: DashboardTabId) => void;
  className?: string;
  username?: string;
}

export default function DashboardSideNav({ activeTab, onTabChange, className = '', username }: DashboardSideNavProps) {
  return (
    <aside className={`w-full md:w-52 lg:w-60 shrink-0 md:sticky md:top-24 z-30 ${className}`}>
      <div className="rounded-3xl border border-white/30 bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl p-3 shadow-xl">
        <div className="flex flex-row md:flex-col gap-1.5 overflow-x-auto scrollbar-none">
          {DASHBOARD_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`relative flex items-center gap-2.5 px-4 py-3 rounded-2xl text-xs lg:text-sm font-medium transition-all whitespace-nowrap text-left w-full cursor-pointer ${
                  isActive
                    ? 'bg-white/50 dark:bg-gray-800/60 text-gray-900 dark:text-white shadow-md font-bold'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-white/20 dark:hover:bg-gray-800/30'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-teal-600 dark:text-teal-400' : 'text-gray-500'}`} />
                <span>{tab.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="activeDashboardTab"
                    className="absolute inset-0 bg-teal-500/10 dark:bg-teal-400/10 rounded-2xl border border-teal-500/30"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
              </button>
            );
          })}

          {username && (
            <div className="pt-2 mt-2 border-t border-gray-200/50 dark:border-gray-800/50 flex md:flex-col">
              <a
                href={`/${username}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs lg:text-sm font-medium transition-all text-left w-full cursor-pointer text-teal-600 dark:text-teal-400 hover:bg-teal-500/10 dark:hover:bg-teal-400/10 bg-teal-500/5 dark:bg-teal-400/5 border border-teal-500/20 dark:border-teal-400/20"
              >
                <Eye className="w-4 h-4 shrink-0" />
                <span>预览公开主页</span>
                <ExternalLink className="w-3.5 h-3.5 ml-auto opacity-70" />
              </a>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

