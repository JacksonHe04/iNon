'use client';

import { Gamepad2, User } from 'lucide-react';
import CollectionGridBlock, { type CollectionTabConfig } from './CollectionGridBlock';
import { getBlockTitle } from '@/lib/blocks/registry';
import type { LibraryItemDTO } from '@/types';

interface GameBlockProps {
  works?: LibraryItemDTO[];
  creators?: LibraryItemDTO[];
  title?: string;
  colSpan?: number;
}

export default function GameBlock({
  works = [],
  creators = [],
  title = getBlockTitle('games'),
  colSpan = 2,
}: GameBlockProps) {
  const tabs: CollectionTabConfig[] = [
    {
      id: 'works',
      label: '游戏',
      items: works,
      icon: Gamepad2,
      getCardMeta: (item) => ({
        title: item.name,
        subTitle: item.creator,
      }),
    },
    {
      id: 'creators',
      label: '开发商',
      items: creators,
      icon: User,
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
      blockIcon={Gamepad2}
      themeColorClass="cyan"
      colSpan={colSpan}
    />
  );
}
