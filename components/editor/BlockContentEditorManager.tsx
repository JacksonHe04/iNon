'use client';

import { useState } from 'react';
import type { ReadmeData } from '@/types';
import BasicEditor from './sections/BasicEditor';
import LifeEditor from './sections/LifeEditor';
import ExperienceEditor from './sections/ExperienceEditor';
import EducationEditor from './sections/EducationEditor';
import WorkEditor from './sections/WorkEditor';
import DevelopmentEditor from './sections/DevelopmentEditor';
import ProductsEditor from './sections/ProductsEditor';
import CreationEditor from './sections/CreationEditor';
import ReadingEditor from './sections/ReadingEditor';
import FilmsEditor from './sections/FilmsEditor';
import MusicEditor from './sections/MusicEditor';
import EventsEditor from './sections/EventsEditor';
import ContactEditor from './sections/ContactEditor';
import ThoughtsEditor from './sections/ThoughtsEditor';
import NotificationsEditor from './sections/NotificationsEditor';
import {
  User,
  Heart,
  MapPin,
  GraduationCap,
  Briefcase,
  Code2,
  Laptop,
  PenTool,
  BookOpen,
  Film,
  Music,
  Calendar,
  Send,
  Compass,
  Bell,
} from 'lucide-react';

/**
 * 内容管理 tab 的数据编辑分组。注意：这是「数据编辑主题」分类，
 * 不是 blockType 维度——一组 block 的数据可能由一个 category 编辑
 * （例如 development 同时编辑 skills + projects + dev_tools）。
 * label 直接在此声明，不再从 registry 取（registry 是 blockType 级，
 * 与这种聚合维度不是 1:1 关系）。label 保持纯中文、无中英混排。
 */
const BLOCK_CATEGORIES = [
  { id: 'basic', label: '基本信息', icon: User },
  { id: 'life', label: '生活状态', icon: Heart },
  { id: 'experience', label: '个人经历', icon: MapPin },
  { id: 'education', label: '教育背景', icon: GraduationCap },
  { id: 'work', label: '工作履历', icon: Briefcase },
  { id: 'development', label: '技术与项目', icon: Code2 },
  { id: 'products', label: '硬件与产品', icon: Laptop },
  { id: 'creation', label: '内容创作', icon: PenTool },
  { id: 'reading', label: '在读书单', icon: BookOpen },
  { id: 'films', label: '影视墙', icon: Film },
  { id: 'music', label: '音乐库', icon: Music },
  { id: 'events', label: '里程碑事件', icon: Calendar },
  { id: 'contact', label: '联系方式', icon: Send },
  { id: 'thoughts', label: '思考与 Q&A', icon: Compass },
  { id: 'notifications', label: '动态公告', icon: Bell },
] as const;

type CategoryId = (typeof BLOCK_CATEGORIES)[number]['id'];

interface BlockContentEditorManagerProps {
  data: ReadmeData;
}

export default function BlockContentEditorManager({ data }: BlockContentEditorManagerProps) {
  const [activeCategory, setActiveCategory] = useState<CategoryId>('basic');

  return (
    <div className="space-y-6">
      {/* Category Pills Header */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {BLOCK_CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all border ${
                isActive
                  ? 'bg-gradient-to-r from-teal-500 to-emerald-500 text-white border-teal-400 shadow-md scale-[1.02]'
                  : 'bg-white/40 dark:bg-gray-800/40 text-gray-700 dark:text-gray-300 border-white/20 hover:bg-white/60 dark:hover:bg-gray-800/60'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Content Sections */}
      <div className="space-y-6 animate-fadeIn">
        {activeCategory === 'basic' && (
          <BasicEditor initialData={data} />
        )}
        {activeCategory === 'life' && (
          <LifeEditor initialData={data} />
        )}
        {activeCategory === 'experience' && (
          <ExperienceEditor initialData={data} />
        )}
        {activeCategory === 'education' && (
          <EducationEditor initialData={data} />
        )}
        {activeCategory === 'work' && (
          <WorkEditor initialData={data} />
        )}
        {activeCategory === 'development' && (
          <DevelopmentEditor initialData={data} />
        )}
        {activeCategory === 'products' && (
          <ProductsEditor initialData={data} />
        )}
        {activeCategory === 'creation' && (
          <CreationEditor initialData={data} />
        )}
        {activeCategory === 'reading' && (
          <ReadingEditor initialData={data} />
        )}
        {activeCategory === 'films' && (
          <FilmsEditor initialData={data} />
        )}
        {activeCategory === 'music' && (
          <MusicEditor initialData={data} />
        )}
        {activeCategory === 'events' && (
          <EventsEditor initialData={data} />
        )}
        {activeCategory === 'contact' && (
          <ContactEditor initialData={data} />
        )}
        {activeCategory === 'thoughts' && (
          <ThoughtsEditor initialData={data} />
        )}
        {activeCategory === 'notifications' && (
          <NotificationsEditor initialData={data} />
        )}
      </div>
    </div>
  );
}
