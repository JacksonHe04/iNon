'use client';

import { useState } from 'react';
import type { ReadmeData } from '@/types';
import EditorSectionCard from '../EditorSectionCard';
import { TextInput, ObjectArrayEditor } from '../EditorControls';
import { useSectionSave } from '../hooks/useSectionSave';
import { GraduationCap } from 'lucide-react';

export default function EducationEditor({ initialData }: { initialData: ReadmeData }) {
  const [education, setEducation] = useState(initialData.education);
  const { saveStatus, errorMessage } = useSectionSave('education', education);

  return (
    <EditorSectionCard
      title="4. 教育背景 (Education)"
      description="管理求学经历、院校专业、学术研究及导师"
      icon={GraduationCap}
      saveStatus={saveStatus}
      errorMessage={errorMessage}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-2">
        <TextInput
          label="本科专业"
          value={education.undergraduate_major}
          onChange={(val) => setEducation({ ...education, undergraduate_major: val })}
        />
        <TextInput
          label="本科导师"
          value={education.undergraduate_advisor}
          onChange={(val) => setEducation({ ...education, undergraduate_advisor: val })}
        />
      </div>

      <ObjectArrayEditor
        title="学校与院校经历"
        items={education.schools}
        onChange={(next) => setEducation({ ...education, schools: next })}
        createItem={() => ({
          institution: '',
          degree: '',
          major: '',
          start_date: '',
          end_date: '',
        })}
        getItemTitle={(item) => `${item.institution || '学校'} - ${item.degree || '学位'}`}
        fields={[
          { key: 'institution', label: '院校 / 机构', placeholder: '如: 北京大学' },
          { key: 'degree', label: '学位', placeholder: '如: 学士 / 硕士' },
          { key: 'major', label: '专业', placeholder: '如: 计算机科学与技术' },
          { key: 'start_date', label: '入学时间', placeholder: '如: 2020.09' },
          { key: 'end_date', label: '毕业时间', placeholder: '如: 2024.06' },
        ]}
      />
    </EditorSectionCard>
  );
}
