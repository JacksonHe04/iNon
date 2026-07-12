'use client';

import React, { useState } from 'react';
import { Bot } from 'lucide-react';
import GlassCard from '@/components/GlassCard';

interface AITestConsoleProps {
  name: string;
}

export function AITestConsole({ name }: AITestConsoleProps) {
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiLog, setAiLog] = useState<Array<{ role: 'user' | 'bot'; content: string }>>([
    { role: 'bot', content: `你好 ${name}！我是你的 AI 分身助手。在主页随时与我测试对话吧！` },
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

  return (
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
  );
}
export default AITestConsole;
