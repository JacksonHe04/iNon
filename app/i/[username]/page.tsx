import { getReadmeData } from '@/lib/content';
import ShellLayout from '@/components/layout/ShellLayout';
import GlassCard from '@/components/GlassCard';
import Link from 'next/link';
import {
  Bookmark,
  AppWindow,
  Users,
  Briefcase,
  Music,
  Film,
  BookOpen,
  Gamepad2,
  Sliders,
  ExternalLink,
  Eye,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

interface UserDashboardPageProps {
  params: Promise<{ username: string }>;
}

export default async function UserDashboardPage({ params }: UserDashboardPageProps) {
  const { username } = await params;
  const data = await getReadmeData(username);

  return (
    <ShellLayout data={data} username={username} showSideNav={false}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8 text-gray-800 dark:text-gray-100">
        
        {/* Header Title Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/20 pb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-500/30">
                Personal OS Dashboard
              </span>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                {data.basic.name} 的个人管理控制台
              </h1>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              /i/{username} — 管理你的快捷入口、常用卡片库与个人公开页面配置
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href={`/${username}`}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-medium text-sm shadow-md hover:opacity-90 transition"
            >
              <Eye className="w-4 h-4" />
              <span>访客视角预览</span>
            </Link>
          </div>
        </div>

        {/* Section 1: 快捷入口类 (Shortcuts & Portals) */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-white">
            <Sliders className="w-5 h-5 text-teal-500" />
            <h2>快捷入口 Block</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 网站收藏夹 */}
            <GlassCard className="p-5 flex flex-col justify-between space-y-4 hover:border-teal-400/50 transition">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400">
                    <Bookmark className="w-5 h-5" />
                  </div>
                  <h3 className="font-semibold text-base">网站收藏夹</h3>
                </div>
                <span className="text-xs text-gray-400 font-mono">01</span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                整理并快速访问你最常用的工具网站与深度资源
              </p>
              <div className="pt-2 border-t border-white/20 flex items-center justify-between text-xs text-teal-600 dark:text-teal-300 font-medium">
                <span>管理收藏列表</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </div>
            </GlassCard>

            {/* App 入口 */}
            <GlassCard className="p-5 flex flex-col justify-between space-y-4 hover:border-purple-400/50 transition">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400">
                    <AppWindow className="w-5 h-5" />
                  </div>
                  <h3 className="font-semibold text-base">App 启动器</h3>
                </div>
                <span className="text-xs text-gray-400 font-mono">02</span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                一键启动工作流常用软件、Web App 与本地自动化
              </p>
              <div className="pt-2 border-t border-white/20 flex items-center justify-between text-xs text-purple-600 dark:text-purple-300 font-medium">
                <span>配置应用入口</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </div>
            </GlassCard>

            {/* 人物卡片 */}
            <GlassCard className="p-5 flex flex-col justify-between space-y-4 hover:border-blue-400/50 transition">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                    <Users className="w-5 h-5" />
                  </div>
                  <h3 className="font-semibold text-base">关键联系人</h3>
                </div>
                <span className="text-xs text-gray-400 font-mono">03</span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                主要联系人卡片与一键沟通入口
              </p>
              <div className="pt-2 border-t border-white/20 flex items-center justify-between text-xs text-blue-600 dark:text-blue-300 font-medium">
                <span>查看通讯录</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </div>
            </GlassCard>

            {/* 项目卡片 */}
            <GlassCard className="p-5 flex flex-col justify-between space-y-4 hover:border-emerald-400/50 transition">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    <Briefcase className="w-5 h-5" />
                  </div>
                  <h3 className="font-semibold text-base">项目摘要</h3>
                </div>
                <span className="text-xs text-gray-400 font-mono">04</span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                个人、工作与学习项目的进展追踪与快速跳转
              </p>
              <div className="pt-2 border-t border-white/20 flex items-center justify-between text-xs text-emerald-600 dark:text-emerald-300 font-medium">
                <span>进入项目面板</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </div>
            </GlassCard>
          </div>
        </section>

        {/* Section 2: 内容库管理 (Libraries) */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-white">
            <BookOpen className="w-5 h-5 text-purple-500" />
            <h2>内容库管理 Block</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <GlassCard className="p-5 space-y-3">
              <div className="flex items-center gap-2 font-semibold">
                <Music className="w-4 h-4 text-pink-500" />
                <span>音乐 / 歌曲 ({data.music.songs.length})</span>
              </div>
              <p className="text-xs text-gray-500">管理正在播放与音乐收藏</p>
            </GlassCard>

            <GlassCard className="p-5 space-y-3">
              <div className="flex items-center gap-2 font-semibold">
                <Film className="w-4 h-4 text-amber-500" />
                <span>影片海报墙 ({data.films.films.length})</span>
              </div>
              <p className="text-xs text-gray-500">看过/想看的全量影片档案</p>
            </GlassCard>

            <GlassCard className="p-5 space-y-3">
              <div className="flex items-center gap-2 font-semibold">
                <BookOpen className="w-4 h-4 text-indigo-500" />
                <span>书架档案 ({data.reading.books.length})</span>
              </div>
              <p className="text-xs text-gray-500">在读与推荐书目管理</p>
            </GlassCard>

            <GlassCard className="p-5 space-y-3">
              <div className="flex items-center gap-2 font-semibold">
                <Gamepad2 className="w-4 h-4 text-green-500" />
                <span>游戏收藏</span>
              </div>
              <p className="text-xs text-gray-500">通关/在玩游戏榜单与评论</p>
            </GlassCard>
          </div>
        </section>
      </div>
    </ShellLayout>
  );
}
