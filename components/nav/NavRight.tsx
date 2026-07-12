import React from 'react';
import { Bell, Sun, Moon, Eye, Loader2, User } from 'lucide-react';
import SocialLinks from './SocialLinks';
import type { ReadmeData } from '@/types';

interface NavRightProps {
  data: ReadmeData;
  userEmail: string | null;
  shouldShowBadge: boolean;
  isMounted: boolean;
  currentTime: string;
  isConsolePage: boolean;
  isPending: boolean;
  theme: string | undefined;
  setTheme: (theme: string) => void;
  setShowNotifications: (show: any) => void;
  markNotificationsRead: () => void;
  handlePrefetch: () => void;
  setShowAuthModal: (show: boolean) => void;
  startTransition: (cb: () => void) => void;
  router: any;
}

export function NavRight({
  data,
  userEmail,
  shouldShowBadge,
  isMounted,
  currentTime,
  isConsolePage,
  isPending,
  theme,
  setTheme,
  setShowNotifications,
  markNotificationsRead,
  handlePrefetch,
  setShowAuthModal,
  startTransition,
  router,
}: NavRightProps) {
  return (
    <div className="flex items-center gap-2 lg:gap-4">
      <SocialLinks platformAccounts={data.contact.platform_accounts} />

      <button
        onClick={() => {
          setShowNotifications((prev: boolean) => {
            const next = !prev;
            if (next) {
              markNotificationsRead();
            }
            return next;
          });
        }}
        className="relative w-8 h-8 flex items-center justify-center rounded-lg border border-white/40 bg-white/30 text-gray-700 transition hover:border-purple-200 hover:text-purple-600 cursor-pointer"
        aria-label="查看通知"
      >
        <Bell className="h-4 w-4" />
        {shouldShowBadge && (
          <span className="absolute -top-1 -right-1 min-w-[1.2rem]. h-4 px-1 bg-gray-100 text-gray-700 rounded-full text-[10px] flex items-center justify-center font-semibold">
            {data.notifications.length}
          </span>
        )}
      </button>

      {/* Theme Switcher Button */}
      <button
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        className="w-8 h-8 flex items-center justify-center rounded-lg border border-white/40 bg-white/30 text-gray-700 dark:text-gray-200 transition hover:border-teal-300 hover:text-teal-500"
        aria-label="切换主题"
        title="切换暗黑/亮色主题"
      >
        {theme === 'dark' ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-slate-700" />}
      </button>

      <div className="hidden md:block text-xs lg:text-sm font-mono">{isMounted ? currentTime : ''}</div>

      {/* UserInfo Button */}
      <button
        onClick={() => {
          if (userEmail) {
            const name = userEmail.split('@')[0];
            const targetPath = isConsolePage ? `/${name}` : `/i/${name}`;
            startTransition(() => {
              router.push(targetPath);
            });
          } else {
            setShowAuthModal(true);
          }
        }}
        onMouseEnter={handlePrefetch}
        className="w-8 h-8 flex items-center justify-center rounded-lg border border-white/40 bg-white/30 text-gray-700 dark:text-gray-200 transition hover:border-purple-200 hover:text-purple-600 cursor-pointer"
        title={userEmail ? (isConsolePage ? "预览公开主页" : "进入我的个人 OS 控制台") : "登录"}
        aria-label={userEmail ? (isConsolePage ? "预览公开主页" : "进入控制台") : "登录"}
      >
        {isPending ? (
          <Loader2 className="h-4 w-4 animate-spin text-teal-500" />
        ) : isConsolePage ? (
          <Eye className="h-4 w-4" />
        ) : (
          <User className="h-4 w-4" />
        )}
      </button>
    </div>
  );
}
export default NavRight;
