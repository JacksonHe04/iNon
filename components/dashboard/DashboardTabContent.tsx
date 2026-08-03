'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import type { DashboardTabId } from '@/components/layout/DashboardSideNav';
import { fetchAnalyticsData } from '@/lib/analytics/actions';
import type { UserContext } from '@/lib/auth/user';
import type { OwnerMessage } from '@/lib/content/messages';
import type { ReadmeData } from '@/types';
import type { LayoutConfig } from '@/types/layout';

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center p-12">
      <div className="h-8 w-8 animate-spin rounded-full border-teal-500 border-t-2 border-b-2" />
    </div>
  );
}

const AITestConsole = dynamic(() => import('./AITestConsole'), {
  ssr: false,
  loading: () => <LoadingSpinner />,
});
const ShortcutBookmarksManager = dynamic(() => import('./ShortcutBookmarksManager'), {
  ssr: false,
  loading: () => <LoadingSpinner />,
});
const ProjectShortcutsList = dynamic(() => import('./ProjectShortcutsList'), {
  ssr: false,
  loading: () => <LoadingSpinner />,
});
const BlockContentEditorManager = dynamic(
  () => import('@/components/editor/BlockContentEditorManager'),
  { ssr: false, loading: () => <LoadingSpinner /> }
);
const LibraryEditorManager = dynamic(
  () => import('@/components/editor/LibraryEditorManager'),
  { ssr: false, loading: () => <LoadingSpinner /> }
);
const WebsiteCanvasClient = dynamic(() => import('./WebsiteCanvasClient'), {
  ssr: false,
  loading: () => <LoadingSpinner />,
});
const MessageBoardManager = dynamic(() => import('./MessageBoardManager'), {
  ssr: false,
  loading: () => <LoadingSpinner />,
});
const AnalyticsSection = dynamic(
  () => import('@/components/account/AnalyticsSection'),
  { ssr: false, loading: () => <LoadingSpinner /> }
);
const AccountSettingsForm = dynamic(
  () => import('@/components/account/AccountSettingsForm'),
  { ssr: false, loading: () => <LoadingSpinner /> }
);
const PublicBlockRenderer = dynamic(
  () => import('@/components/blocks/PublicBlockRenderer'),
  { ssr: false, loading: () => <LoadingSpinner /> }
);

export function DashboardPublicPreview({
  data,
  layoutConfig,
}: {
  data: ReadmeData;
  layoutConfig: LayoutConfig;
}) {
  return <PublicBlockRenderer data={data} layoutConfig={layoutConfig} />;
}

function AnalyticsSectionWrapper({ profileId }: { profileId: string }) {
  const [data, setData] = useState<Awaited<ReturnType<typeof fetchAnalyticsData>> | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalyticsData(profileId)
      .then(setData)
      .catch((reason: unknown) => {
        console.error('Failed to load analytics:', reason);
        setError(reason instanceof Error ? reason.message : '加载统计数据失败');
      });
  }, [profileId]);

  if (error) return <div className="py-6 text-center text-red-500">{error}</div>;
  if (!data) return <LoadingSpinner />;
  return <AnalyticsSection {...data} />;
}

interface DashboardTabContentProps {
  activeTab: DashboardTabId | null;
  children: React.ReactNode;
  data: ReadmeData;
  layoutConfig: LayoutConfig;
  messages: OwnerMessage[];
  userContext: UserContext;
  username: string;
}

export default function DashboardTabContent({
  activeTab,
  children,
  data,
  layoutConfig,
  messages,
  userContext,
  username,
}: DashboardTabContentProps) {
  if (activeTab === null) return children;

  switch (activeTab) {
    case 'home':
      return (
        <div className="animate-fadeIn space-y-6">
          <AITestConsole name={data.basic.name} />
          <ShortcutBookmarksManager
            initialDevTools={data.development.dev_tools}
            developmentData={data.development}
          />
          <ProjectShortcutsList projects={data.development.projects} />
        </div>
      );
    case 'content':
      return <BlockContentEditorManager data={data} />;
    case 'library':
      return <LibraryEditorManager initialLibrary={data.library} />;
    case 'canvas':
      return <WebsiteCanvasClient data={data} layoutConfig={layoutConfig} />;
    case 'messages':
      return <MessageBoardManager initialMessages={messages} />;
    case 'analytics':
      return <AnalyticsSectionWrapper profileId={userContext.profile.id} />;
    case 'account':
      return (
        <AccountSettingsForm
          currentUsername={username}
          initialEmail={userContext.user.email}
          initialSlugs={userContext.profile.slugs}
        />
      );
    default:
      return children;
  }
}
