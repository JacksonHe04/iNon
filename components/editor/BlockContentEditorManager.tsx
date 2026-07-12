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
import { Heart, Code2, Bell } from 'lucide-react';
import { BLOCK_REGISTRY } from '@/lib/blocks/registry';

/**
 * 内容管理 tab 的数据编辑分组。注意：这是「数据编辑主题」分类，
 * 部分分类直接引用 BLOCK_REGISTRY 关联 Block 的 title 与 icon，
 * 确保文案与图标全局统一。
 */
const BLOCK_CATEGORIES = [
  { id: 'basic', label: BLOCK_REGISTRY.bio.title, icon: BLOCK_REGISTRY.bio.icon },
  { id: 'life', label: '生活状态', icon: Heart },
  { id: 'experience', label: BLOCK_REGISTRY.timeline.title, icon: BLOCK_REGISTRY.timeline.icon },
  { id: 'education', label: BLOCK_REGISTRY.education.title, icon: BLOCK_REGISTRY.education.icon },
  { id: 'work', label: BLOCK_REGISTRY.work.title, icon: BLOCK_REGISTRY.work.icon },
  { id: 'development', label: '技术与项目', icon: Code2 },
  { id: 'products', label: BLOCK_REGISTRY.products.title, icon: BLOCK_REGISTRY.products.icon },
  { id: 'creation', label: BLOCK_REGISTRY.creation.title, icon: BLOCK_REGISTRY.creation.icon },
  { id: 'reading', label: BLOCK_REGISTRY.books.title, icon: BLOCK_REGISTRY.books.icon },
  { id: 'films', label: BLOCK_REGISTRY.movies.title, icon: BLOCK_REGISTRY.movies.icon },
  { id: 'music', label: BLOCK_REGISTRY.music.title, icon: BLOCK_REGISTRY.music.icon },
  { id: 'events', label: BLOCK_REGISTRY.events.title, icon: BLOCK_REGISTRY.events.icon },
  { id: 'contact', label: BLOCK_REGISTRY.contact.title, icon: BLOCK_REGISTRY.contact.icon },
  { id: 'thoughts', label: BLOCK_REGISTRY.thoughts.title, icon: BLOCK_REGISTRY.thoughts.icon },
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
