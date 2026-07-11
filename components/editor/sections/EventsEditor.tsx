'use client';

import { useState } from 'react';
import type { ReadmeData } from '@/types';
import EditorSectionCard from '../EditorSectionCard';
import { ObjectArrayEditor } from '../EditorControls';
import { useSectionSave } from '../hooks/useSectionSave';
import { Calendar } from 'lucide-react';

export default function EventsEditor({ initialData }: { initialData: ReadmeData }) {
  const [events, setEvents] = useState(initialData.events);
  const { saveStatus, errorMessage } = useSectionSave('events', events);

  return (
    <EditorSectionCard
      title="12. 里程碑事件与演出 (Events)"
      description="管理看过的演唱会、音乐节、展览及人生里程碑事件"
      icon={Calendar}
      saveStatus={saveStatus}
      errorMessage={errorMessage}
    >
      <ObjectArrayEditor
        title="演出与活动 Performances & Milestones"
        items={events.performances}
        onChange={(next) => setEvents({ performances: next })}
        createItem={() => ({ type: '演出', name: '', date: '', genre: '', location: '' })}
        getItemTitle={(item) => `${item.name || '活动名称'} (${item.date || '日期'})`}
        fields={[
          { key: 'name', label: '活动 / 演出名称', placeholder: '如: 某某巡回演唱会' },
          { key: 'type', label: '类型', placeholder: '如: 演唱会 / 音乐节 / 展览 / 发布会' },
          { key: 'date', label: '活动日期', placeholder: '如: 2024-05-20' },
          { key: 'genre', label: '流派 / 领域', placeholder: '如: 摇滚 / 科技 / 艺术' },
          { key: 'location', label: '地点 / 场馆', placeholder: '如: 北京工体' },
        ]}
      />
    </EditorSectionCard>
  );
}
