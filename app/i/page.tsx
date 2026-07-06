import { getReadmeData } from '@/lib/content';
import { getPrimaryUsername, requireUserPage } from '@/lib/auth/user';
import ShellLayout from '@/components/layout/ShellLayout';
import DashboardClient from '@/components/dashboard/DashboardClient';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function DefaultUserDashboardPage() {
  const context = await requireUserPage('/i');
  const username = getPrimaryUsername(context.profile);

  if (username) {
    redirect(`/i/${username}`);
  }

  const data = await getReadmeData('');

  return (
    <ShellLayout data={data} username={username} showSideNav={false}>
      <DashboardClient username={username} data={data} />
    </ShellLayout>
  );
}
