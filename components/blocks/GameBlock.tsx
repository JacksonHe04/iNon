'use client';

import { Gamepad2 } from 'lucide-react';
import { getBlockTitle } from '@/lib/blocks/registry';
import ShortcutGridBlock, { type ShortcutItem } from './ShortcutGridBlock';

export interface GameItem {
  id: string;
  name: string;
  platform?: string;
  link?: string;
  status?: string;
}

interface GameBlockProps {
  items: GameItem[];
  title?: string;
}

export default function GameBlock({ items = [], title = getBlockTitle('games') }: GameBlockProps) {
  const shortcutItems: ShortcutItem[] = items.map((item) => ({
    id: item.id,
    name: item.name,
    link: item.link,
    icon: '🎮',
  }));

  return (
    <ShortcutGridBlock
      items={shortcutItems}
      title={title}
      blockIcon={Gamepad2}
      themeColorClass="cyan"
      countText="款游戏"
      defaultEmoji="🎮"
    />
  );
}
