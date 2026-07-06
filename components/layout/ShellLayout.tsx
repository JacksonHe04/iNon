import type { ReactNode } from 'react';
import type { ReadmeData } from '@/types';
import type { BlockConfig } from '@/types/layout';
import HeaderNav from '@/components/layout/HeaderNav';
import SideNav from '@/components/SideNav';
import { AnimatedGradientBackground } from '@/components/BackGround';

interface ShellLayoutProps {
  children: ReactNode;
  data: ReadmeData;
  username?: string;
  showSideNav?: boolean;
  blocks?: BlockConfig[];
}

export default function ShellLayout({
  children,
  data,
  username = '',
  showSideNav = true,
  blocks,
}: ShellLayoutProps) {
  return (
    <main className="relative min-h-screen">
      <AnimatedGradientBackground />
      <HeaderNav data={data} username={username} />
      {showSideNav && <SideNav blocks={blocks} />}
      <div className={`pt-24 transition-all duration-300 ${showSideNav ? 'lg:pl-32 xl:pl-40 2xl:pl-48' : 'px-4 sm:px-6 lg:px-8'}`}>
        {children}
      </div>
    </main>
  );
}

