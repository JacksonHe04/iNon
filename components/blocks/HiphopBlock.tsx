'use client';

import { Disc, Disc2, Mic2, Play } from 'lucide-react';
import CollectionGridBlock, { type CollectionTabConfig } from './CollectionGridBlock';
import type { LibraryItemDTO } from '@/types';

interface HiphopBlockProps {
  albums: LibraryItemDTO[];
  songs: LibraryItemDTO[];
  musicians: LibraryItemDTO[];
  title?: string;
  colSpan?: number;
}

export default function HiphopBlock({
  albums,
  songs,
  musicians,
  title,
  colSpan = 2,
}: HiphopBlockProps) {
  const tabs: CollectionTabConfig[] = [
    {
      id: 'albums',
      label: '专辑',
      items: albums,
      icon: Disc,
      getCardMeta: (item) => ({
        title: item.name,
        subTitle: `${item.creator} · 专辑`,
      }),
    },
    {
      id: 'songs',
      label: '单曲',
      items: songs,
      icon: Play,
      getCardMeta: (item) => ({
        title: item.name,
        subTitle: `${item.creator} · 单曲`,
      }),
    },
    {
      id: 'musicians',
      label: '音乐人',
      items: musicians,
      icon: Disc2,
      getCardMeta: (item) => ({
        title: item.name,
        subTitle: '音乐人',
      }),
    },
  ];

  return (
    <CollectionGridBlock
      tabs={tabs}
      title={title || '嘻哈'}
      blockIcon={Mic2}
      gradientColors={[
        'from-orange-400 to-red-400',
        'from-yellow-400 to-orange-400',
        'from-pink-400 to-rose-400',
        'from-purple-400 to-pink-400',
        'from-blue-400 to-cyan-400',
        'from-green-400 to-emerald-400',
      ]}
      themeColorClass="orange"
      colSpan={colSpan}
    />
  );
}
