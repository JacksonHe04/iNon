'use client';

import { useState } from 'react';
import type { ReadmeData } from '@/types';
import EditorSectionCard from '../EditorSectionCard';
import { TextInput, StringListEditor, ObjectArrayEditor } from '../EditorControls';
import { useSectionSave } from '../hooks/useSectionSave';
import { Briefcase } from 'lucide-react';

export default function WorkEditor({ initialData }: { initialData: ReadmeData }) {
  const [work, setWork] = useState(initialData.work);
  const { saveStatus, errorMessage, saveSection } = useSectionSave('work');

  const handleSave = () => {
    saveSection(work);
  };

  return (
    <EditorSectionCard
      title="5. 工作履历 (Work)"
      description="管理职业现状、工作履历、负责产品、产出与团队合作偏好"
      icon={Briefcase}
      saveStatus={saveStatus}
      errorMessage={errorMessage}
      onSave={handleSave}
    >
      <div className="pb-2">
        <TextInput
          label="当前工作状态 / Current Job"
          value={work.current_job}
          onChange={(val) => setWork({ ...work, current_job: val })}
          placeholder="例如: 独立开发者 / 某公司 AI 产品经理"
        />
      </div>

      <ObjectArrayEditor
        title="工作履历"
        items={work.jobs}
        onChange={(next) => setWork({ ...work, jobs: next })}
        createItem={() => ({
          company_name: '',
          position: '',
          position_type: '全职',
          start_date: '',
          end_date: '',
          products_responsible_for: '',
          job_summary: '',
          work_output: '',
        })}
        getItemTitle={(item) => `${item.company_name || '公司'} — ${item.position || '岗位'}`}
        fields={[
          { key: 'company_name', label: '公司 / 组织', placeholder: '如: Google / DeepMind' },
          { key: 'position', label: '职位名称', placeholder: '如: 全栈工程师' },
          { key: 'position_type', label: '职位类型', placeholder: '如: 全职 / 实习 / 顾问' },
          { key: 'start_date', label: '开始时间', placeholder: '如: 2023.01' },
          { key: 'end_date', label: '结束时间', placeholder: '如: 至今' },
          { key: 'products_responsible_for', label: '负责的产品/业务', placeholder: '如: 核心 AI 助手 Agent' },
          { key: 'job_summary', label: '职责概要', type: 'textarea' },
          { key: 'work_output', label: '核心产出 / 成果', type: 'textarea' },
        ]}
      />

      <div className="border-t border-white/10 pt-4">
        <StringListEditor
          label="工作 / 合作偏好 Work Preferences"
          value={work.work_preferences || []}
          onChange={(val) => setWork({ ...work, work_preferences: val })}
        />
      </div>
    </EditorSectionCard>
  );
}
