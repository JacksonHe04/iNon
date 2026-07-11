import type { LayoutConfig, BlockConfig } from '@/types/layout';
import { getBlockTitle } from '@/lib/blocks/registry';

/**
 * 默认 layout 配置。Block 的展示标题由 `lib/blocks/registry` 单一事实源
 * 提供，本文件只保留结构性的默认参数（id、colSpan、visible、sectionId）。
 *
 * 之前每个 block 都在这里硬编码了一份 title（如 '音乐收藏卡片 (Music)'），
 * 导致与 Block 组件内部硬编码、侧栏 navSections 之间出现大量不一致。
 * 改用 registry 后，所有 UI 文案自动同步。
 *
 * 注：`BlockConfig.title` 字段保留是为兼容 DB 中可能遗留的旧数据，
 * 实际渲染时统一从 registry 读取（见 SideNav/TopNav/BlockCanvasEngine）。
 */
const DEFAULT_BLOCKS: Omit<BlockConfig, 'title'>[] = [
  { id: 'block-bio', blockType: 'bio', visible: true, colSpan: 2, sectionId: 'bio' },
  { id: 'block-bookmarks', blockType: 'bookmarks', visible: true, colSpan: 1, sectionId: 'portal' },
  { id: 'block-ai-clone', blockType: 'ai_clone', visible: true, colSpan: 1, sectionId: 'portal' },
  { id: 'block-app-launcher', blockType: 'app_launcher', visible: true, colSpan: 2, sectionId: 'portal' },
  { id: 'block-projects', blockType: 'projects', visible: true, colSpan: 2, sectionId: 'projects' },
  { id: 'block-timeline', blockType: 'timeline', visible: true, colSpan: 2, sectionId: 'experience' },
  { id: 'block-music', blockType: 'music', visible: true, colSpan: 1, sectionId: 'media' },
  { id: 'block-movies', blockType: 'movies', visible: true, colSpan: 1, sectionId: 'media' },
  { id: 'block-books', blockType: 'books', visible: true, colSpan: 1, sectionId: 'media' },
  { id: 'block-friend-links', blockType: 'friend_links', visible: true, colSpan: 1, sectionId: 'links' },
  { id: 'block-contact', blockType: 'contact', visible: true, colSpan: 2, sectionId: 'contact' },
  { id: 'block-education', blockType: 'education', visible: true, colSpan: 2, sectionId: 'education' },
  { id: 'block-work', blockType: 'work', visible: true, colSpan: 2, sectionId: 'work' },
  { id: 'block-skills', blockType: 'skills', visible: true, colSpan: 2, sectionId: 'skills' },
  { id: 'block-dev-tools', blockType: 'dev_tools', visible: true, colSpan: 2, sectionId: 'dev_tools' },
  { id: 'block-products', blockType: 'products', visible: true, colSpan: 2, sectionId: 'products' },
  { id: 'block-creation', blockType: 'creation', visible: true, colSpan: 2, sectionId: 'creation' },
  { id: 'block-hiphop', blockType: 'hiphop', visible: true, colSpan: 2, sectionId: 'hiphop' },
  { id: 'block-events', blockType: 'events', visible: true, colSpan: 2, sectionId: 'events' },
  { id: 'block-tags', blockType: 'tags', visible: true, colSpan: 2, sectionId: 'tags' },
];

export const DEFAULT_LAYOUT_CONFIG: LayoutConfig = {
  blocks: DEFAULT_BLOCKS.map((b) => ({ ...b, title: getBlockTitle(b.blockType) })),
  // navSections 已废弃：侧栏项现在直接对应每个可见 of block，标题从 registry 取。
  navSections: [],
  theme: 'green',
};
