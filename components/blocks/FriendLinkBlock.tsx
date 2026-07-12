'use client';

import { Users } from 'lucide-react';
import { getBlockTitle } from '@/lib/blocks/registry';
import LinkGridBlock, { type LinkGridItem } from './LinkGridBlock';

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
  const linkItems: LinkGridItem[] = items.map((item) => ({
    id: item.id,
    name: item.name,
    href: item.link,
    icon: '🌐',
    imageUrl: item.avatarUrl,
    subtitle: item.description,
  }));

  return (
    <LinkGridBlock
      items={linkItems}
      title={title}
      blockIcon={Users}
      themeColorClass="blue"
      countLabel="个友链"
      defaultIcon="🌐"
    />
  );
}
