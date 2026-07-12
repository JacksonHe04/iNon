import { getReadmeData } from '@/lib/content';
import { getLayoutConfig } from '@/lib/content/layout';
import { requireOwnerPage } from '@/lib/auth/user';
import ShellLayout from '@/components/layout/ShellLayout';

interface DashboardLayoutProps {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}

export const dynamic = 'force-dynamic';

export default async function DashboardLayout({
  children,
  params,
}: DashboardLayoutProps) {
  const { slug } = await params;
  await requireOwnerPage(slug, `/i/${slug}`);
  const [data, layoutConfig] = await Promise.all([
    getReadmeData(slug),
    getLayoutConfig(slug),
  ]);

  return (
    <ShellLayout
      data={data}
      username={slug}
      showSideNav={false}
      theme={layoutConfig.theme}
    >
      {children}
    </ShellLayout>
  );
}
