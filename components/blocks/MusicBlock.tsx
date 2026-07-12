'use client';

import { Disc, Play, Disc2, Music } from 'lucide-react';
import CollectionGridBlock, { type CollectionTabConfig } from './CollectionGridBlock';
import { getBlockTitle } from '@/lib/blocks/registry';

export interface MusicAlbum {
  name: string;
  artist: string;
  link: string;
  comment: string;
  image_url?: string;
}

export interface MusicSong {
  name: string;
  artist: string;
  album: string;
  link: string;
  comment: string;
  image_url?: string;
}

export interface MusicMusician {
  name: string;
  region: string;
  link: string;
  comment: string;
  image_url?: string;
}

interface MusicBlockProps {
  albums?: MusicAlbum[];
  songs?: MusicSong[];
  musicians?: MusicMusician[];
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
        subTitle: item.artist,
      }),
    },
    {
      id: 'songs',
      label: '单曲',
      items: songs,
      icon: Play,
      getCardMeta: (item) => ({
        title: item.name,
        subTitle: `${item.artist} · ${item.album}`,
      }),
    },
    {
      id: 'musicians',
      label: '音乐人',
      items: musicians,
      icon: Disc2,
      getCardMeta: (item) => ({
        title: item.name,
        subTitle: item.region,
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
