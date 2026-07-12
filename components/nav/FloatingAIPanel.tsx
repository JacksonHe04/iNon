import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ChatMessage } from '@/hooks/useAIAssistant';

interface FloatingAIPanelProps {
  aiState: 'closed' | 'docked' | 'floating';
  setAIState: (state: 'closed' | 'docked' | 'floating') => void;
  messages: ChatMessage[];
  aiInput: string;
  setAIInput: (val: string) => void;
  isStreaming: boolean;
  errorMessage: string;
  handleSend: (prompt?: string) => Promise<void>;
  handleInputKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  getInputPlaceholder: (mode: 'docked' | 'floating') => string;
}

export function FloatingAIPanel({
  aiState,
  setAIState,
  messages,
  aiInput,
  setAIInput,
  isStreaming,
  errorMessage,
  handleSend,
  handleInputKeyDown,
  getInputPlaceholder,
}: FloatingAIPanelProps) {
  return (
    <AnimatePresence>
      {aiState === 'floating' && (
        <motion.div
          layoutId="ai-panel"
          initial={{ opacity: 0, x: 60, y: 60 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-4 right-4 lg:bottom-8 lg:right-8 w-[calc(100vw-2rem)] max-w-md h-[28rem] bg-white/60 backdrop-blur-3xl rounded-3xl shadow-2xl border border-white/40 flex flex-col z-51"
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/50">
            <div>
              <p className="text-sm font-semibold">小缨缨 AI</p>
              <p className="text-xs text-gray-500">基于 Yingying 的数字花园</p>
            </div>
            <div className="flex items-center gap-2">
              {isStreaming && <span className="text-[10px] text-green-500">回答中...</span>}
              <button
                onClick={() => setAIState('closed')}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                ✕
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
            {messages.length === 0 && (
              <div className="rounded-2xl bg-white/50 p-4 text-sm text-gray-600 shadow-inner">
                你可以问"小缨缨"关于作品、经历、音乐、阅读或任何和 Yingying 相关的故事。
              </div>
            )}
            {messages.map((message, idx) => (
              <div
                key={idx}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    message.role === 'user'
                      ? 'bg-gradient-to-r from-green-500 to-teal-400 text-white'
                      : 'bg-white/80 text-gray-800 shadow'
                  }`}
                >
                  {message.content || (message.role === 'assistant' ? '......' : '')}
                </div>
              </div>
            ))}
            {errorMessage && <p className="text-xs text-red-500">{errorMessage}</p>}
          </div>
          <div className="border-t border-white/50 px-5 py-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={aiInput}
                onChange={(e) => setAIInput(e.target.value)}
                onKeyDown={handleInputKeyDown}
                placeholder={getInputPlaceholder('floating')}
                className="flex-1 rounded-2xl border border-white/50 bg-white/60 px-3 py-2 text-sm focus:border-green-400 focus:outline-none"
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
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default FloatingAIPanel;
