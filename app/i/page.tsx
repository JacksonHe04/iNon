import { getReadmeData } from '@/lib/content';
import { getAdminContext } from '@/lib/admin/auth';
import ShellLayout from '@/components/layout/ShellLayout';
import DashboardClient from '@/components/dashboard/DashboardClient';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function DefaultUserDashboardPage() {
  const context = await getAdminContext();

  if (!context) {
    redirect('/login?next=/i');
  }

  const data = await getReadmeData('');
  const username = context.adminUser.display_name || 'JacksonHe04';

  return (
    <ShellLayout data={data} username={username} showSideNav={false}>
      <DashboardClient username={username} data={data} />
    </ShellLayout>
  );
}
