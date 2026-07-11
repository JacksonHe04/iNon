export type BlockType =
  | 'bio'
  | 'bookmarks'
  | 'ai_clone'
  | 'app_launcher'
  | 'projects'
  | 'music'
  | 'movies'
  | 'books'
  | 'games'
  | 'timeline'
  | 'friend_links'
  | 'contact'
  | 'thoughts'
  | 'education'
  | 'work'
  | 'products'
  | 'creation'
  | 'hiphop'
  | 'events'
  | 'tags'
  | 'skills'
  | 'dev_tools';

export type BlockConfig = {
  id: string;
  blockType: BlockType;
  title: string;
  visible: boolean;
  colSpan: 1 | 2; // 1 = half width (50%), 2 = full width (100%)
  sectionId?: string; // Optional navigation section anchor ID
};

export type NavSectionConfig = {
  id: string;
  label: string;
  targetBlockId: string;
};

export type ThemeType = 'green' | 'red' | 'orange' | 'blue' | 'gray';

export type LayoutConfig = {
  blocks: BlockConfig[];
  navSections: NavSectionConfig[];
  theme?: ThemeType;
};

