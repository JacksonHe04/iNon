import { getReadmeData } from '@/lib/content';
import { getPrimaryUsername, requireUserPage } from '@/lib/auth/user';
import ShellLayout from '@/components/layout/ShellLayout';
import DashboardClient from '@/components/dashboard/DashboardClient';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function DefaultUserDashboardPage() {
  const context = await requireUserPage('/i');
  const targetSlug = getPrimaryUsername(context.profile) || context.profile.slug;

  if (targetSlug) {
    redirect(`/i/${targetSlug}`);
  }

  const data = await getReadmeData('');

  return (
    <ShellLayout data={data} username={targetSlug} showSideNav={false}>
      <DashboardClient username={targetSlug} data={data} activeTab="home" />
    </ShellLayout>
  );
}
