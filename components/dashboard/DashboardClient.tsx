'use client';

import { useState } from 'react';
import type { ReadmeData } from '@/types';
import GlassCard from '@/components/GlassCard';
import DashboardSideNav, { type DashboardTabId } from '@/components/layout/DashboardSideNav';
import PasswordResetForm from '@/components/auth/PasswordResetForm';
import Link from 'next/link';
import {
  Sparkles,
  Globe,
  Briefcase,
  Music,
  Film,
  BookOpen,
  Gamepad2,
  Eye,
  Plus,
  Trash2,
  Edit3,
  Check,
  ExternalLink,
  Bot,
  Layers,
} from 'lucide-react';
import BlockContentEditorManager from '@/components/editor/BlockContentEditorManager';

interface DashboardClientProps {
  username: string;
  data: ReadmeData;
}

export default function DashboardClient({ username, data }: DashboardClientProps) {
  const [activeTab, setActiveTab] = useState<DashboardTabId>('home');

  // Interactive inline editing states for bookmarks and projects
  const [bookmarks, setBookmarks] = useState([
    { id: '1', title: 'GitHub', url: 'https://github.com', icon: '🐙' },
    { id: '2', title: 'Vercel', url: 'https://vercel.com', icon: '▲' },
    { id: '3', title: 'Supabase', url: 'https://supabase.com', icon: '⚡' },
    { id: '4', title: 'Antigravity CLI', url: 'https://deepmind.google', icon: '🤖' },
  ]);

  const [editingBookmarkId, setEditingBookmarkId] = useState<string | null>(null);
  const [newBookmarkTitle, setNewBookmarkTitle] = useState('');
  const [newBookmarkUrl, setNewBookmarkUrl] = useState('');

  const [aiPrompt, setAiPrompt] = useState('');
  const [aiLog, setAiLog] = useState<Array<{ role: 'user' | 'bot'; content: string }>>([
    { role: 'bot', content: `你好 ${data.basic.name}！我是你的 AI 分身助手。在主页随时与我测试对话吧！` },
  ]);

  const handleSendAi = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;
    const userMsg = aiPrompt;
    setAiLog((prev) => [...prev, { role: 'user', content: userMsg }]);
    setAiPrompt('');

    setTimeout(() => {
      setAiLog((prev) => [
        ...prev,
        {
          role: 'bot',
          content: `收到了你的消息："${userMsg}"。我已经同步学习了你的个人知识库！`,
        },
      ]);
    }, 600);
  };

  const handleAddBookmark = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBookmarkTitle || !newBookmarkUrl) return;
    setBookmarks((prev) => [
      ...prev,
      {
        id: String(Date.now()),
        title: newBookmarkTitle,
        url: newBookmarkUrl,
        icon: '🔗',
      },
    ]);
    setNewBookmarkTitle('');
    setNewBookmarkUrl('');
  };

  const handleDeleteBookmark = (id: string) => {
    setBookmarks((prev) => prev.filter((b) => b.id !== id));
  };

  return (
    <div className="relative min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Banner Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/20 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-500/20 text-teal-700 dark:text-teal-300 border border-teal-500/30">
                iNon Personal OS
              </span>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                {data.basic.name} 的个人控制台
              </h1>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-mono">
              /i/{username} — 直接管理你的核心 Block 与个人网站
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href={`/${username}`}
              target="_blank"
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-medium text-sm shadow-md hover:opacity-90 transition"
            >
              <Eye className="w-4 h-4" />
              <span>访客视角预览</span>
            </Link>
          </div>
        </div>

        {/* Side Nav & Main Body Layout */}
        <div className="flex flex-col md:flex-row gap-6 lg:gap-8 items-start">
          <DashboardSideNav activeTab={activeTab} onTabChange={setActiveTab} />

          <main className="flex-1 min-w-0 space-y-6 w-full">

        {/* Tab 1: 主页 (Home: AI对话框、网页快捷入口、项目快捷入口) */}
        {activeTab === 'home' && (
          <div className="space-y-6 animate-fadeIn">
            {/* AI 对话框 */}
            <GlassCard className="p-6 space-y-4 border-teal-500/30">
              <div className="flex items-center gap-2 text-teal-600 dark:text-teal-400 font-bold text-base">
                <Bot className="w-5 h-5" />
                <h2>AI 分身对话测试面板</h2>
              </div>

              <div className="bg-white/40 dark:bg-black/40 rounded-2xl p-4 h-48 overflow-y-auto space-y-3 border border-white/20 text-xs">
                {aiLog.map((log, idx) => (
                  <div
                    key={idx}
                    className={`flex gap-2 ${log.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] px-3.5 py-2 rounded-2xl ${
                        log.role === 'user'
                          ? 'bg-teal-500 text-white'
                          : 'bg-white/70 dark:bg-gray-800/80 text-gray-800 dark:text-gray-100 border border-white/30'
                      }`}
                    >
                      {log.content}
                    </div>
                  </div>
                ))}
              </div>

              <form onSubmit={handleSendAi} className="flex gap-2">
                <input
                  type="text"
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="测试输入指令与 AI 分身对话..."
                  className="flex-1 px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-teal-500 text-white text-sm font-semibold hover:bg-teal-600 transition"
                >
                  发送
                </button>
              </form>
            </GlassCard>

            {/* 网页快捷入口 (Bookmarks Manager) */}
            <GlassCard className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-base text-gray-900 dark:text-white">
                  <Globe className="w-5 h-5 text-teal-500" />
                  <h2>网页快捷入口 Block (直接编辑)</h2>
                </div>
                <span className="text-xs text-gray-500 font-mono">共 {bookmarks.length} 个入口</span>
              </div>

              {/* Bookmarks Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {bookmarks.map((b) => (
                  <div
                    key={b.id}
                    className="relative group p-3 rounded-xl bg-white/40 dark:bg-gray-800/40 border border-white/30 hover:border-teal-400/50 transition flex items-center justify-between"
                  >
                    <a
                      href={b.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-xs font-semibold text-gray-800 dark:text-gray-200 truncate pr-4"
                    >
                      <span>{b.icon}</span>
                      <span className="truncate">{b.title}</span>
                    </a>
                    <button
                      onClick={() => handleDeleteBookmark(b.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-rose-500 hover:bg-rose-500/10 rounded transition"
                      title="删除快捷方式"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Inline Add Bookmark Form */}
              <form onSubmit={handleAddBookmark} className="pt-3 border-t border-white/20 flex gap-2">
                <input
                  type="text"
                  required
                  placeholder="网站名称 (如: GitHub)"
                  value={newBookmarkTitle}
                  onChange={(e) => setNewBookmarkTitle(e.target.value)}
                  className="w-1/3 px-3 py-1.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white/50 text-xs focus:outline-none"
                />
                <input
                  type="url"
                  required
                  placeholder="网址 (https://...)"
                  value={newBookmarkUrl}
                  onChange={(e) => setNewBookmarkUrl(e.target.value)}
                  className="flex-1 px-3 py-1.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white/50 text-xs focus:outline-none"
                />
                <button
                  type="submit"
                  className="flex items-center gap-1 px-4 py-1.5 rounded-xl bg-teal-500 text-white text-xs font-semibold hover:bg-teal-600 transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>添加</span>
                </button>
              </form>
            </GlassCard>

            {/* 项目快捷入口 */}
            <GlassCard className="p-6 space-y-4">
              <div className="flex items-center gap-2 font-bold text-base text-gray-900 dark:text-white">
                <Briefcase className="w-5 h-5 text-purple-500" />
                <h2>项目快捷入口 Block</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data.development.projects.slice(0, 4).map((proj, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-white/40 dark:bg-gray-800/40 border border-white/30 space-y-2 hover:border-purple-400/50 transition"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-sm text-gray-900 dark:text-white">{proj.project_name}</h3>
                      <a
                        href={proj.link || proj.github}
                        target="_blank"
                        rel="noreferrer"
                        className="text-purple-600 dark:text-purple-400 text-xs flex items-center gap-1 hover:underline"
                      >
                        <span>查看项目</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2">{proj.description}</p>
                    <div className="flex flex-wrap gap-1 pt-1">
                      {proj.tech_stack.map((tech) => (
                        <span key={tech} className="px-2 py-0.5 rounded text-[10px] bg-purple-500/10 text-purple-600 border border-purple-500/20">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>
        )}

        {/* Tab 2: 内容库与公开页 Block 全量可视化编辑 (Block Editor Manager) */}
        {activeTab === 'content' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="border-b border-white/20 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="font-extrabold text-xl text-gray-900 dark:text-white flex items-center gap-2">
                  <Layers className="w-5 h-5 text-teal-500" />
                  <span>公开页 Block 全量可视化编辑控制台</span>
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  彻底编辑公开个人网站的所有 16 个核心 Block 分区，实时同步 Supabase 数据库
                </p>
              </div>
            </div>

            <BlockContentEditorManager data={data} />
          </div>
        )}

        {/* Tab 3: 公开网站配置 (Site Settings & Live Preview) */}
        {activeTab === 'settings' && (
          <div className="space-y-6 animate-fadeIn">
            <GlassCard className="p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-white/20 pb-4">
                <div>
                  <h2 className="font-bold text-lg text-gray-900 dark:text-white">公开个人网站实时配置</h2>
                  <p className="text-xs text-gray-500">配置并在下方实时预览你的个人公开主页 (/:username)</p>
                </div>
                <Link
                  href={`/${username}`}
                  target="_blank"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-500 text-white text-xs font-semibold shadow hover:bg-teal-600 transition"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>新标签页打开</span>
                </Link>
              </div>

              {/* Live Preview Iframe Box */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-gray-500 font-mono">
                  <span>LIVE PREVIEW</span>
                  <span>URL: /{username}</span>
                </div>
                <div className="w-full h-[600px] rounded-2xl overflow-hidden border border-white/30 shadow-2xl bg-black">
                  <iframe
                    src={`/${username}`}
                    title="Public Site Preview"
                    className="w-full h-full border-0"
                  />
                </div>
              </div>
            </GlassCard>
          </div>
        )}

        {/* Tab 4: 账号管理 (Account & Password Reset) */}
        {activeTab === 'account' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="border-b border-white/20 pb-4">
              <h2 className="font-bold text-lg text-gray-900 dark:text-white">账号管理与安全</h2>
              <p className="text-xs text-gray-500">管理你的 iNon OS 账号信息与安全凭证</p>
            </div>

            <PasswordResetForm />
          </div>
        )}
          </main>
        </div>
      </div>
    </div>
  );
}
