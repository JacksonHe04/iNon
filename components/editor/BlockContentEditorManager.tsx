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
  Layers,
} from 'lucide-react';

const BLOCK_CATEGORIES = [
  { id: 'all', label: '全部 Block 分区', icon: Layers },
  { id: 'basic', label: '1. 基本信息 (Basic)', icon: User },
  { id: 'life', label: '2. 生活状态 (Life)', icon: Heart },
  { id: 'experience', label: '3. 个人经历 (Experience)', icon: MapPin },
  { id: 'education', label: '4. 教育背景 (Education)', icon: GraduationCap },
  { id: 'work', label: '5. 工作履历 (Work)', icon: Briefcase },
  { id: 'development', label: '6. 技术与项目 (Development)', icon: Code2 },
  { id: 'products', label: '7. 硬件与产品 (Products)', icon: Laptop },
  { id: 'creation', label: '8. 内容创作 (Creation)', icon: PenTool },
  { id: 'reading', label: '9. 在读书单 (Reading)', icon: BookOpen },
  { id: 'films', label: '10. 影视墙 (Films)', icon: Film },
  { id: 'music', label: '11. 音乐库 (Music)', icon: Music },
  { id: 'events', label: '12. 里程碑事件 (Events)', icon: Calendar },
  { id: 'contact', label: '13. 联系方式 (Contact)', icon: Send },
  { id: 'thoughts', label: '14. 思考与 Q&A (Thoughts)', icon: Compass },
  { id: 'notifications', label: '15. 动态公告 (Notifications)', icon: Bell },
] as const;

type CategoryId = (typeof BLOCK_CATEGORIES)[number]['id'];

interface BlockContentEditorManagerProps {
  data: ReadmeData;
}

export default function BlockContentEditorManager({ data }: BlockContentEditorManagerProps) {
  const [activeCategory, setActiveCategory] = useState<CategoryId>('all');

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
        {(activeCategory === 'all' || activeCategory === 'basic') && (
          <BasicEditor initialData={data} />
        )}
        {(activeCategory === 'all' || activeCategory === 'life') && (
          <LifeEditor initialData={data} />
        )}
        {(activeCategory === 'all' || activeCategory === 'experience') && (
          <ExperienceEditor initialData={data} />
        )}
        {(activeCategory === 'all' || activeCategory === 'education') && (
          <EducationEditor initialData={data} />
        )}
        {(activeCategory === 'all' || activeCategory === 'work') && (
          <WorkEditor initialData={data} />
        )}
        {(activeCategory === 'all' || activeCategory === 'development') && (
          <DevelopmentEditor initialData={data} />
        )}
        {(activeCategory === 'all' || activeCategory === 'products') && (
          <ProductsEditor initialData={data} />
        )}
        {(activeCategory === 'all' || activeCategory === 'creation') && (
          <CreationEditor initialData={data} />
        )}
        {(activeCategory === 'all' || activeCategory === 'reading') && (
          <ReadingEditor initialData={data} />
        )}
        {(activeCategory === 'all' || activeCategory === 'films') && (
          <FilmsEditor initialData={data} />
        )}
        {(activeCategory === 'all' || activeCategory === 'music') && (
          <MusicEditor initialData={data} />
        )}
        {(activeCategory === 'all' || activeCategory === 'events') && (
          <EventsEditor initialData={data} />
        )}
        {(activeCategory === 'all' || activeCategory === 'contact') && (
          <ContactEditor initialData={data} />
        )}
        {(activeCategory === 'all' || activeCategory === 'thoughts') && (
          <ThoughtsEditor initialData={data} />
        )}
        {(activeCategory === 'all' || activeCategory === 'notifications') && (
          <NotificationsEditor initialData={data} />
        )}
      </div>
    </div>
  );
}
