'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { Film, User } from 'lucide-react';
import CollectionGridBlock, { type CollectionTabConfig } from './CollectionGridBlock';
import { getBlockTitle } from '@/lib/blocks/registry';
import type { LibraryItemDTO } from '@/types';

const FilmDeskScene = dynamic(() => import('@/components/scenes/FilmDeskScene'), {
  ssr: false,
  loading: () => <div className="min-h-[340px]" aria-hidden="true" />,
});

interface MovieBlockProps {
  films?: LibraryItemDTO[];
  directors?: LibraryItemDTO[];
  title?: string;
  colSpan?: number;
  mode?: 'readonly' | 'edit';
}

export default function MovieBlock({
  films = [],
  directors = [],
  title = getBlockTitle('movies'),
  colSpan = 2,
  mode = 'readonly',
}: MovieBlockProps) {
  const [showScene, setShowScene] = useState(true);
  const [activeTitle, setActiveTitle] = useState<string | null>(null);

  const tabs: CollectionTabConfig[] = [
    {
      id: 'films',
      label: '影片',
      items: films,
      icon: Film,
      getCardMeta: (item) => ({
        title: item.name,
        subTitle: item.creator,
      }),
    },
    {
      id: 'directors',
      label: '导演',
      items: directors,
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
      blockIcon={Film}
      themeColorClass="amber"
      colSpan={colSpan}
      interactiveScene={
        <FilmDeskScene
          films={films.map((f) => ({
            name: f.name,
            director: f.creator,
            country: '',
            link: f.link,
            comment: f.comment,
            image_url: f.imageUrl || undefined,
          }))}
          activeTitle={activeTitle}
          onSelect={(f) => setActiveTitle(f.title)}
          mode={mode}
        />
      }
      showScene={showScene}
      onToggleScene={() => setShowScene(!showScene)}
      sceneToggleText="唱片墙"
    />
  );
}
