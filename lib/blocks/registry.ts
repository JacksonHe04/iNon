import type { LucideIcon } from 'lucide-react';
import {
  User,
  Globe,
  Bot,
  LayoutGrid,
  Briefcase,
  Music,
  Film,
  BookOpen,
  Gamepad2,
  Clock,
  Link2,
  Mail,
  Lightbulb,
  GraduationCap,
  Building2,
  Smartphone,
  Palette,
  Mic2,
  CalendarDays,
  Tag,
  Wrench,
  Code2,
  MessageSquare,
} from 'lucide-react';
import type { BlockType } from '@/types/layout';

/**
 * Block 单一事实源（Single Source of Truth）。
 *
 * iNon 项目中所有展示用文案与图标（侧栏菜单项、公开页 Block 卡片标题、
 * 控制台画板列表/控件条等）都从这里读取。任何 blockType 对应的标题和图标
 * 只能在这一处声明，禁止在 Block 组件、layout config、Sidebar/SideNav
 * 等任何地方重复硬编码。
 *
 * 字段约定：
 * - title: 该 blockType 在所有用户可见位置的统一展示文案。
 * - icon: 对应的 lucide-react 图标组件。
 */
export type BlockDisplayConfig = {
  type: BlockType;
  title: string;
  icon: LucideIcon;
};

export const BLOCK_REGISTRY: Record<BlockType, BlockDisplayConfig> = {
  bio: { type: 'bio', title: '个人简介', icon: User },
  bookmarks: { type: 'bookmarks', title: '常用网站', icon: Globe },
  ai_clone: { type: 'ai_clone', title: 'AI 分身', icon: Bot },
  app_launcher: { type: 'app_launcher', title: 'App 启动', icon: LayoutGrid },
  projects: { type: 'projects', title: '核心项目', icon: Briefcase },
  music: { type: 'music', title: '音乐收藏', icon: Music },
  movies: { type: 'movies', title: '影视收藏', icon: Film },
  books: { type: 'books', title: '书单收藏', icon: BookOpen },
  games: { type: 'games', title: '游戏收藏', icon: Gamepad2 },
  timeline: { type: 'timeline', title: '时间线', icon: Clock },
  friend_links: { type: 'friend_links', title: '友情链接', icon: Link2 },
  contact: { type: 'contact', title: '联系方式', icon: Mail },
  thoughts: { type: 'thoughts', title: '思考', icon: Lightbulb },
  education: { type: 'education', title: '教育背景', icon: GraduationCap },
  work: { type: 'work', title: '工作履历', icon: Building2 },
  products: { type: 'products', title: '产品收藏', icon: Smartphone },
  creation: { type: 'creation', title: '个人创作', icon: Palette },
  hiphop: { type: 'hiphop', title: '嘻哈收藏', icon: Mic2 },
  events: { type: 'events', title: 'Live 现场', icon: CalendarDays },
  tags: { type: 'tags', title: '标签墙', icon: Tag },
  skills: { type: 'skills', title: '专业技能', icon: Code2 },
  dev_tools: { type: 'dev_tools', title: '开发工具', icon: Wrench },
  messages: { type: 'messages', title: '留言板', icon: MessageSquare },
};

/** 取一个 blockType 的展示标题（所有 UI 共用）。 */
export function getBlockTitle(type: BlockType): string {
  return BLOCK_REGISTRY[type].title;
}

/** 取一个 blockType 的展示图标（所有 UI 共用）。 */
export function getBlockIcon(type: BlockType): LucideIcon {
  return BLOCK_REGISTRY[type].icon;
}
