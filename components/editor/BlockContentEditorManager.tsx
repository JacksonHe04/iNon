'use client';

import { useState } from 'react';
import type { ReadmeData } from '@/types';
import SchemaEditorEngine from './SchemaEditorEngine';
import { EDITOR_SCHEMAS } from './EditorSchemas';
import { BLOCK_REGISTRY } from '@/lib/blocks/registry';
import { Heart, Code2, Bell } from 'lucide-react';

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

  // 由于 profile 编辑器需要处理 basic 与 meta 的两级联动，我们把它的 Schema ID 映射回 profile 
  const schemaId = activeCategory === 'basic' ? 'profile' : activeCategory;
  const currentSchema = EDITOR_SCHEMAS[schemaId];

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
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all border cursor-pointer ${
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

      {/* Content Sections - 统一使用声明式配置表单引擎渲染 */}
      <div className="space-y-6 animate-fadeIn">
        {currentSchema ? (
          <SchemaEditorEngine
            key={currentSchema.id}
            initialData={data}
            schema={currentSchema}
          />
        ) : (
          <div className="text-sm text-gray-400">找不到对应版块的表单配置。</div>
        )}
      </div>
    </div>
  );
}
