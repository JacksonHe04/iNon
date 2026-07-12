import { useState, type KeyboardEvent } from 'react';
import type { ReadmeData } from '@/types';
import { getAuthorNickname } from '@/lib/utils';

export type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

interface UseAIAssistantProps {
  data: ReadmeData;
}

export function useAIAssistant({ data }: UseAIAssistantProps) {
  const nickname = getAuthorNickname(data.basic.name);
  const [aiState, setAIState] = useState<'closed' | 'docked' | 'floating'>('closed');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [aiInput, setAIInput] = useState('');
  const [pendingPrompt, setPendingPrompt] = useState<'mbti' | 'zodiac' | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSend = async (prompt?: string) => {
    const rawInput = prompt ?? aiInput;
    const text = rawInput.trim();
    if (!text) return;

    let finalPrompt = text;
    if (!prompt && pendingPrompt) {
      if (pendingPrompt === 'mbti') {
        const lifeMBTI = data.life.mbti?.life_mbti ?? '未知';
        const workMBTI = data.life.mbti?.work_mbti ?? '未知';
        finalPrompt = `访客的 MBTI 是「${text}」。请结合 ${nickname} 的 MBTI（生活：${lifeMBTI}，工作：${workMBTI}）分析与访客的匹配度，输出性格契合点与建议。`;
      } else if (pendingPrompt === 'zodiac') {
        const zodiac = data.life.zodiac_sign || '未知';
        finalPrompt = `访客的星座是「${text}」。请结合 ${nickname} 的星座（${zodiac}）进行星座匹配度解析，写出共鸣点与提醒。`;
      }
      setPendingPrompt(null);
    } else if (prompt) {
      setPendingPrompt(null);
    }

    const nextMessages = [...messages, { role: 'user' as const, content: finalPrompt }];
    setMessages([...nextMessages, { role: 'assistant', content: '' }]);
    setAIInput('');
    setAIState('floating');
    setIsStreaming(true);
    setErrorMessage('');

    try {
      const response = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: nextMessages }),
      });

      if (!response.ok || !response.body) {
        throw new Error('AI 服务不可用');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantReply = '';
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        assistantReply += decoder.decode(value, { stream: true });
        setMessages((prev) => {
          if (!prev.length) return prev;
          const updated = [...prev];
          const lastIndex = updated.length - 1;
          if (updated[lastIndex].role === 'assistant') {
            updated[lastIndex] = { ...updated[lastIndex], content: assistantReply };
          }
          return updated;
        });
      }
    } catch (error) {
      console.error('AI assistant error:', error);
      setErrorMessage(`小${nickname}暂时离线，请稍后重试。`);
      setMessages((prev) => {
        if (!prev.length) return prev;
        const updated = [...prev];
        const lastIndex = updated.length - 1;
        if (updated[lastIndex].role === 'assistant') {
          updated[lastIndex] = {
            ...updated[lastIndex],
            content: '抱歉，我现在无法连接大脑，请稍后再试。',
          };
        }
        return updated;
      });
    } finally {
      setIsStreaming(false);
    }
  };

  const handleSuggestionClick = (suggest: string) => {
    if (suggest.includes('MBTI')) {
      setPendingPrompt('mbti');
      setAIInput('');
      setAIState('docked');
      return;
    }
    if (suggest.includes('星座')) {
      setPendingPrompt('zodiac');
      setAIInput('');
      setAIState('docked');
      return;
    }
    setPendingPrompt(null);
    void handleSend(suggest);
  };

  const handleInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter' || event.nativeEvent.isComposing) return;
    event.preventDefault();
    if (!isStreaming) {
      void handleSend();
    }
  };

  const getInputPlaceholder = (mode: 'docked' | 'floating') => {
    if (pendingPrompt === 'mbti') {
      return '请输入你的 MBTI（例如 INFP）';
    }
    if (pendingPrompt === 'zodiac') {
      return '请输入你的星座（例如 天蝎座）';
    }
    return mode === 'docked' ? '输入问题...' : '继续提问...';
  };

  return {
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
  };
}
export default useAIAssistant;
