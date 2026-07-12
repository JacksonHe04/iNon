'use client';

import { useState } from 'react';
import { Film, User } from 'lucide-react';
import FilmDeskScene from '@/components/scenes/FilmDeskScene';
import CollectionGridBlock, { type CollectionTabConfig } from './CollectionGridBlock';
import { getBlockTitle } from '@/lib/blocks/registry';

export interface MovieItem {
  name: string;
  director: string;
  country: string;
  link: string;
  comment: string;
  image_url?: string;
}

export interface DirectorItem {
  name: string;
  country: string;
  link: string;
  comment: string;
  image_url?: string;
}

interface MovieBlockProps {
  films?: MovieItem[];
  directors?: DirectorItem[];
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
        subTitle: `${item.director} · ${item.country}`,
      }),
    },
    {
      id: 'directors',
      label: '导演',
      items: directors,
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
      blockIcon={Film}
      themeColorClass="amber"
      colSpan={colSpan}
      interactiveScene={
        <FilmDeskScene
          films={films}
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
