import { Code2, Gamepad2, Sparkles } from 'lucide-react';
import type { EditorSchema } from '../types';

export const CREATION_EDITOR_SCHEMAS: Record<string, EditorSchema> = {
  development: {
    id: 'development',
    title: '6. 技术与项目 (Development)',
    description: '管理所掌握的技术栈、核心开源或商业项目、开发工具箱',
    icon: Code2,
    groups: [
      { id: 'skills', label: '技术与专长', fields: ['skills.tech_stack', 'skills.expertise'] },
      { id: 'projects', label: '代表作品', fields: ['projects'] },
      { id: 'tools', label: '开发工具箱', fields: ['dev_tools'] },
    ],
    fields: [
      { key: 'skills.tech_stack', label: '技术栈 Tech Stack', type: 'string-list' },
      { key: 'skills.expertise', label: '专长领域 Expertise', type: 'string-list' },
      {
        key: 'projects',
        label: '代表作项目 Projects',
        type: 'object-array',
        createItem: () => ({
          project_name: '',
          github: '',
          link: '',
          description: '',
          tech_stack: [],
          role: [],
          start_date: '',
          end_date: '',
          report_link: '',
        }),
        getItemTitle: (item) => item.project_name || '项目名称',
        subFields: [
          { key: 'project_name', label: '项目名称' },
          { key: 'github', label: 'GitHub 仓库 URL' },
          { key: 'link', label: '线上演示链接' },
          { key: 'description', label: '项目简述', type: 'textarea' },
          { key: 'start_date', label: '开始年月' },
          { key: 'end_date', label: '结束年月' },
          { key: 'report_link', label: '复盘/研究报告链接' },
        ],
      },
      {
        key: 'dev_tools',
        label: '开发工具箱 Dev Tools',
        type: 'object-array',
        createItem: () => ({ name: '', link: '', comment: '', tags: [] }),
        getItemTitle: (item) => item.name || '工具名称',
        subFields: [
          { key: 'name', label: '工具名称' },
          { key: 'link', label: '工具链接' },
          { key: 'comment', label: '工具评价/评语', type: 'textarea' },
        ],
      },
    ],
  },

  products: {
    id: 'products',
    title: '7. 装备好物 (Products)',
    description: '展示你的日常随身数码装备、主力数码硬件及喜爱品牌',
    icon: Gamepad2,
    groups: [
      { id: 'hardware', label: '主力硬件', fields: ['my_hardware.phone', 'my_hardware.computer', 'my_hardware.tablet', 'my_hardware.smartwatch', 'my_hardware.headphones'] },
      { id: 'products', label: '好物推荐', fields: ['favorite_products'] },
      { id: 'brands', label: '偏爱品牌', fields: ['favorite_brands'] },
    ],
    fields: [
      { key: 'my_hardware.phone', label: '主力手机', type: 'text' },
      { key: 'my_hardware.computer', label: '主力电脑', type: 'text' },
      { key: 'my_hardware.tablet', label: '主力平板', type: 'text' },
      { key: 'my_hardware.smartwatch', label: '智能手表', type: 'text' },
      { key: 'my_hardware.headphones', label: '日常耳机', type: 'string-list' },
      {
        key: 'favorite_products',
        label: '好物推荐 Products',
        type: 'object-array',
        createItem: () => ({ name: '', link: '', intro: '', image_url: '' }),
        getItemTitle: (item) => item.name || '好物名称',
        subFields: [
          { key: 'name', label: '好物名称' },
          { key: 'link', label: '购买/详情链接' },
          { key: 'intro', label: '一句话点评', type: 'textarea' },
          { key: 'image_url', label: '好物图片 URL', type: 'image' },
        ],
      },
      {
        key: 'favorite_brands',
        label: '偏爱品牌 Brands',
        type: 'object-array',
        createItem: () => ({ name: '', link: '', intro: '', image_url: '' }),
        getItemTitle: (item) => item.name || '品牌名称',
        subFields: [
          { key: 'name', label: '品牌名称' },
          { key: 'link', label: '官网链接' },
          { key: 'intro', label: '品牌态度评语', type: 'textarea' },
          { key: 'image_url', label: '品牌图片 URL', type: 'image' },
        ],
      },
    ],
  },

  creation: {
    id: 'creation',
    title: '8. 创意作品 (Creation)',
    description: '管理制作的视频节目、个人文章专栏、公开演讲、座右铭及名言格言',
    icon: Sparkles,
    groups: [
      { id: 'motto_quote', label: '座右铭与名言', fields: ['mottos', 'quotes'] },
      { id: 'media', label: '视频与播客', fields: ['videos'] },
      { id: 'writing', label: '文章与演讲', fields: ['articles', 'speeches'] },
    ],
    fields: [
      { key: 'mottos', label: '座右铭 Mottos', type: 'string-list' },
      { key: 'quotes', label: '喜爱名言 Quotes', type: 'string-list' },
      {
        key: 'videos',
        label: '视频与播客节目 Videos',
        type: 'object-array',
        createItem: () => ({ series: '', title: '', video_link: '', podcast_link: '', image_url: '' }),
        getItemTitle: (item) => item.title || '视频标题',
        subFields: [
          { key: 'title', label: '视频标题' },
          { key: 'series', label: '所属系列/栏目' },
          { key: 'video_link', label: '视频播放链接' },
          { key: 'podcast_link', label: '音频/播客链接' },
          { key: 'image_url', label: '视频封面图片 URL', type: 'image' },
        ],
      },
      {
        key: 'articles',
        label: '文章与专栏 Articles',
        type: 'object-array',
        createItem: () => ({ title: '', link: '', excerpt: '', image_url: '' }),
        getItemTitle: (item) => item.title || '文章标题',
        subFields: [
          { key: 'title', label: '文章标题' },
          { key: 'link', label: '文章阅读链接' },
          { key: 'excerpt', label: '文章摘要', type: 'textarea' },
          { key: 'image_url', label: '文章封面图片 URL', type: 'image' },
        ],
      },
      {
        key: 'speeches',
        label: '公开演讲/展示 Speeches',
        type: 'object-array',
        createItem: () => ({ speech_name: '', link: '', outline_doc: '', presentation_link: '', image_url: '' }),
        getItemTitle: (item) => item.speech_name || '演讲主题',
        subFields: [
          { key: 'speech_name', label: '演讲主题' },
          { key: 'link', label: '回放链接' },
          { key: 'presentation_link', label: '幻灯片 PPT 链接' },
          { key: 'outline_doc', label: '演讲大纲/手稿文档', type: 'textarea' },
          { key: 'image_url', label: '背景封面图片 URL', type: 'image' },
        ],
      },
    ],
  },

};
