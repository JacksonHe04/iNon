'use client';

import { useState } from 'react';
import type { ReadmeData } from '@/types';
import EditorSectionCard from '../EditorSectionCard';
import { ObjectArrayEditor } from '../EditorControls';
import { useSectionSave } from '../hooks/useSectionSave';
import { MapPin } from 'lucide-react';

export default function ExperienceEditor({ initialData }: { initialData: ReadmeData }) {
  const [experience, setExperience] = useState(initialData.experience);
  const { saveStatus, errorMessage, saveSection } = useSectionSave('experience');

  const handleSave = () => {
    saveSection(experience);
  };

  return (
    <EditorSectionCard
      title="3. 个人经历 (Experience)"
      description="管理足迹、旅居经历与人生城市体验"
      icon={MapPin}
      saveStatus={saveStatus}
      errorMessage={errorMessage}
      onSave={handleSave}
    >
      <ObjectArrayEditor
        title="经历条目"
        items={experience.experience}
        onChange={(next) => setExperience({ experience: next })}
        createItem={() => ({ city: '', date: '', description: '' })}
        getItemTitle={(item) => `${item.city || '城市'} (${item.date || '时间'})`}
        fields={[
          { key: 'city', label: '城市 / 地点', placeholder: '如: 北京' },
          { key: 'date', label: '时间 / 阶段', placeholder: '如: 2023 - 2024' },
          { key: 'description', label: '经历描述', type: 'textarea', placeholder: '在这个城市的故事...' },
        ]}
      />
    </EditorSectionCard>
  );
}
