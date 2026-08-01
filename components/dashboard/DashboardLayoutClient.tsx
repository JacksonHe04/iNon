'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import dynamic from 'next/dynamic';
import DashboardSideNav, { type DashboardTabId } from '@/components/layout/DashboardSideNav';
import type { ReadmeData } from '@/types';
import type { OwnerMessage } from '@/lib/content/messages';
import type { UserContext } from '@/lib/auth/user';
import { fetchReadmeDataAction, fetchOwnerMessagesAction } from '@/lib/content/actions';
import { fetchAnalyticsData } from '@/lib/analytics/actions';
import { APP_EVENTS, dispatchAppEvent, addAppEventListener } from '@/lib/dom-events';
import { getDashboardPathForTab, getDashboardTabFromPath } from '@/components/layout/dashboard-routing';

// Loading Spinner for Code Splitting
const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-12">
    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal-500"></div>
  </div>
);

// Lazy Loaded Components
const AITestConsole = dynamic(() => import('@/components/dashboard/AITestConsole'), {
  ssr: false,
  loading: () => <LoadingSpinner />,
});

const ShortcutBookmarksManager = dynamic(() => import('@/components/dashboard/ShortcutBookmarksManager'), {
  ssr: false,
  loading: () => <LoadingSpinner />,
});

const ProjectShortcutsList = dynamic(() => import('@/components/dashboard/ProjectShortcutsList'), {
  ssr: false,
  loading: () => <LoadingSpinner />,
});

const BlockContentEditorManager = dynamic(() => import('@/components/editor/BlockContentEditorManager'), {
  ssr: false,
  loading: () => <LoadingSpinner />,
});

const LibraryEditorManager = dynamic(() => import('@/components/editor/LibraryEditorManager'), {
  ssr: false,
  loading: () => <LoadingSpinner />,
});

const WebsiteCanvasClient = dynamic(() => import('@/components/dashboard/WebsiteCanvasClient'), {
  ssr: false,
  loading: () => <LoadingSpinner />,
});

const MessageBoardManager = dynamic(() => import('@/components/dashboard/MessageBoardManager'), {
  ssr: false,
  loading: () => <LoadingSpinner />,
});

const AnalyticsSection = dynamic(() => import('@/components/account/AnalyticsSection'), {
  ssr: false,
  loading: () => <LoadingSpinner />,
});

const AccountSettingsForm = dynamic(() => import('@/components/account/AccountSettingsForm'), {
  ssr: false,
  loading: () => <LoadingSpinner />,
});

const PublicBlockRenderer = dynamic(() => import('@/components/blocks/PublicBlockRenderer'), {
  ssr: false,
  loading: () => <LoadingSpinner />,
});

// Analytics Section Wrapper for Dynamic Fetching
function AnalyticsSectionWrapper({ profileId }: { profileId: string }) {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalyticsData(profileId)
      .then((res) => setData(res))
      .catch((err) => {
        console.error('Failed to load analytics:', err);
        setError(err.message || '加载统计数据失败');
      });
  }, [profileId]);

  if (error) {
    return <div className="text-red-500 py-6 text-center">{error}</div>;
  }

  if (!data) {
    return <LoadingSpinner />;
  }

  return (
    <AnalyticsSection
      summary={data.summary}
      totals={data.totals}
      sources={data.sources}
      paths={data.paths}
      devices={data.devices}
      browsers={data.browsers}
      countries={data.countries}
    />
  );
}

