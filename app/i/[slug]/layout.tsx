import type { ReactNode } from 'react';
import { getReadmeData } from '@/lib/content';
import { getLayoutConfig } from '@/lib/content/layout';
import { requireOwnerPage } from '@/lib/auth/user';
import { listOwnerMessages } from '@/lib/content/messages';
import ShellLayout from '@/components/layout/ShellLayout';
import DashboardLayoutClient from '@/components/dashboard/DashboardLayoutClient';

export const dynamic = 'force-dynamic';

interface UserDashboardLayoutProps {
  children: ReactNode;
  params: Promise<{ slug: string }>;
}

export default async function UserDashboardLayout({ children, params }: UserDashboardLayoutProps) {
  const { slug } = await params;
  const userContext = await requireOwnerPage(slug, `/i/${slug}`);
  
  const [data, layoutConfig, ownerMessages] = await Promise.all([
    getReadmeData(slug),
    getLayoutConfig(slug),
    listOwnerMessages(userContext.profile.id).catch((err) => {
      console.error('Failed to load owner messages in layout:', err);
      return [];
    }),
  ]);

  return (
    <ShellLayout data={data} publicPath={`/${slug}`} showSideNav={true} blocks={layoutConfig.blocks} theme={layoutConfig.theme}>
      <div className="relative min-h-screen">
        <div className="w-full py-2">
          <DashboardLayoutClient
            username={slug}
            readmeData={data}
            layoutConfig={layoutConfig}
            ownerMessages={ownerMessages}
            userContext={userContext}
          >
            {children}
          </DashboardLayoutClient>
        </div>
      </div>
    </ShellLayout>
  );

}
