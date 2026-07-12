import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ChatMessage } from '@/hooks/useAIAssistant';

interface AIPanelProps {
  aiState: 'closed' | 'docked' | 'floating';
  setAIState: (state: 'closed' | 'docked' | 'floating') => void;
  messages: ChatMessage[];
  aiInput: string;
  setAIInput: (val: string) => void;
  isStreaming: boolean;
  errorMessage: string;
  handleSend: (prompt?: string) => Promise<void>;
  handleSuggestionClick: (suggest: string) => void;
  handleInputKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  getInputPlaceholder: (mode: 'docked' | 'floating') => string;
  nickname: string;
}

const aiSuggestions = ['MBTI匹配度测试', '星座匹配度测试', '推荐一本书', '最近的创作灵感'];

export function AIPanel({
  aiState,
  setAIState,
  messages,
  aiInput,
  setAIInput,
  isStreaming,
  errorMessage,
  handleSend,
  handleSuggestionClick,
  handleInputKeyDown,
  getInputPlaceholder,
  nickname,
}: AIPanelProps) {
  return (
    <AnimatePresence>
      {aiState === 'docked' && (
        <motion.div
          layoutId="ai-panel"
          initial={{ opacity: 0, y: 10, scale: 0.9 }}
          animate={{ opacity: 1, y: 12, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.9 }}
          className="absolute left-1/2 top-full z-50 mt-4 w-[calc(100vw-2rem)] max-w-sm -translate-x-1/2 rounded-3xl border border-white/40 bg-white/60 p-4 text-sm shadow-2xl backdrop-blur-2xl sm:w-80 sm:max-w-none pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="mb-3 text-gray-600">
            你好，我是小{nickname}。想了解 {nickname} 的哪些故事？
          </div>
          <div className="flex flex-wrap gap-2 mb-3">
            {aiSuggestions.map((suggest) => (
              <button
                key={suggest}
                className="rounded-full border border-white/50 bg-white/30 px-3 py-1 text-xs text-gray-600 hover:bg-white/60"
                onClick={() => handleSuggestionClick(suggest)}
              >
                {suggest}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={aiInput}
              onChange={(e) => setAIInput(e.target.value)}
              onKeyDown={handleInputKeyDown}
              placeholder={getInputPlaceholder('docked')}
              className="flex-1 rounded-2xl border border-white/50 bg-white/40 px-3 py-2 text-sm focus:border-green-400 focus:outline-none"
            />
            <button
              onClick={() => {
                if (!isStreaming) void handleSend();
              }}
              className="rounded-2xl bg-gradient-to-r from-green-500 to-teal-400 px-4 py-2 text-white text-sm disabled:opacity-50"
              disabled={isStreaming}
            >
              发送
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default AIPanel;
