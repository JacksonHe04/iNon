'use client';

import { motion } from 'framer-motion';
import { Home, Library, Settings, UserCog } from 'lucide-react';

export const DASHBOARD_TABS = [
  { id: 'home', label: '主页', icon: Home },
  { id: 'content', label: '内容库管理', icon: Library },
  { id: 'settings', label: '公开网站配置', icon: Settings },
  { id: 'account', label: '账号管理', icon: UserCog },
] as const;

export type DashboardTabId = (typeof DASHBOARD_TABS)[number]['id'];

interface DashboardSideNavProps {
  activeTab: DashboardTabId;
  onTabChange: (tab: DashboardTabId) => void;
}

export default function DashboardSideNav({ activeTab, onTabChange }: DashboardSideNavProps) {
  return (
    <motion.nav
      initial={{ x: -100 }}
      animate={{ x: 0 }}
      className="fixed left-2 lg:left-4 -translate-y-1/2 z-40 hidden md:block"
      style={{ top: 'calc(50% + 40px)' }}
    >
      <div className="rounded-2xl border border-white/30 bg-white/30 backdrop-blur-xl p-3 shadow-lg">
        <div className="flex flex-col gap-1">
          {DASHBOARD_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`relative flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs lg:text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-white/30 text-gray-900 dark:text-white shadow-sm font-semibold'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-white/10'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-teal-600 dark:text-teal-400' : 'text-gray-500'}`} />
                <span>{tab.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="activeDashboardTab"
                    className="absolute inset-0 bg-white/20 rounded-xl border border-white/40"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </motion.nav>
  );
}
