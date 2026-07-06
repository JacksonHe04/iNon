import type { ReactNode } from 'react';
import type { ReadmeData } from '@/types';
import HeaderNav from '@/components/layout/HeaderNav';
import SideNav from '@/components/SideNav';
import { AnimatedGradientBackground } from '@/components/BackGround';

interface ShellLayoutProps {
  children: ReactNode;
  data: ReadmeData;
  username?: string;
  showSideNav?: boolean;
}

export default function ShellLayout({
  children,
  data,
  username = 'yingying',
  showSideNav = true,
}: ShellLayoutProps) {
  return (
    <main className="relative min-h-screen">
      <AnimatedGradientBackground />
      <HeaderNav data={data} username={username} />
      {showSideNav && <SideNav />}
      <div className="pt-24 lg:pl-32 xl:pl-40 2xl:pl-48 transition-all duration-300">
        {children}
      </div>
    </main>
  );
}
