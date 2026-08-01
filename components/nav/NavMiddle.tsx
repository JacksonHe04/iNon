import React, { useState } from 'react';
import { motion } from 'framer-motion';
import AIPanel from './AIPanel';
import type { ChatMessage } from '@/hooks/useAIAssistant';

interface NavMiddleProps {
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

export function NavMiddle({
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
}: NavMiddleProps) {
  const [isHovered, setIsHovered] = useState(false);

  const handleIslandClick = () => {
    setAIState(aiState === 'closed' ? 'docked' : 'closed');
  };

  return (
    <motion.div
      className="archive-nav-oracle flex-shrink-0 absolute inset-x-0 hidden justify-center pointer-events-none sm:flex sm:pointer-events-auto sm:static sm:w-auto sm:flex-none"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={handleIslandClick}
    >
      <motion.div
        className="px-5 py-2 border border-[var(--archive-line-strong)] bg-black text-white/90 cursor-pointer pointer-events-auto"
        style={{ backgroundColor: '#182119', color: '#f2ead6' }}
        animate={{
          y: isHovered || aiState !== 'closed' ? -1 : 0,
          opacity: aiState !== 'closed' ? 1 : 0.92,
        }}
        transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="flex items-center gap-2">
          <div className="relative flex h-4 w-7 items-center justify-center rounded-full bg-white/20">
            <motion.span
              className="h-2 w-2 rounded-full bg-white"
              animate={{ scaleY: [1, 0.2, 1], opacity: [1, 0.6, 1] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
            />
          </div>
          <span className="text-[10px] font-mono tracking-[0.12em] uppercase">小{nickname} AI · ORACLE</span>
        </div>
      </motion.div>

      <AIPanel
        aiState={aiState}
        setAIState={setAIState}
        messages={messages}
        aiInput={aiInput}
        setAIInput={setAIInput}
        isStreaming={isStreaming}
        errorMessage={errorMessage}
        handleSend={handleSend}
        handleSuggestionClick={handleSuggestionClick}
        handleInputKeyDown={handleInputKeyDown}
        getInputPlaceholder={getInputPlaceholder}
        nickname={nickname}
      />
    </motion.div>
  );
}
export default NavMiddle;
