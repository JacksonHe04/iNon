import { getReadmeData } from '@/lib/content';
import { getPrimaryUsername, requireUserPage } from '@/lib/auth/user';
import ShellLayout from '@/components/layout/ShellLayout';
import ConsoleHomeContent from '@/components/dashboard/ConsoleHomeContent';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function DefaultUserDashboardPage() {
  const context = await requireUserPage('/i');
  const targetSlug = getPrimaryUsername(context.profile) || context.profile.slug;

  if (targetSlug) {
    redirect(`/i/${targetSlug}/home`);
  }

  const data = await getReadmeData('');

  return (
    <ShellLayout data={data} username="" showSideNav={false}>
      <ConsoleHomeContent data={data} />
    </ShellLayout>
  );
}
