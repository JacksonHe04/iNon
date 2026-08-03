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

export const EDITOR_SCHEMAS: Record<string, EditorSchema> = {
  ...IDENTITY_EDITOR_SCHEMAS,
  ...CREATION_EDITOR_SCHEMAS,
  reading: {
    id: 'reading',
    title: '9. 在读书单与作者 (Reading)',
    description: '管理在读书目、推荐书单、作者档案与读书感悟',
    icon: BookOpen,
    fields: [
      {
        key: 'books',
        label: '书籍档案 Books',
        type: 'object-array',
        createItem: () => ({ name: '', author: '', country: '', link: '', comment: '', image_url: '' }),
        getItemTitle: (item) => `${item.name || '书名'} — ${item.author || '作者'}`,
        subFields: [
          { key: 'name', label: '书名' },
          { key: 'author', label: '作者' },
          { key: 'country', label: '国家 / 地区' },
          { key: 'link', label: '豆瓣 / 购买链接' },
          { key: 'comment', label: '读书笔记与评语', type: 'textarea' },
          { key: 'image_url', label: '书籍封面 URL', type: 'image' },
        ],
      },
      {
        key: 'authors',
        label: '喜爱作者 Authors',
        type: 'object-array',
        createItem: () => ({ name: '', country: '', link: '', comment: '', image_url: '' }),
        getItemTitle: (item) => item.name || '作者姓名',
        subFields: [
          { key: 'name', label: '作者姓名' },
          { key: 'country', label: '国家 / 地区' },
          { key: 'link', label: '介绍链接' },
          { key: 'comment', label: '评价与推介', type: 'textarea' },
          { key: 'image_url', label: '作者图片 URL', type: 'image' },
        ],
      },
    ],
  },

  films: {
    id: 'films',
    title: '10. 影视海报墙与导演 (Films)',
    description: '管理看过的影片、最爱电影墙、导演档案与影评',
    icon: Film,
    fields: [
      {
        key: 'films',
        label: '电影与剧集 Films',
        type: 'object-array',
        createItem: () => ({ name: '', director: '', country: '', link: '', comment: '', image_url: '' }),
        getItemTitle: (item) => `${item.name || '片名'} — 导演: ${item.director || '未知'}`,
        subFields: [
          { key: 'name', label: '影片名称' },
          { key: 'director', label: '导演' },
          { key: 'country', label: '出品国家 / 地区' },
          { key: 'link', label: '豆瓣 / IMDb 链接' },
          { key: 'comment', label: '影评与观影感受', type: 'textarea' },
          { key: 'image_url', label: '影片封面 URL', type: 'image' },
        ],
      },
      {
        key: 'directors',
        label: '喜爱导演 Directors',
        type: 'object-array',
        createItem: () => ({ name: '', country: '', link: '', comment: '', image_url: '' }),
        getItemTitle: (item) => item.name || '导演姓名',
        subFields: [
          { key: 'name', label: '导演姓名' },
          { key: 'country', label: '国家 / 地区' },
          { key: 'link', label: '介绍链接' },
          { key: 'comment', label: '评价与推介', type: 'textarea' },
          { key: 'image_url', label: '导演图片 URL', type: 'image' },
        ],
      },
    ],
  },

  music: {
    id: 'music',
    title: '11. 喜爱音乐 (Music)',
    description: '管理常听的单曲、最爱专辑墙及喜爱音乐人',
    icon: Disc,
    fields: [
      {
        key: 'albums',
        label: '音乐专辑 Albums',
        type: 'object-array',
        createItem: () => ({ name: '', artist: '', link: '', comment: '', image_url: '' }),
        getItemTitle: (item) => `${item.name || '专辑名'} — ${item.artist || '艺人'}`,
        subFields: [
          { key: 'name', label: '专辑名称' },
          { key: 'artist', label: '艺人 / 乐队' },
          { key: 'link', label: '流媒体播放链接' },
          { key: 'comment', label: '专辑乐评', type: 'textarea' },
          { key: 'image_url', label: '专辑封面 URL', type: 'image' },
        ],
      },
      {
        key: 'songs',
        label: '喜爱单曲 Songs',
        type: 'object-array',
        createItem: () => ({ name: '', artist: '', album: '', link: '', comment: '', image_url: '' }),
        getItemTitle: (item) => `${item.name || '单曲名'} — ${item.artist || '艺人'}`,
        subFields: [
          { key: 'name', label: '歌曲名称' },
          { key: 'artist', label: '艺人 / 歌手' },
          { key: 'album', label: '所属专辑' },
          { key: 'link', label: '单曲播放链接' },
          { key: 'comment', label: '听歌感悟评语', type: 'textarea' },
          { key: 'image_url', label: '歌曲封面 URL', type: 'image' },
        ],
      },
      {
        key: 'musicians',
        label: '喜爱音乐人 Musicians',
        type: 'object-array',
        createItem: () => ({ name: '', region: '', link: '', comment: '', image_url: '' }),
        getItemTitle: (item) => item.name || '音乐人姓名',
        subFields: [
          { key: 'name', label: '音乐人 / 乐手' },
          { key: 'region', label: '地区 / 风格' },
          { key: 'link', label: '主页介绍链接' },
          { key: 'comment', label: '推介评语', type: 'textarea' },
          { key: 'image_url', label: '艺人照片 URL', type: 'image' },
        ],
      },
    ],
  },

  hiphop: {
    id: 'hiphop',
    title: '11b. 说唱说唱 (Hip Hop)',
    description: '管理 Hip Hop 单曲、最爱说唱专辑墙及说唱艺人',
    icon: Disc,
    fields: [
      {
        key: 'albums',
        label: '说唱专辑 Albums',
        type: 'object-array',
        createItem: () => ({ name: '', artist: '', link: '', comment: '', image_url: '' }),
        getItemTitle: (item) => `${item.name || '专辑名'} — ${item.artist || '歌手'}`,
        subFields: [
          { key: 'name', label: '专辑名称' },
          { key: 'artist', label: '歌手' },
          { key: 'link', label: '流媒体播放链接' },
          { key: 'comment', label: '专辑点评', type: 'textarea' },
          { key: 'image_url', label: '专辑封面 URL', type: 'image' },
        ],
      },
      {
        key: 'songs',
        label: '说唱单曲 Songs',
        type: 'object-array',
        createItem: () => ({ name: '', artist: '', album: '', link: '', comment: '', image_url: '' }),
        getItemTitle: (item) => `${item.name || '歌名'} — ${item.artist || '歌手'}`,
        subFields: [
          { key: 'name', label: '歌曲名称' },
          { key: 'artist', label: '说唱歌手' },
          { key: 'album', label: '所属专辑' },
          { key: 'link', label: '播放链接' },
          { key: 'comment', label: '单曲点评', type: 'textarea' },
          { key: 'image_url', label: '单曲封面 URL', type: 'image' },
        ],
      },
      {
        key: 'musicians',
        label: '说唱音乐人 Musicians',
        type: 'object-array',
        createItem: () => ({ name: '', region: '', link: '', comment: '', image_url: '' }),
        getItemTitle: (item) => item.name || '歌手姓名',
        subFields: [
          { key: 'name', label: '说唱艺人' },
          { key: 'region', label: '地区 / 厂牌' },
          { key: 'link', label: '介绍链接' },
          { key: 'comment', label: '推介评语', type: 'textarea' },
          { key: 'image_url', label: '歌手照片 URL', type: 'image' },
        ],
      },
    ],
  },

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
