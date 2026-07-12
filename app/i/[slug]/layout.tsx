import type { ReactNode } from 'react';
import { getReadmeData } from '@/lib/content';
import { getLayoutConfig } from '@/lib/content/layout';
import { requireOwnerPage } from '@/lib/auth/user';
import ShellLayout from '@/components/layout/ShellLayout';
import DashboardLayoutClient from '@/components/dashboard/DashboardLayoutClient';

export const dynamic = 'force-dynamic';

interface UserDashboardLayoutProps {
  children: ReactNode;
  params: Promise<{ slug: string }>;
}

export default async function UserDashboardLayout({ children, params }: UserDashboardLayoutProps) {
  const { slug } = await params;
  await requireOwnerPage(slug, `/i/${slug}`);
  
  const [data, layoutConfig] = await Promise.all([
    getReadmeData(slug),
    getLayoutConfig(slug),
  ]);

  return (
    <ShellLayout data={data} username={slug} showSideNav={false} theme={layoutConfig.theme}>
      <div className="relative min-h-screen">
        <div className="w-full py-2">
          <DashboardLayoutClient username={slug}>
            {children}
          </DashboardLayoutClient>
        </div>
      </div>
    </ShellLayout>
  );
}
