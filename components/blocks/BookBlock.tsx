'use client';

import { useState } from 'react';
import { BookOpen, User } from 'lucide-react';
import ReadingDeskScene from '@/components/scenes/ReadingDeskScene';
import CollectionGridBlock, { type CollectionTabConfig } from './CollectionGridBlock';
import { getBlockTitle } from '@/lib/blocks/registry';

export interface BookItem {
  name: string;
  author: string;
  country: string;
  link: string;
  comment: string;
  image_url?: string;
}

export interface AuthorItem {
  name: string;
  country: string;
  link: string;
  comment: string;
  image_url?: string;
}

interface BookBlockProps {
  books?: BookItem[];
  authors?: AuthorItem[];
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
        subTitle: `${item.author} · ${item.country}`,
      }),
    },
    {
      id: 'authors',
      label: '作者',
      items: authors,
      icon: User,
      getCardMeta: (item) => ({
        title: item.name,
        subTitle: item.country,
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
          books={books}
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
