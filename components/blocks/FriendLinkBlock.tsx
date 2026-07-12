'use client';

import { Users } from 'lucide-react';
import { getBlockTitle } from '@/lib/blocks/registry';
import ShortcutGridBlock, { type ShortcutItem } from './ShortcutGridBlock';

export interface FriendLinkItem {
  id: string;
  name: string;
  link: string;
  avatarUrl?: string;
  description?: string;
}

interface FriendLinkBlockProps {
  items: FriendLinkItem[];
  title?: string;
}

export default function FriendLinkBlock({
  items = [],
  title = getBlockTitle('friend_links'),
}: FriendLinkBlockProps) {
  const shortcutItems: ShortcutItem[] = items.map((item) => ({
    id: item.id,
    name: item.name,
    link: item.link,
    icon: '🌐',
  }));

  return (
    <ShortcutGridBlock
      items={shortcutItems}
      title={title}
      blockIcon={Users}
      themeColorClass="blue"
      countText="个友链"
      defaultEmoji="🌐"
    />
  );
}
