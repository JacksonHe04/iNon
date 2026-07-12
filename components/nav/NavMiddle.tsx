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
}: NavMiddleProps) {
  const [isHovered, setIsHovered] = useState(false);

  const handleIslandClick = () => {
    setAIState(aiState === 'closed' ? 'docked' : 'closed');
  };

  return (
    <motion.div
      className="flex-shrink-0 absolute inset-x-0 flex justify-center pointer-events-none sm:pointer-events-auto sm:static sm:w-auto sm:flex-none"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={handleIslandClick}
    >
      <motion.div
        className="px-6 py-2 rounded-full border border-white/20 bg-black text-white/90 backdrop-blur-2xl cursor-pointer shadow-[0_15px_35px_rgba(0,0,0,0.35)] pointer-events-auto"
        animate={{
          scale: isHovered || aiState !== 'closed' ? 1.08 : 1,
          boxShadow:
            aiState !== 'closed'
              ? '0 10px 40px rgba(139,92,246,0.35)'
              : '0 10px 20px rgba(0,0,0,0.08)',
        }}
        transition={{ type: 'spring', stiffness: 260 }}
      >
        <div className="flex items-center gap-2">
          <div className="relative flex h-4 w-7 items-center justify-center rounded-full bg-white/20">
            <motion.span
              className="h-2 w-2 rounded-full bg-white"
              animate={{ scaleY: [1, 0.2, 1], opacity: [1, 0.6, 1] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
            />
          </div>
          <span className="text-xs tracking-wide uppercase">小缨缨 AI</span>
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
      />
    </motion.div>
  );
}
export default NavMiddle;
