import {
  User,
  Heart,
  Calendar,
  GraduationCap,
  Briefcase,
  Code2,
  Gamepad2,
  Film,
  Disc,
  BookOpen,
  Send,
  MessageSquare,
  Bell,
  Sparkles,
} from 'lucide-react';
import type { EditorSchema } from './types';
import { IDENTITY_EDITOR_SCHEMAS } from './schemas/identity';
import { CREATION_EDITOR_SCHEMAS } from './schemas/creation';
import { LIBRARY_EDITOR_SCHEMAS } from './schemas/library';

export const EDITOR_SCHEMAS: Record<string, EditorSchema> = {
  ...IDENTITY_EDITOR_SCHEMAS,
  ...CREATION_EDITOR_SCHEMAS,
  ...LIBRARY_EDITOR_SCHEMAS,
  events: {
    id: 'events',
    title: '12. 演出演出 (Events)',
    description: '管理公开演出的现场记录及大事件',
    icon: Calendar,
    fields: [
      {
        key: 'performances',
        label: '公开演出活动',
        type: 'object-array',
        createItem: () => ({ type: '', name: '', date: '', genre: '', location: '' }),
        getItemTitle: (item) => `${item.date || '时间'} - ${item.name || '活动名称'}`,
        subFields: [
          { key: 'type', label: '活动类型', placeholder: '如: 演唱会 / 音乐节 / 话剧' },
          { key: 'name', label: '活动 / 演出名称' },
          { key: 'date', label: '演出日期', placeholder: '如: 2024.05.18' },
          { key: 'genre', label: '风格 / 流派' },
          { key: 'location', label: '演出地点 / 场馆' },
        ],
      },
    ],
  },

  contact: {
    id: 'contact',
    title: '13. 联络信息 (Contact)',
    description: '配置日常联络方式（微信、邮箱）以及社交平台/社区的个人主页',
    icon: Send,
    fields: [
      {
        key: 'contact_info',
        label: '主要联系通道',
        type: 'object-array',
        createItem: () => ({ method_name: '', content: '' }),
        getItemTitle: (item) => `${item.method_name || '联系方式'}: ${item.content || ''}`,
        subFields: [
          { key: 'method_name', label: '通道名称', placeholder: '如: WeChat / Email' },
          { key: 'content', label: '联络账号 / 内容', placeholder: '如: jackson@domain.com' },
        ],
      },
      {
        key: 'platform_accounts',
        label: '社交与技术社区平台',
        type: 'object-array',
        createItem: () => ({ platform_name: '', username: '', homepage_link: '' }),
        getItemTitle: (item) => `${item.platform_name || '平台'}: ${item.username || ''}`,
        subFields: [
          { key: 'platform_name', label: '平台名称', placeholder: '如: GitHub / Juejin' },
          { key: 'username', label: '平台用户 ID / 昵称' },
          { key: 'homepage_link', label: '个人主页 URL' },
        ],
      },
    ],
  },

  thoughts: {
    id: 'thoughts',
    title: '14. 个人思想 (Thoughts)',
    description: '记录关于技术、生活、世界的思想切片以及常见的问答记录',
    icon: MessageSquare,
    groups: [
      { id: 'philosophy', label: '个人与行业哲学', fields: ['personal_philosophy', 'industry_views', 'ideology'] },
      { id: 'vision', label: '人生要素与愿景', fields: ['life_elements', 'macro_vision', 'personal_vision'] },
      { id: 'qa', label: '常见 Q&A', fields: ['qa'] },
    ],
    fields: [
      { key: 'personal_philosophy', label: '技术与个人哲学 Philosophy', type: 'string-list' },
      { key: 'industry_views', label: '行业观点 Industry Views', type: 'string-list' },
      { key: 'ideology', label: '思想钢印 Ideology', type: 'string-list' },
      { key: 'life_elements', label: '生活基本要素 Life Elements', type: 'string-list' },
      { key: 'macro_vision', label: '宏观愿景 Macro Vision', type: 'string-list' },
      { key: 'personal_vision', label: '个人微观愿景 Personal Vision', type: 'string-list' },
      {
        key: 'qa',
        label: '常见问题解答 (Q&A)',
        type: 'object-array',
        createItem: () => ({ question: '', answer: '', source: '', date: '' }),
        getItemTitle: (item) => item.question || '问题',
        subFields: [
          { key: 'question', label: '问题 Question' },
          { key: 'answer', label: '回答 Answer', type: 'textarea' },
          { key: 'source', label: '来源 / 出处' },
          { key: 'date', label: '记录年月' },
        ],
      },
    ],
  },

  notifications: {
    id: 'notifications',
    title: '15. 公告动态 (Notifications)',
    description: '管理公开主页顶部滚动的置顶动态、公告与近期广播',
    icon: Bell,
    fields: [
      {
        key: 'notifications',
        label: '公告栏置顶动态',
        type: 'object-array',
        createItem: () => ({ date: '', text: '', type: '' }),
        getItemTitle: (item) => `${item.date || '日期'}: ${item.text || ''}`,
        subFields: [
          { key: 'date', label: '公告日期', placeholder: '如: 2024.06.01' },
          { key: 'text', label: '公告动态文字内容', type: 'textarea' },
          { key: 'type', label: '分类 / 等级', placeholder: '如: info / warning / success' },
        ],
      },
    ],
  },
};
