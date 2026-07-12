import { useState, useEffect, type ReactNode } from 'react';
import type { ReadmeData } from '@/types';
import type { BlockConfig, ThemeType } from '@/types/layout';
import HeaderNav from '@/components/layout/HeaderNav';
import SideNav from '@/components/SideNav';

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
  const [currentPath, setCurrentPath] = useState(
    typeof window !== 'undefined' ? window.location.pathname : ''
  );

  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('locationchange', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('locationchange', handleLocationChange);
    };
  }, []);

  const isConsole = currentPath.startsWith('/i/') || currentPath === '';
  const actualShowSideNav = isConsole ? false : showSideNav;

  return (
    <main className="relative min-h-screen">
      <script
        dangerouslySetInnerHTML={{
          __html: `document.documentElement.setAttribute('data-color-theme', ${JSON.stringify(theme)})`,
        }}
      />
      <HeaderNav data={data} username={username} blocks={blocks} />
      {actualShowSideNav && <SideNav blocks={blocks} />}
      <div className={`pt-24 transition-all duration-300 ${actualShowSideNav ? 'lg:pl-32 xl:pl-40 2xl:pl-48' : 'px-4 sm:px-6 lg:px-8'}`}>
        {children}
      </div>
    </main>
  );
}

