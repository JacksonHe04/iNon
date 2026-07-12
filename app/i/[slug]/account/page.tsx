import { getReadmeData } from '@/lib/content';
import { getLayoutConfig } from '@/lib/content/layout';
import { requireOwnerPage } from '@/lib/auth/user';
import DashboardClient from '@/components/dashboard/DashboardClient';

export const dynamic = 'force-dynamic';

interface UserDashboardPageProps {
  params: Promise<{ slug: string }>;
}

export default async function UserAccountPage({ params }: UserDashboardPageProps) {
  const { slug } = await params;
  const userContext = await requireOwnerPage(slug, `/i/${slug}/account`);
  const [data, layoutConfig] = await Promise.all([
    getReadmeData(slug),
    getLayoutConfig(slug),
  ]);

  const initialEmail = userContext.user.email;
  const initialSlugs = userContext.profile.slugs;

  return (
    <DashboardClient
      username={slug}
      data={data}
      initialLayoutConfig={layoutConfig}
      activeTab="account"
      initialEmail={initialEmail}
      initialSlugs={initialSlugs}
    />
  );
}
