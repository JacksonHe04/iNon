import { getReadmeData } from '@/lib/content';
import AITestConsole from '@/components/dashboard/AITestConsole';
import ShortcutBookmarksManager from '@/components/dashboard/ShortcutBookmarksManager';
import ProjectShortcutsList from '@/components/dashboard/ProjectShortcutsList';

export const dynamic = 'force-dynamic';

interface UserDashboardPageProps {
  params: Promise<{ slug: string }>;
}

export default async function UserDashboardPage({ params }: UserDashboardPageProps) {
  const { slug } = await params;
  const data = await getReadmeData(slug);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* AI 对话框 */}
      <AITestConsole name={data.basic.name} />

      {/* 网页快捷入口 (Bookmarks Manager) */}
      <ShortcutBookmarksManager
        initialDevTools={data.development.dev_tools}
        developmentData={data.development}
      />

      {/* 项目快捷入口 */}
      <ProjectShortcutsList projects={data.development.projects} />
    </div>
  );
}
