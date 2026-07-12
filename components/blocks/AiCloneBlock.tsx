'use client';

import GlassCard from '@/components/GlassCard';
import { Bot, Sparkles, MessageSquare } from 'lucide-react';
import { APP_EVENTS, dispatchAppEvent } from '@/lib/dom-events';

interface AiCloneBlockProps {
  name: string;
  title?: string;
  onOpenChat?: () => void;
}

export default function AiCloneBlock({ name, title, onOpenChat }: AiCloneBlockProps) {
  const handleOpenChat = () => {
    if (onOpenChat) {
      onOpenChat();
      return;
    }
    dispatchAppEvent(APP_EVENTS.openAiPanel, undefined);
  };

  return (
    <GlassCard className="p-6 space-y-4 border-teal-500/40 relative overflow-hidden bg-gradient-to-br from-teal-500/10 via-transparent to-purple-500/10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-gradient-to-br from-teal-400 to-emerald-500 text-white shadow-md">
            <Bot className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            {title && <h3 className="font-extrabold text-base text-gray-900 dark:text-white">{title}</h3>}
            <p className="text-[11px] text-gray-500">24h 智能对话 & 知识库互动</p>
          </div>
        </div>
        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-teal-500/20 text-teal-600 dark:text-teal-300 border border-teal-500/30">
          ONLINE
        </span>
      </div>

      <p className="text-xs text-gray-600 dark:text-gray-300">
        通过 AI 对话快速了解 {name} 的技能、作品集、思维模型与最新动态。
      </p>

      <button
        onClick={handleOpenChat}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-semibold text-xs shadow-md hover:opacity-90 transition"
      >
        <MessageSquare className="w-4 h-4" />
        <span>与 AI 分身对话</span>
      </button>
    </GlassCard>
  );
}
