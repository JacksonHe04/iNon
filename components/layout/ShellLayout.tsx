'use client';

import { useState, useEffect, type ReactNode } from 'react';
import type { ReadmeData } from '@/types';
import type { BlockConfig, ThemeType } from '@/types/layout';
import HeaderNav from '@/components/layout/HeaderNav';
import SideNav from '@/components/SideNav';
import { APP_EVENTS, dispatchAppEvent, addAppEventListener } from '@/lib/dom-events';

interface ShellLayoutProps {
  children: ReactNode;
  data: ReadmeData;
  username?: string;
  showSideNav?: boolean;
  blocks?: BlockConfig[];
  theme?: ThemeType;
}

export default function ShellLayout({
  children,
  data,
  username = '',
  showSideNav = true,
  blocks,
  theme = 'green',
}: ShellLayoutProps) {
  const [currentPath, setCurrentPath] = useState('');

  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
    };
    handleLocationChange();
    window.addEventListener('popstate', handleLocationChange);
    const removeLocationChange = addAppEventListener(APP_EVENTS.locationChange, handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      removeLocationChange();
    };
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-color-theme', theme);
    dispatchAppEvent(APP_EVENTS.colorThemeChanged, { theme });
  }, [theme]);

  const isConsole = currentPath.startsWith('/i/') || currentPath === '';
  const actualShowSideNav = isConsole ? false : showSideNav;

  return (
    <main className="relative min-h-screen archive-shell">
      <HeaderNav data={data} username={username} blocks={blocks} />
      {actualShowSideNav && <SideNav blocks={blocks} />}
      <div className={`pt-24 pb-16 transition-[padding] duration-500 ${actualShowSideNav ? 'lg:pl-32 xl:pl-40 2xl:pl-48' : 'px-4 sm:px-6 lg:px-8'}`}>
        {children}
      </div>
    </main>
  );
}
