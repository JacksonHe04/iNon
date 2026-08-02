'use client';

import { useEffect, useRef, type FormEvent } from 'react';
import type { ReadmeData } from '@/types';
import { getAuthorNickname } from '@/lib/utils';
import { useAIAssistant } from '@/hooks/useAIAssistant';

const OWNER_SUGGESTIONS = ['最近在做什么？', '推荐一张喜欢的唱片', '讲讲这里的收藏', '为什么建造这个世界？'];
const COMPANION_SUGGESTIONS = ['今天森林里发生了什么？', '带我去你喜欢的地方', '你为什么跟着我？', '讲讲主人的收藏'];

export default function ArchiveDialoguePanel({
  data,
  persona = 'owner',
}: {
  data: ReadmeData;
  persona?: 'owner' | 'companion';
}) {
  const nickname = getAuthorNickname(data.basic.name);
  const companion = persona === 'companion';
  const speaker = companion ? '苔苔' : `小${nickname}`;
  const suggestions = companion ? COMPANION_SUGGESTIONS : OWNER_SUGGESTIONS;
  const scroll = useRef<HTMLDivElement>(null);
  const {
    messages,
    aiInput,
    setAIInput,
    isStreaming,
    errorMessage,
    handleSend,
  } = useAIAssistant({ data, persona });

  useEffect(() => {
    scroll.current?.scrollTo({ top: scroll.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!isStreaming) void handleSend();
  };

  return (
    <section className="archive-world-dialogue" aria-label={`与${speaker}对话`}>
      <header>
        <p>FIELD RADIO / LIVE CORRESPONDENCE</p>
        <h1>{companion ? '蹲在林径旁，与苔苔说话' : `与小${nickname}在壁炉旁交谈`}</h1>
        <span>{isStreaming ? '正在组织语言……' : '收音稳定 · 可随时提问'}</span>
      </header>

      <div ref={scroll} className="archive-world-dialogue__messages" aria-live="polite">
        {messages.length === 0 && (
          <article className="archive-world-dialogue__welcome">
            <span>{companion ? '一双留意森林的眼睛' : '一封尚未写下的信'}</span>
            <h2>{companion ? '苔苔歪着头，安静等你。' : '这里不需要命令词。'}</h2>
            <p>{companion ? '它熟悉林径、主屋与公开收藏，也记得一路闻到的风。' : '你可以问作品、经历、音乐、阅读，也可以聊聊窗外的森林。回答只会依据公开档案与当前对话。'}</p>
            <div>
              {suggestions.map((suggestion) => (
                <button key={suggestion} onClick={() => void handleSend(suggestion)}>{suggestion}</button>
              ))}
            </div>
          </article>
        )}
        {messages.map((message, index) => (
          <article key={`${message.role}-${index}`} className={`archive-world-dialogue__message is-${message.role}`}>
            <span>{message.role === 'user' ? '访客' : speaker}</span>
            <p>{message.content || '……'}</p>
          </article>
        ))}
        {errorMessage && <p className="archive-world-dialogue__error">{errorMessage}</p>}
      </div>

      <form onSubmit={submit} className="archive-world-dialogue__composer">
        <label htmlFor="archive-world-chat-input">写下想问的事</label>
        <div>
          <textarea
            id="archive-world-chat-input"
            rows={2}
            value={aiInput}
            onChange={(event) => setAIInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key !== 'Enter' || event.shiftKey || event.nativeEvent.isComposing) return;
              event.preventDefault();
              if (!isStreaming) void handleSend();
            }}
            placeholder="例如：最近哪张唱片陪你最久？"
          />
          <button type="submit" disabled={isStreaming || !aiInput.trim()}>
            {isStreaming ? '书写中' : '寄出'}
          </button>
        </div>
      </form>
    </section>
  );
}
