'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, MessageSquare, RefreshCw } from 'lucide-react';
import GlassCard from '@/components/GlassCard';
import type { OwnerMessage } from '@/lib/content/messages';

interface MessageBoardManagerProps {
  initialMessages: OwnerMessage[];
}

function formatDateTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function MessageBoardManager({ initialMessages }: MessageBoardManagerProps) {
  const [messages, setMessages] = useState<OwnerMessage[]>(initialMessages);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const visibleCount = messages.filter((m) => m.visible).length;
  const hiddenCount = messages.length - visibleCount;

  const toggleVisibility = async (messageId: string, nextVisible: boolean) => {
    setPendingId(messageId);
    setMessages((prev) =>
      prev.map((m) => (m.id === messageId ? { ...m, visible: nextVisible } : m))
    );
    try {
      const res = await fetch('/api/account/messages', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageId, visible: nextVisible }),
      });
      if (!res.ok) throw new Error('toggle failed');
    } catch {
      // 回滚
      setMessages((prev) =>
        prev.map((m) => (m.id === messageId ? { ...m, visible: !nextVisible } : m))
      );
    } finally {
      setPendingId(null);
    }
  };

  const refresh = async () => {
    setRefreshing(true);
    try {
      const res = await fetch('/api/account/messages', { cache: 'no-store' });
      if (res.ok) {
        const data = (await res.json()) as { messages: OwnerMessage[] };
        setMessages(data.messages);
      }
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <div className="space-y-6">
      <GlassCard className="p-6 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-base text-gray-900 dark:text-white">
            <MessageSquare className="w-5 h-5 text-teal-500" />
            <h2>留言管理</h2>
          </div>
          <button
            onClick={refresh}
            disabled={refreshing}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/60 dark:bg-gray-800/60 border border-white/30 text-xs hover:bg-white/80 transition disabled:opacity-60"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>{refreshing ? '刷新中...' : '刷新'}</span>
          </button>
        </div>
        <p className="text-xs text-gray-500">
          所有新留言默认展示在公开页。你可以隐藏不合适的内容；隐藏后访客将看不到这条留言。
        </p>
        <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-gray-300 pt-1">
          <span>共 {messages.length} 条</span>
          <span className="text-emerald-600">显示 {visibleCount}</span>
          <span className="text-gray-500">隐藏 {hiddenCount}</span>
        </div>
      </GlassCard>

      {messages.length === 0 ? (
        <GlassCard className="p-12 text-center text-sm text-gray-500">
          还没有任何留言。访客提交的留言会出现在这里。
        </GlassCard>
      ) : (
        <ul className="space-y-3">
          {messages.map((m) => {
            const isPending = pendingId === m.id;
            return (
              <motion.li
                key={m.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: isPending ? 0.6 : 1, y: 0 }}
                transition={{ duration: 0.15 }}
              >
                <GlassCard className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">
                          {m.nickname || '访客'}
                        </span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full border ${
                            m.visible
                              ? 'border-emerald-300 text-emerald-700 bg-emerald-50/60'
                              : 'border-gray-300 text-gray-500 bg-gray-100/60'
                          }`}
                        >
                          {m.visible ? '显示中' : '已隐藏'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-200 whitespace-pre-wrap leading-relaxed">
                        {m.content}
                      </p>
                      <div className="flex items-center gap-3 mt-2 text-[11px] text-gray-500">
                        <span>{formatDateTime(m.created_at)}</span>
                        {m.contact && <span>联系方式：{m.contact}</span>}
                      </div>
                    </div>

                    <button
                      onClick={() => toggleVisibility(m.id, !m.visible)}
                      disabled={isPending}
                      className={`shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium border transition disabled:opacity-60 ${
                        m.visible
                          ? 'border-gray-200 text-gray-600 hover:bg-gray-100/60'
                          : 'border-emerald-300 text-emerald-700 hover:bg-emerald-50/60'
                      }`}
                      title={m.visible ? '点击隐藏' : '点击恢复显示'}
                    >
                      {m.visible ? (
                        <>
                          <EyeOff className="w-3.5 h-3.5" />
                          <span>隐藏</span>
                        </>
                      ) : (
                        <>
                          <Eye className="w-3.5 h-3.5" />
                          <span>显示</span>
                        </>
                      )}
                    </button>
                  </div>
                </GlassCard>
              </motion.li>
            );
          })}
        </ul>
      )}
    </div>
  );
}