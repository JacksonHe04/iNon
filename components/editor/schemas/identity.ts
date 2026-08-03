import { Briefcase, Calendar, GraduationCap, Heart, User } from 'lucide-react';
import type { EditorSchema } from '../types';

export const IDENTITY_EDITOR_SCHEMAS: Record<string, EditorSchema> = {
  profile: {
    id: 'profile',
    title: '1. 个人基本信息 (Basic & Meta)',
    description: '配置网站公开显示的姓名、简介、标签、价值观及 SEO 元数据',
    icon: User,
    fields: [
      { key: 'basic.name', label: '姓名 / 昵称', type: 'text', required: true },
      { key: 'basic.current_status', label: '当前状态', type: 'text', placeholder: '如: 正在构建 iNon OS...' },
      { key: 'basic.intro', label: '一句话简介 / Bio', type: 'textarea' },
      { key: 'basic.keywords', label: '关键词 Keywords', type: 'string-list' },
      { key: 'basic.values', label: '价值观 Values', type: 'string-list' },
      { key: 'basic.tags', label: '个人标签 Tags', type: 'string-list' },
      { key: 'meta.title', label: '网页标题 (Meta Title)', type: 'text' },
      { key: 'meta.author', label: '网页作者 (Meta Author)', type: 'text' },
      { key: 'meta.description', label: '网页描述 (Meta Description)', type: 'text' },
    ],
  },

  life: {
    id: 'life',
    title: '2. 生活状态 (Life)',
    description: '管理常驻城市、MBTI、生日星座及日常饮食与生活习惯',
    icon: Heart,
    fields: [
      { key: 'current_city', label: '常驻城市', type: 'text' },
      { key: 'birth_date', label: '出生日期', type: 'text' },
      { key: 'zodiac_sign', label: '星座', type: 'text' },
      { key: 'mbti.life_mbti', label: '生活 MBTI', type: 'text' },
      { key: 'mbti.work_mbti', label: '工作 MBTI', type: 'text' },
      { key: 'habits', label: '日常习惯 Habits', type: 'string-list' },
      { key: 'diet.favorite_food', label: '喜爱美食 Favorite Food', type: 'string-list' },
      { key: 'diet.favorite_drinks', label: '喜爱饮品 Favorite Drinks', type: 'string-list' },
    ],
  },

  experience: {
    id: 'experience',
    title: '3. 个人里程碑 (Timeline)',
    description: '管理公开的时间轴历程事件与城市分布',
    icon: Calendar,
    fields: [
      {
        key: 'experience',
        label: '时间轴里程碑',
        type: 'object-array',
        createItem: () => ({ date: '', city: '', description: '' }),
        getItemTitle: (item) => `${item.date || '时间'} - ${item.city || '城市'}`,
        subFields: [
          { key: 'date', label: '发生日期 / 年月', placeholder: '如: 2023.08' },
          { key: 'city', label: '城市', placeholder: '如: 深圳' },
          { key: 'description', label: '事件描述', type: 'textarea' },
        ],
      },
    ],
  },

  education: {
    id: 'education',
    title: '4. 教育背景 (Education)',
    description: '管理求学经历、院校专业、学术研究及导师',
    icon: GraduationCap,
    fields: [
      { key: 'undergraduate_major', label: '本科专业', type: 'text' },
      { key: 'undergraduate_advisor', label: '本科导师', type: 'text' },
      {
        key: 'schools',
        label: '学校与院校经历',
        type: 'object-array',
        createItem: () => ({ institution: '', degree: '', major: '', start_date: '', end_date: '' }),
        getItemTitle: (item) => `${item.institution || '学校'} - ${item.degree || '学位'}`,
        subFields: [
          { key: 'institution', label: '院校 / 机构', placeholder: '如: 北京大学' },
          { key: 'degree', label: '学位', placeholder: '如: 学士 / 硕士' },
          { key: 'major', label: '专业', placeholder: '如: 计算机科学' },
          { key: 'start_date', label: '入学时间', placeholder: '如: 2020.09' },
          { key: 'end_date', label: '毕业时间', placeholder: '如: 2024.06' },
        ],
      },
    ],
  },

  work: {
    id: 'work',
    title: '5. 职业履历 (Work)',
    description: '管理工作经历、公司职位、职责及产出偏好',
    icon: Briefcase,
    fields: [
      { key: 'current_job', label: '当前职位', type: 'text' },
      { key: 'work_preferences', label: '工作偏好 Preferences', type: 'string-list' },
      {
        key: 'jobs',
        label: '工作及项目经历',
        type: 'object-array',
        createItem: () => ({
          company_name: '',
          position: '',
          position_type: '',
          start_date: '',
          end_date: '',
          products_responsible_for: '',
          job_summary: '',
          work_output: '',
        }),
        getItemTitle: (item) => `${item.company_name || '公司'} - ${item.position || '职位'}`,
        subFields: [
          { key: 'company_name', label: '公司 / 雇主名称' },
          { key: 'position', label: '担任职位' },
          { key: 'position_type', label: '工作类型', placeholder: '如: 全职 / 兼职' },
          { key: 'start_date', label: '入职日期', placeholder: '如: 2022.06' },
          { key: 'end_date', label: '离职日期', placeholder: '如: 2024.03' },
          { key: 'products_responsible_for', label: '负责产品 / 业务' },
          { key: 'job_summary', label: '工作概述', type: 'textarea' },
          { key: 'work_output', label: '工作产出 / 核心成果', type: 'textarea' },
        ],
      },
    ],
  },

};
