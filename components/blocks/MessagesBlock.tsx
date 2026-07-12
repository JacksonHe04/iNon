'use client';

import { useState } from 'react';
import GlassCard from '@/components/GlassCard';
import { MessageSquare, Send } from 'lucide-react';
import { getBlockTitle } from '@/lib/blocks/registry';
import type { PublicMessage } from '@/lib/content/messages';

interface MessagesBlockProps {
  messages?: PublicMessage[];
  title?: string;
  /** 1 = 半宽（左侧列表 + 右侧表单上下排），2 = 全宽（左右两栏）。与 BlockConfig.colSpan 对齐。 */
  colSpan?: 1 | 2;
}

function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default function MessagesBlock({
  messages: initialMessages = [],
  title = getBlockTitle('messages'),
  colSpan = 2,
}: MessagesBlockProps) {
  const [messages, setMessages] = useState<PublicMessage[]>(initialMessages);
  const [nickname, setNickname] = useState('');
  const [contact, setContact] = useState('');
  const [content, setContent] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [feedback, setFeedback] = useState('');

  const handleSubmit = async () => {
    if (!content.trim()) {
      setStatus('error');
      setFeedback('请填写留言内容');
      return;
    }
    setStatus('submitting');
    setFeedback('');
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nickname, contact, content }),
      });
      const result = (await res.json()) as { error?: string; message?: PublicMessage };
      if (!res.ok) {
        setStatus('error');
        setFeedback(result.error || '发送失败，请稍后再试');
        return;
      }
      if (result.message) {
        setMessages((prev) => [result.message!, ...prev]);
      }
      setStatus('success');
      setFeedback('已收到，欢迎留下你的足迹。');
      setNickname('');
      setContact('');
      setContent('');
    } catch {
      setStatus('error');
      setFeedback('发送失败，请稍后再试');
    }
  };

  // 半宽：列表在上、表单在下；全宽：左右两栏（列表占主、提交表单占侧）。
  const layoutClass =
    colSpan === 2 ? 'lg:grid-cols-3' : 'grid-cols-1';
  const listColSpan = colSpan === 2 ? 'lg:col-span-2' : '';

  return (
    <GlassCard className="p-5 space-y-5 hover:border-purple-400/40 transition">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400">
            <MessageSquare className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-gray-900 dark:text-white">{title}</h3>
        </div>
        <span className="text-xs text-gray-400 font-mono">{messages.length} 条留言</span>
      </div>

      <div className={`grid gap-5 ${layoutClass}`}>
        {/* 主体：留言列表 */}
        <div className={`rounded-2xl bg-white/40 dark:bg-gray-800/40 border border-white/20 p-4 space-y-3 ${listColSpan}`}>
          {messages.length === 0 ? (
            <div className="text-center text-sm text-gray-400 py-8">
              还没有留言，来做第一位吧。
            </div>
          ) : (
            <ul className="space-y-2.5 max-h-[26rem] overflow-y-auto pr-1">
              {messages.map((m) => (
                <li
                  key={m.id}
                  className="rounded-xl bg-white/60 dark:bg-gray-900/40 border border-white/30 p-3"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-gray-800 dark:text-gray-200">
                      {m.nickname}
                    </span>
                    <span className="text-[10px] text-gray-400 font-mono">
                      {formatDate(m.created_at)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                    {m.content}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* 旁侧：提交表单 */}
        <div className="rounded-2xl bg-white/40 dark:bg-gray-800/40 border border-white/20 p-4 space-y-3">
          <div className="space-y-2.5">
            <input
              type="text"
              value={nickname}
              onChange={(e) => {
                setNickname(e.target.value);
                setStatus('idle');
                setFeedback('');
              }}
              placeholder="你的称呼（可选）"
              className="w-full rounded-lg border border-white/30 bg-white/60 dark:bg-gray-900/40 px-3 py-1.5 text-xs text-gray-800 dark:text-gray-200 placeholder:text-gray-400 focus:border-purple-400 focus:outline-none"
            />
            <input
              type="text"
              value={contact}
              onChange={(e) => {
                setContact(e.target.value);
                setStatus('idle');
                setFeedback('');
              }}
              placeholder="邮箱 / 社媒（可选）"
              className="w-full rounded-lg border border-white/30 bg-white/60 dark:bg-gray-900/40 px-3 py-1.5 text-xs text-gray-800 dark:text-gray-200 placeholder:text-gray-400 focus:border-purple-400 focus:outline-none"
            />
            <textarea
              value={content}
              onChange={(e) => {
                setContent(e.target.value);
                setStatus('idle');
                setFeedback('');
              }}
              placeholder="写下你想说的话..."
              className="w-full h-24 rounded-lg border border-white/30 bg-white/60 dark:bg-gray-900/40 px-3 py-2 text-xs text-gray-800 dark:text-gray-200 placeholder:text-gray-400 focus:border-purple-400 focus:outline-none resize-none"
            />
            <div className="flex items-center justify-between gap-2 pt-1">
              {status === 'error' && (
                <span className="text-[10px] text-rose-500 truncate">{feedback}</span>
              )}
              {status === 'success' && (
                <span className="text-[10px] text-emerald-500 truncate">{feedback}</span>
              )}
              {status === 'idle' && <span />}
              <button
                onClick={handleSubmit}
                disabled={status === 'submitting'}
                className="ml-auto flex items-center gap-1 rounded-lg bg-purple-500 text-white px-3 py-1.5 text-xs font-medium hover:bg-purple-600 transition disabled:opacity-60"
              >
                <Send className="w-3 h-3" />
                <span>{status === 'submitting' ? '发送中...' : '发送'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}