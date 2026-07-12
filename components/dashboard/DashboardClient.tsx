'use client';

import type { ReadmeData } from '@/types';
import DashboardSideNav, { type DashboardTabId } from '@/components/layout/DashboardSideNav';
import AccountSettingsForm from '@/components/account/AccountSettingsForm';
import BlockContentEditorManager from '@/components/editor/BlockContentEditorManager';
import BlockCanvasEngine from '@/components/blocks/BlockCanvasEngine';
import { GlassCardContext } from '@/components/GlassCard';
import type { LayoutConfig } from '@/types/layout';
import AITestConsole from './AITestConsole';
import ShortcutBookmarksManager from './ShortcutBookmarksManager';
import ProjectShortcutsList from './ProjectShortcutsList';

interface DashboardClientProps {
  username: string;
  data: ReadmeData;
  initialLayoutConfig?: LayoutConfig;
  activeTab: DashboardTabId;
  initialEmail?: string;
  initialSlugs?: string[];
}

export default function DashboardClient({
  username,
  data,
  initialLayoutConfig,
  activeTab,
  initialEmail,
  initialSlugs,
}: DashboardClientProps) {
  return (
    <div className="relative min-h-screen">
      <div className="w-full py-2">
        {/* Side Nav & Main Body Layout */}
        <div className="flex flex-col md:flex-row gap-6 lg:gap-8 items-start">
          <DashboardSideNav username={username} activeTab={activeTab} />

          <main className="flex-1 min-w-0 space-y-6 w-full">
            {/* Tab 1: 主页 (Home: AI对话框、网页快捷入口、项目快捷入口) */}
            {activeTab === 'home' && (
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
            )}

            {/* Tab 2: 内容库与公开页 Block 全量可视化编辑 (Block Editor Manager) */}
            {activeTab === 'content' && (
              <div className="space-y-6 animate-fadeIn">
                <BlockContentEditorManager data={data} />
              </div>
            )}

            {/* Tab 3: 公开网站 (Site Layout Canvas Editor) */}
            {activeTab === 'canvas' && (
              <div className="space-y-6 animate-fadeIn">
                <GlassCardContext.Provider value={{ hoverEnabled: false }}>
                  <BlockCanvasEngine
                    data={data}
                    mode="edit"
                    initialLayoutConfig={initialLayoutConfig}
                    onSave={async (layoutConfig: LayoutConfig) => {
                      const res = await fetch('/api/account/layout', {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ layoutConfig }),
                      });
                      if (!res.ok) {
                        const errData = await res.json();
                        throw new Error(errData.error || '保存排版方案失败');
                      }
                    }}
                  />
                </GlassCardContext.Provider>
              </div>
            )}

            {/* Tab 4: 账号管理 (Account, Username, Slugs & Password Reset) */}
            {activeTab === 'account' && (
              <div className="space-y-6 animate-fadeIn">
                <AccountSettingsForm
                  currentUsername={username}
                  initialEmail={initialEmail}
                  initialSlugs={initialSlugs}
                />
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
