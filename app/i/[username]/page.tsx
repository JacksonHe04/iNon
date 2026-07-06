import { getReadmeData } from '@/lib/content';
import { requireOwnerPage } from '@/lib/auth/user';
import ShellLayout from '@/components/layout/ShellLayout';
import DashboardClient from '@/components/dashboard/DashboardClient';

export const dynamic = 'force-dynamic';

interface UserDashboardPageProps {
  params: Promise<{ username: string }>;
}

export default async function UserDashboardPage({ params }: UserDashboardPageProps) {
  const { username } = await params;
  await requireOwnerPage(username, `/i/${username}`);
  const data = await getReadmeData(username);

  return (
    <ShellLayout data={data} username={username} showSideNav={false}>
      <DashboardClient username={username} data={data} />
    </ShellLayout>
  );
}
