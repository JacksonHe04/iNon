import Link from 'next/link';
import { motion } from 'framer-motion';
import { LayoutDashboard, Library, Palette, UserCog, BarChart3 } from 'lucide-react';

export const DASHBOARD_TABS = [
  { id: 'home', label: '控制台', icon: LayoutDashboard, path: '' },
  { id: 'content', label: '内容管理', icon: Library, path: '/content' },
  { id: 'canvas', label: '公开网站', icon: Palette, path: '/website' },
  { id: 'analytics', label: '数据统计', icon: BarChart3, path: '/analytics' },
  { id: 'account', label: '账号管理', icon: UserCog, path: '/account' },
] as const;

export type DashboardTabId = (typeof DASHBOARD_TABS)[number]['id'];

interface DashboardSideNavProps {
  activeTab: DashboardTabId;
  className?: string;
  username: string;
}

export default function DashboardSideNav({ activeTab, className = '', username }: DashboardSideNavProps) {
  return (
    <aside className={`w-full md:w-52 lg:w-60 shrink-0 md:sticky md:top-24 z-30 ${className}`}>
      <div className="rounded-3xl border border-white/30 bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl p-3 shadow-xl">
        <div className="flex flex-row md:flex-col gap-1.5 overflow-x-auto scrollbar-none">
          {DASHBOARD_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            const targetUrl = `/i/${username}${tab.path}`;
            return (
              <Link
                key={tab.id}
                href={targetUrl}
                className={`relative flex items-center gap-2.5 px-4 py-3 rounded-2xl text-xs lg:text-sm font-medium transition-all whitespace-nowrap text-left w-full cursor-pointer ${
                  isActive
                    ? 'bg-white/50 dark:bg-gray-800/60 text-gray-900 dark:text-white shadow-md font-bold'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-white/20 dark:hover:bg-gray-800/30'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-teal-600 dark:text-teal-400' : 'text-gray-500'}`} />
                <span className="relative z-10">{tab.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="activeDashboardTab"
                    className="absolute inset-0 bg-teal-500/10 dark:bg-teal-400/10 rounded-2xl border border-teal-500/30"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </aside>
  );
}

