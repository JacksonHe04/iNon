'use client';

import { useEffect, useRef, type FormEvent } from 'react';
import type { ReadmeData } from '@/types';
import { getAuthorNickname } from '@/lib/utils';
import { useAIAssistant } from '@/hooks/useAIAssistant';
import type { WorldDialogueContext } from '@/components/world/archiveWorldTelemetry';
import styles from '@/components/world/ArchiveDialoguePanel.module.css';

const OWNER_SUGGESTIONS = ['最近在做什么？', '推荐一张喜欢的唱片', '讲讲这里的收藏', '为什么建造这个世界？'];
const COMPANION_SUGGESTIONS = ['今天森林里发生了什么？', '带我去你喜欢的地方', '你为什么跟着我？', '讲讲主人的收藏'];

export default function ArchiveDialoguePanel({
  data,
  persona = 'owner',
  worldContext,
}: {
  data: ReadmeData;
  persona?: 'owner' | 'companion';
  worldContext: WorldDialogueContext;
}) {
  const nickname = getAuthorNickname(data.basic.name);
  const companion = persona === 'companion';
  const speaker = companion ? '苔苔' : `小${nickname}`;
  const suggestions = companion ? COMPANION_SUGGESTIONS : OWNER_SUGGESTIONS;
  const companionHeading = worldContext.location === '主屋室内'
    ? '在主屋地毯旁，与苔苔说话'
    : `在${worldContext.location}停下，与苔苔说话`;
  const scroll = useRef<HTMLDivElement>(null);
  const {
    messages,
    aiInput,
    setAIInput,
    isStreaming,
    errorMessage,
    handleSend,
  } = useAIAssistant({ data, persona, worldContext });

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
        <h1>{companion ? companionHeading : `与小${nickname}在壁炉旁交谈`}</h1>
        <span>{isStreaming ? '正在组织语言……' : '收音稳定 · 可随时提问'}</span>
      </header>

      <aside className={styles.context} aria-label="进入对话前的世界状态">
        <div>
          <span>LAST FIELD POSITION / 世界仍在身后运行</span>
          <strong>{worldContext.location}</strong>
        </div>
        <p>
          DAY {worldContext.day} · {worldContext.phaseLabel} {worldContext.clockLabel} · {worldContext.motion} · X {worldContext.x} / Z {worldContext.z} · ALT {worldContext.y.toFixed(1)} M · 朝向 {worldContext.heading}°
        </p>
        <small>
          生命 {worldContext.vitality}（{worldContext.vitalityLabel}） · 体力 {worldContext.stamina} · 体温 {worldContext.warmth}（{worldContext.warmthLabel}） · 口粮 {worldContext.rations} · 食材 {worldContext.forageIngredients} / 3 · 田野札记 {worldContext.collectedKeepsakeIds.length} / 18 · {worldContext.companionNearby ? '苔苔就在身边' : '苔苔正在循着气味赶来'}
        </small>
      </aside>

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
            placeholder={companion ? '例如：从这里出发，下一站去哪里？' : '例如：最近哪张唱片陪你最久？'}
          />
          <button type="submit" disabled={isStreaming || !aiInput.trim()}>
            {isStreaming ? '书写中' : '寄出'}
          </button>
        </div>
      </form>
    </section>
  );
}
