'use client';

import { Bookmark } from 'lucide-react';
import LinkGridBlock, { type LinkGridItem } from './LinkGridBlock';

export interface BookmarkItem {
  id: string;
  title: string;
  url: string;
  icon?: string;
  category?: string;
}

interface BookmarkBlockProps {
  items: BookmarkItem[];
  editable?: boolean;
  title?: string;
  onAdd?: (title: string, url: string) => void;
  onDelete?: (id: string) => void;
}

export default function BookmarkBlock({
  items,
  editable = false,
  title,
  onDelete,
}: BookmarkBlockProps) {
  const linkItems: LinkGridItem[] = items.map((item) => ({
    id: item.id,
    name: item.title,
    href: item.url,
    icon: item.icon,
    subtitle: item.category,
  }));

  return (
    <LinkGridBlock
      items={linkItems}
      title={title}
      blockIcon={Bookmark}
      themeColorClass="teal"
      countLabel="个收藏"
      defaultIcon="🔗"
      onDelete={editable ? onDelete : undefined}
    />
  );
}
