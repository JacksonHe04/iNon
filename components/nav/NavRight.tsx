import { useSyncExternalStore, useTransition, type Dispatch, type SetStateAction } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Bell, Sun, Moon } from 'lucide-react';
import SocialLinks from './SocialLinks';
import UserInfoMenu from './UserInfoMenu';
import WorldTopNavControls from './WorldTopNavControls';
import type { ReadmeData } from '@/types';
import type { TopNavSession } from './types';
import { APP_EVENTS, addAppEventListener, dispatchAppEvent } from '@/lib/dom-events';
import { useUniversalTopNav } from './useUniversalTopNav';
import CurrentTime from './CurrentTime';

interface NavRightProps {
  data: ReadmeData;
  session: TopNavSession | null;
  shouldShowBadge: boolean;
  theme: string | undefined;
  setTheme: (theme: string) => void;
  setShowNotifications: Dispatch<SetStateAction<boolean>>;
  markNotificationsRead: () => void;
  setShowAuthModal: (show: boolean) => void;
}

function subscribeToLocationChange(onStoreChange: () => void) {
  window.addEventListener('popstate', onStoreChange);
  const removeLocationChange = addAppEventListener(APP_EVENTS.locationChange, onStoreChange);
  return () => {
    window.removeEventListener('popstate', onStoreChange);
    removeLocationChange();
  };
}

export function NavRight({
  data,
  session,
  shouldShowBadge,
  theme,
  setTheme,
  setShowNotifications,
  markNotificationsRead,
  setShowAuthModal,
}: NavRightProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const experience = useUniversalTopNav((state) => state.experience);
  const worldControls = useUniversalTopNav((state) => state.worldControls);
  const currentPath = useSyncExternalStore(
    subscribeToLocationChange,
    () => window.location.pathname,
    () => pathname ?? '',
  );

  const activeIsConsolePage = currentPath.startsWith('/i/');
  const username = session?.username || session?.email.split('@')[0] || '';
  const primaryPath = activeIsConsolePage ? `/${username}` : `/i/${username}/home`;

  const navigateTo = (targetPath: string) => {
    const eventDispatched = dispatchAppEvent(
      APP_EVENTS.toggleConsolePreview,
      { targetPath },
      { cancelable: true },
    );

    if (!eventDispatched) {
      return;
    }

    startTransition(() => router.push(targetPath));
  };

  return (
    <div className={`archive-nav-actions flex items-center gap-1 sm:gap-2 lg:gap-4 ${experience ? 'is-experience' : ''}`}>
      <SocialLinks platformAccounts={data.contact.platform_accounts} />

      {experience?.mode === 'world' && worldControls ? <WorldTopNavControls controls={worldControls} /> : null}

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
        className="archive-nav-global-control relative w-10 h-10 flex items-center justify-center rounded-lg border border-white/40 bg-white/30 text-gray-700 transition hover:border-purple-200 hover:text-purple-600 cursor-pointer"
        aria-label="查看通知"
      >
        <Bell className="h-4 w-4" />
        {shouldShowBadge && (
          <span className="absolute -top-1 -right-1 min-w-[1.2rem] h-4 px-1 bg-gray-100 text-gray-700 rounded-full text-[10px] flex items-center justify-center font-semibold">
            {data.notifications.length}
          </span>
        )}
      </button>

      {/* Theme Switcher Button */}
      <button
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        className="archive-nav-global-control w-10 h-10 flex items-center justify-center rounded-lg border border-white/40 bg-white/30 text-gray-700 dark:text-gray-200 transition hover:border-teal-300 hover:text-teal-500"
        aria-label="切换主题"
        title="切换暗黑/亮色主题"
      >
        {theme === 'dark' ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-slate-700" />}
      </button>

      <CurrentTime />

      <UserInfoMenu
        session={session}
        isConsolePage={activeIsConsolePage}
        isPending={isPending}
        onLogin={() => setShowAuthModal(true)}
        onPrimaryAction={() => navigateTo(primaryPath)}
        onPrimaryPrefetch={() => {
          if (session) router.prefetch(primaryPath);
        }}
      />
    </div>
  );
}
export default NavRight;
