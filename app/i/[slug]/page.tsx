import { getReadmeData } from '@/lib/content';
import { requireOwnerPage } from '@/lib/auth/user';
import ShellLayout from '@/components/layout/ShellLayout';
import DashboardClient from '@/components/dashboard/DashboardClient';

export const dynamic = 'force-dynamic';

interface UserDashboardPageProps {
  params: Promise<{ slug: string }>;
}

export default async function UserDashboardPage({ params }: UserDashboardPageProps) {
  const { slug } = await params;
  await requireOwnerPage(slug, `/i/${slug}`);
  const data = await getReadmeData(slug);

  return (
    <ShellLayout data={data} username={slug} showSideNav={false}>
      <DashboardClient username={slug} data={data} />
    </ShellLayout>
  );
}
