'use client';

import { Disc, Play, Disc2, Music } from 'lucide-react';
import CollectionGridBlock, { type CollectionTabConfig } from './CollectionGridBlock';
import { getBlockTitle } from '@/lib/blocks/registry';
import type { LibraryItemDTO } from '@/types';

interface MusicBlockProps {
  albums?: LibraryItemDTO[];
  songs?: LibraryItemDTO[];
  musicians?: LibraryItemDTO[];
  title?: string;
  colSpan?: number;
}

export default function MusicBlock({
  albums = [],
  songs = [],
  musicians = [],
  title = getBlockTitle('music'),
  colSpan = 2,
}: MusicBlockProps) {
  const tabs: CollectionTabConfig[] = [
    {
      id: 'albums',
      label: '专辑',
      items: albums,
      icon: Disc,
      getCardMeta: (item) => ({
        title: item.name,
        subTitle: item.creator,
      }),
    },
    {
      id: 'songs',
      label: '单曲',
      items: songs,
      icon: Play,
      getCardMeta: (item) => ({
        title: item.name,
        subTitle: item.creator,
      }),
    },
    {
      id: 'musicians',
      label: '音乐人',
      items: musicians,
      icon: Disc2,
      getCardMeta: (item) => ({
        title: item.name,
        subTitle: item.comment,
      }),
    },
  ];

  return (
    <CollectionGridBlock
      tabs={tabs}
      title={title}
      blockIcon={Music}
      themeColorClass="emerald"
      colSpan={colSpan}
    />
  );
}
