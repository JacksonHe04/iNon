'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '../GlassCard';
import type { PublicMessage } from '@/lib/content/messages';

interface MessageSectionProps {
  initialMessages?: PublicMessage[];
}

export default function MessageSection({ initialMessages = [] }: MessageSectionProps) {
  const [nickname, setNickname] = useState('');
  const [message, setMessage] = useState('');
  const [contact, setContact] = useState('');
  const [status, setStatus] = useState<'idle' | 'success' | 'error' | 'submitting'>('idle');
  const [feedback, setFeedback] = useState('');
  const [messages, setMessages] = useState<PublicMessage[]>(initialMessages);

  const quickGreetings = ['你好！', '很高兴认识你！', '期待交流！', '祝好！'];

  const handleSubmit = async () => {
    if (!message.trim()) {
      setStatus('error');
      setFeedback('请填写留言内容');
      return;
    }

    setStatus('submitting');
    setFeedback('');

    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nickname,
          contact,
          content: message,
        }),
      });

      const result = (await response.json()) as {
        ok?: boolean;
        error?: string;
        message?: PublicMessage;
      };

      if (!response.ok) {
        setStatus('error');
        setFeedback(result.error || '发送失败，请稍后再试');
        return;
      }

      if (result.message) {
        const msg = result.message;
        setMessages((prev) => [msg, ...prev]);
      }

      setStatus('success');
      setFeedback('已收到，留言已展示。');
      setMessage('');
      setContact('');
      setNickname('');
    } catch {
      setStatus('error');
      setFeedback('发送失败，请稍后再试');
    }
  };

  return (
    <section id="message" className="min-h-screen flex items-center justify-center py-8 px-4">
      <div className="max-w-4xl w-full">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-4xl font-bold mb-12 text-center"
        >
          留言
        </motion.h2>

        <div className="bg-gradient-to-br from-white to-purple-50 rounded-2xl p-8 shadow-2xl border border-white/60">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <GlassCard className="md:col-span-1 bg-white/80">
              <h3 className="text-xl font-semibold mb-4">快捷问候</h3>
              <div className="flex flex-wrap gap-2">
                {quickGreetings.map((greeting) => (
                  <button
                    key={greeting}
                    onClick={() => {
                      setMessage(greeting);
                      setStatus('idle');
                    }}
                    className="px-4 py-2 bg-white/40 rounded-full text-sm hover:bg-white/60 transition-colors"
                  >
                    {greeting}
                  </button>
                ))}
              </div>
              <p className="mt-4 text-xs text-gray-500">
                轻点一句问候，小缨缨就能感知你的心情。
              </p>
            </GlassCard>

            <GlassCard className="md:col-span-2 bg-white/90">
              <h3 className="text-xl font-semibold mb-4">直接留言</h3>
              <div className="space-y-4">
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => {
                    setNickname(e.target.value);
                    setStatus('idle');
                    setFeedback('');
                  }}
                  placeholder="你的称呼（可选）"
                  className="w-full rounded-xl border border-gray-200 bg-white/70 px-4 py-2 text-sm focus:border-purple-400 focus:outline-none"
                />
                <input
                  type="text"
                  value={contact}
                  onChange={(e) => {
                    setContact(e.target.value);
                    setStatus('idle');
                    setFeedback('');
                  }}
                  placeholder="你的邮箱 / 社媒 / 其他联系方式（可选）"
                  className="w-full rounded-xl border border-gray-200 bg-white/70 px-4 py-2 text-sm focus:border-purple-400 focus:outline-none"
                />
                <textarea
                  value={message}
                  onChange={(e) => {
                    setMessage(e.target.value);
                    setStatus('idle');
                    setFeedback('');
                  }}
                  placeholder="写下你想说的话..."
                  className="w-full h-32 rounded-2xl border border-gray-200 bg-white/70 px-4 py-3 text-sm focus:border-purple-400 focus:outline-none resize-none"
                />
                <div className="flex items-center justify-between">
                  {status === 'error' && (
                    <span className="text-xs text-red-500">{feedback}</span>
                  )}
                  {status === 'success' && (
                    <span className="text-xs text-emerald-500">{feedback}</span>
                  )}
                  <button
                    onClick={handleSubmit}
                    disabled={status === 'submitting'}
                    className="ml-auto rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-2 text-white text-sm shadow-lg hover:shadow-xl transition"
                  >
                    {status === 'submitting' ? '发送中...' : '发送'}
                  </button>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    </section>
  );
}
