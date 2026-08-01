import type { ReactNode } from 'react';
import type { BlockType } from '@/types/layout';

type ArchiveTone = 'paper' | 'sage' | 'moss' | 'forest';
type ArchiveMotif = 'fern' | 'flower' | 'branch' | 'birds' | 'stamp' | 'letter' | 'ochre' | 'field';

const BLOCK_ART: Record<BlockType, { tone: ArchiveTone; motif: ArchiveMotif; note: string }> = {
  bio: { tone: 'sage', motif: 'fern', note: '身份页 · 私人标本' },
  bookmarks: { tone: 'paper', motif: 'stamp', note: '常用入口 · 留存' },
  ai_clone: { tone: 'forest', motif: 'letter', note: '通信中 · 回声档案' },
  app_launcher: { tone: 'moss', motif: 'field', note: '桌面索引 · 快速抵达' },
  projects: { tone: 'paper', motif: 'branch', note: '项目枝系 · 持续生长' },
  music: { tone: 'forest', motif: 'birds', note: '唱片内页 · 正在播放' },
  movies: { tone: 'sage', motif: 'ochre', note: '放映记录 · 暗房存档' },
  books: { tone: 'paper', motif: 'fern', note: '藏书票 · 页边留痕' },
  games: { tone: 'moss', motif: 'stamp', note: '游玩票据 · 私人收藏' },
  timeline: { tone: 'forest', motif: 'branch', note: '寄出地点 · 时间路径' },
  friend_links: { tone: 'sage', motif: 'stamp', note: '地址簿 · 保持通信' },
  contact: { tone: 'paper', motif: 'letter', note: '回邮信封 · 等待来信' },
  thoughts: { tone: 'forest', motif: 'birds', note: '深水记录 · 未寄出的句子' },
  education: { tone: 'sage', motif: 'flower', note: '生长图谱 · 学习标本' },
  work: { tone: 'paper', motif: 'branch', note: '工作卷宗 · 校样批注' },
  products: { tone: 'moss', motif: 'field', note: '产品目录 · 使用痕迹' },
  creation: { tone: 'paper', motif: 'letter', note: '剪贴簿 · 手作记录' },
  hiphop: { tone: 'forest', motif: 'ochre', note: '旧唱片 · 节拍编号' },
  events: { tone: 'sage', motif: 'birds', note: '演出票 · 城市日期章' },
  tags: { tone: 'moss', motif: 'flower', note: '标本标签 · 铅笔圈注' },
  skills: { tone: 'sage', motif: 'fern', note: '能力图鉴 · 分类索引' },
  dev_tools: { tone: 'forest', motif: 'branch', note: '工具票据 · 工作台' },
  messages: { tone: 'paper', motif: 'stamp', note: '来信档案 · 请写下几句' },
};

interface ArchiveBlockFrameProps {
  blockType: BlockType;
  index: number;
  isWide: boolean;
  id: string;
  children: ReactNode;
}

export default function ArchiveBlockFrame({
  blockType,
  index,
  isWide,
  id,
  children,
}: ArchiveBlockFrameProps) {
  const art = BLOCK_ART[blockType];
  const layout = isWide
    ? ['wide-left', 'wide-right', 'wide-center', 'full'][index % 4]
    : index % 2 === 0
      ? 'half-left'
      : 'half-right';

  return (
    <article
      id={id}
      className="archive-block-frame"
      data-archive-index={index}
      data-archive-layout={layout}
      data-archive-tone={art.tone}
      data-archive-motif={art.motif}
    >
      <span className="archive-block-frame__folio" aria-hidden="true">
        <b>{String(index + 1).padStart(2, '0')}</b>
        <span>FIELD / {blockType.replaceAll('_', ' ')}</span>
      </span>
      <span className="archive-block-frame__motif" aria-hidden="true" />
      <div className="archive-block-frame__body">{children}</div>
      <span className="archive-block-frame__annotation" aria-hidden="true">
        {art.note}
      </span>
    </article>
  );
}
