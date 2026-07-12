import { getReadmeData } from '@/lib/content';
import { getLayoutConfig } from '@/lib/content/layout';
import { requireOwnerPage } from '@/lib/auth/user';
import DashboardClient from '@/components/dashboard/DashboardClient';

export const dynamic = 'force-dynamic';

interface UserDashboardPageProps {
  params: Promise<{ slug: string }>;
}

export default async function UserWebsitePage({ params }: UserDashboardPageProps) {
  const { slug } = await params;
  await requireOwnerPage(slug, `/i/${slug}/website`);
  const [data, layoutConfig] = await Promise.all([
    getReadmeData(slug),
    getLayoutConfig(slug),
  ]);

  return (
    <DashboardClient
      username={slug}
      data={data}
      initialLayoutConfig={layoutConfig}
      activeTab="canvas"
    />
  );
}