export default function DashboardLayoutClient({
  username,
  children,
  readmeData,
  layoutConfig,
  ownerMessages,
  userContext,
}: {
  username: string;
  children: React.ReactNode;
  readmeData: ReadmeData;
  layoutConfig: any;
  ownerMessages: OwnerMessage[];
  userContext: UserContext;
}) {
  const pathname = usePathname();
  
  // Track client-side active tab override to bypass Next.js router transitions
  const [overrideTab, setOverrideTab] = useState<DashboardTabId | null>(null);
  
  // Track public preview mode (when path does not start with /i/)
  const [isPublicPreview, setIsPublicPreview] = useState(() => {
    if (typeof window !== 'undefined') {
      return !window.location.pathname.startsWith('/i/');
    }
    return false;
  });
  
  // Keep local copies of data structures to refresh in background or on tab switches
  const [localReadmeData, setLocalReadmeData] = useState<ReadmeData>(readmeData);
  const [localOwnerMessages, setLocalOwnerMessages] = useState<OwnerMessage[]>(ownerMessages);

  // Overwrite pushState and replaceState on client to fire locationchange events
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const originalPushState = window.history.pushState;
    const originalReplaceState = window.history.replaceState;

    window.history.pushState = function (...args) {
      originalPushState.apply(this, args);
      dispatchAppEvent(APP_EVENTS.pushState, undefined);
      dispatchAppEvent(APP_EVENTS.locationChange, undefined);
    };

    window.history.replaceState = function (...args) {
      originalReplaceState.apply(this, args);
      dispatchAppEvent(APP_EVENTS.replaceState, undefined);
      dispatchAppEvent(APP_EVENTS.locationChange, undefined);
    };

    return () => {
      window.history.pushState = originalPushState;
      window.history.replaceState = originalReplaceState;
    };
  }, []);

  // Sync state if props change (e.g. on full page hard refresh)
  useEffect(() => {
    setLocalReadmeData(readmeData);
  }, [readmeData]);

  useEffect(() => {
    setLocalOwnerMessages(ownerMessages);
  }, [ownerMessages]);

  // Compute standard active tab from current URL pathname
  const pathTab = getDashboardTabFromPath(pathname);
  const activeTab = overrideTab !== null ? overrideTab : pathTab;

  // Background refetch function to keep tabs content updated without freezing the UI
  const refetchData = (tabId: DashboardTabId) => {
    if (tabId === 'home' || tabId === 'content' || tabId === 'library' || tabId === 'canvas') {
      fetchReadmeDataAction(username)
        .then((res) => setLocalReadmeData(res))
        .catch((err) => console.error('Failed to background refresh readmeData:', err));
    }
    if (tabId === 'messages') {
      fetchOwnerMessagesAction(userContext.profile.id)
        .then((res) => setLocalOwnerMessages(res))
        .catch((err) => console.error('Failed to background refresh messages:', err));
    }
  };

  const handleTabChange = (tabId: DashboardTabId) => {
    setOverrideTab(tabId);
    setIsPublicPreview(false);
    const targetUrl = `/i/${username}${getDashboardPathForTab(tabId)}`;
    
    // Change URL in address bar instantly without Next.js routing roundtrip
    window.history.pushState(null, '', targetUrl);
    dispatchAppEvent(APP_EVENTS.locationChange, undefined);
    
    // Trigger background data sync
    refetchData(tabId);
  };

  // Intercept the preview toggle event sent by the header button
  useEffect(() => {
    const handleToggle = (e: Event) => {
      const customEvent = e as CustomEvent;
      const targetPath = customEvent.detail.targetPath;
      
      // Prevent Next.js router from triggering a network request
      customEvent.preventDefault();
      
      // Update browser URL address bar
      window.history.pushState(null, '', targetPath);
      dispatchAppEvent(APP_EVENTS.locationChange, undefined);
      
      const isPublic = !targetPath.includes('/i/');
      setIsPublicPreview(isPublic);
      
      if (!isPublic) {
        const newTab = getDashboardTabFromPath(targetPath);
        setOverrideTab(newTab);
        refetchData(newTab);
      } else {
        // Fetch latest data for public preview in background
        fetchReadmeDataAction(username)
          .then((res) => setLocalReadmeData(res))
          .catch((err) => console.error('Failed to background refresh readmeData for preview:', err));
      }
    };

    const removeToggle = addAppEventListener(APP_EVENTS.toggleConsolePreview, handleToggle);
    return () => removeToggle();
  }, [username, userContext.profile.id]);

  // Handle browser back and forward button clicks
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      const isPublic = !path.startsWith('/i/');
      setIsPublicPreview(isPublic);
      dispatchAppEvent(APP_EVENTS.locationChange, undefined);

      if (isPublic) {
        return;
      }

      const newTab = getDashboardTabFromPath(path);
      setOverrideTab(newTab);
      refetchData(newTab);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [username, userContext.profile.id]);

  // Render content depending on whether we overridden the tab client-side or we show the initial server children
  const renderContent = () => {
    if (overrideTab === null) {
      return children;
    }

    switch (overrideTab) {
      case 'home':
        return (
          <div className="space-y-6 animate-fadeIn">
            <AITestConsole name={localReadmeData.basic.name} />
            <ShortcutBookmarksManager
              initialDevTools={localReadmeData.development.dev_tools}
              developmentData={localReadmeData.development}
            />
            <ProjectShortcutsList projects={localReadmeData.development.projects} />
          </div>
        );
      case 'content':
        return (
          <div className="space-y-6 animate-fadeIn">
            <BlockContentEditorManager data={localReadmeData} />
          </div>
        );
      case 'library':
        return (
          <div className="space-y-6 animate-fadeIn">
            <LibraryEditorManager initialLibrary={localReadmeData.library} />
          </div>
        );
      case 'canvas':
        return <WebsiteCanvasClient data={localReadmeData} layoutConfig={layoutConfig} />;
      case 'messages':
        return (
          <div className="space-y-6 animate-fadeIn">
            <MessageBoardManager initialMessages={localOwnerMessages} />
          </div>
        );
      case 'analytics':
        return (
          <div className="space-y-6 animate-fadeIn">
            <AnalyticsSectionWrapper profileId={userContext.profile.id} />
          </div>
        );
      case 'account':
        return (
          <div className="space-y-6 animate-fadeIn">
            <AccountSettingsForm
              currentUsername={username}
              initialEmail={userContext.user.email}
              initialSlugs={userContext.profile.slugs}
            />
          </div>
        );
      default:
        return children;
    }
  };

  return (
    <div className="archive-dashboard-layout flex flex-col md:flex-row gap-6 lg:gap-8 items-start">
      {!isPublicPreview && (
        <DashboardSideNav username={username} activeTab={activeTab} onTabChange={handleTabChange} />
      )}
      <main className="archive-dashboard-main flex-1 min-w-0 space-y-6 w-full">
        {!isPublicPreview && (
          <header className="archive-workspace-header">
            <div>
              <p className="archive-kicker">Private editing room · {username}</p>
              <h1>{activeTab === 'home' ? '控制台' : activeTab === 'content' ? '内容档案' : activeTab === 'library' ? '私人收藏库' : activeTab === 'canvas' ? '公开展陈编排' : activeTab === 'messages' ? '来信与留言' : activeTab === 'analytics' ? '访问记录' : '账户卷宗'}</h1>
            </div>
            <span>AUTHORIZED / OWNER</span>
          </header>
        )}
        {isPublicPreview ? (
          <div className="w-full">
            <PublicBlockRenderer data={localReadmeData} layoutConfig={layoutConfig} />
          </div>
        ) : (
          <div className="archive-dashboard-content">{renderContent()}</div>
        )}
      </main>
    </div>
  );
}
