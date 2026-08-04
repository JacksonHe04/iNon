'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { BookOpen, User } from 'lucide-react';
import CollectionGridBlock, { type CollectionTabConfig } from './CollectionGridBlock';
import { getBlockTitle } from '@/lib/blocks/registry';
import type { LibraryItemDTO } from '@/types';

const ReadingDeskScene = dynamic(() => import('@/components/scenes/ReadingDeskScene'), {
  ssr: false,
  loading: () => <div className="min-h-[280px]" aria-hidden="true" />,
});

interface BookBlockProps {
  books?: LibraryItemDTO[];
  authors?: LibraryItemDTO[];
  title?: string;
  colSpan?: number;
  mode?: 'readonly' | 'edit';
}

export default function BookBlock({
  books = [],
  authors = [],
  title = getBlockTitle('books'),
  colSpan = 2,
  mode = 'readonly',
}: BookBlockProps) {
  const [showScene, setShowScene] = useState(true);
  const [activeTitle, setActiveTitle] = useState<string | null>(null);

  const tabs: CollectionTabConfig[] = [
    {
      id: 'books',
      label: '书籍',
      items: books,
      icon: BookOpen,
      getCardMeta: (item) => ({
        title: item.name,
        subTitle: item.creator,
      }),
    },
    {
      id: 'authors',
      label: '作者',
      items: authors,
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
      blockIcon={BookOpen}
      themeColorClass="indigo"
      colSpan={colSpan}
      interactiveScene={
        <ReadingDeskScene
          books={books.map((b) => ({
            name: b.name,
            author: b.creator,
            country: '',
            link: b.link,
            comment: b.comment,
            image_url: b.imageUrl || undefined,
          }))}
          activeTitle={activeTitle}
          onSelect={(b) => setActiveTitle(b.title)}
          mode={mode}
        />
      }
      showScene={showScene}
      onToggleScene={() => setShowScene(!showScene)}
      sceneToggleText="书架"
    />
  );
}
