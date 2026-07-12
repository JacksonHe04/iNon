import { getReadmeData } from '@/lib/content';
import { getPrimaryUsername, requireUserPage } from '@/lib/auth/user';
import ShellLayout from '@/components/layout/ShellLayout';
import AITestConsole from '@/components/dashboard/AITestConsole';
import ShortcutBookmarksManager from '@/components/dashboard/ShortcutBookmarksManager';
import ProjectShortcutsList from '@/components/dashboard/ProjectShortcutsList';
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
    <ShellLayout data={data} username="" showSideNav={false}>
      <div className="space-y-6 animate-fadeIn">
        <AITestConsole name={data.basic.name} />
        <ShortcutBookmarksManager
          initialDevTools={data.development.dev_tools}
          developmentData={data.development}
        />
        <ProjectShortcutsList projects={data.development.projects} />
      </div>
    </ShellLayout>
  );
}
