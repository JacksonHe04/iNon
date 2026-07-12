'use client';

import { usePathname } from 'next/navigation';
import DashboardSideNav, { type DashboardTabId } from '@/components/layout/DashboardSideNav';

export default function DashboardLayoutClient({
  username,
  children,
}: {
  username: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  let activeTab: DashboardTabId = 'home';
  if (pathname.endsWith('/content')) activeTab = 'content';
  else if (pathname.endsWith('/library')) activeTab = 'library';
  else if (pathname.endsWith('/website')) activeTab = 'canvas';
  else if (pathname.endsWith('/messages')) activeTab = 'messages';
  else if (pathname.endsWith('/analytics')) activeTab = 'analytics';
  else if (pathname.endsWith('/account')) activeTab = 'account';

  return (
    <div className="flex flex-col md:flex-row gap-6 lg:gap-8 items-start">
      <DashboardSideNav username={username} activeTab={activeTab} />
      <main className="flex-1 min-w-0 space-y-6 w-full">
        {children}
      </main>
    </div>
  );
}
