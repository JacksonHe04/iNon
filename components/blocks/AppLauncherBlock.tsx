'use client';

import { AppWindow } from 'lucide-react';
import LinkGridBlock, { type LinkGridItem } from './LinkGridBlock';

export interface AppItem {
  id: string;
  name: string;
  category: string;
  link: string;
  icon?: string;
}

interface AppLauncherBlockProps {
  apps?: AppItem[];
  title?: string;
}

export default function AppLauncherBlock({ apps = [], title }: AppLauncherBlockProps) {
  const linkItems: LinkGridItem[] = apps.map((app) => ({
    id: app.id,
    name: app.name,
    href: app.link,
    icon: app.icon,
    subtitle: app.category,
  }));

  return (
    <LinkGridBlock
      items={linkItems}
      title={title}
      blockIcon={AppWindow}
      themeColorClass="purple"
      countLabel="个应用"
      defaultIcon="🚀"
    />
  );
}
