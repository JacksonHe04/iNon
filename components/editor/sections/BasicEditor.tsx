'use client';

import { useState } from 'react';
import type { ReadmeData } from '@/types';
import EditorSectionCard from '../EditorSectionCard';
import { TextInput, TextAreaInput, StringListEditor } from '../EditorControls';
import { useSectionSave } from '../hooks/useSectionSave';
import { User } from 'lucide-react';

export default function BasicEditor({ initialData }: { initialData: ReadmeData }) {
  const [basic, setBasic] = useState(initialData.basic);
  const [meta, setMeta] = useState(initialData.meta);
  const { saveStatus, errorMessage, saveSection } = useSectionSave('profile');

  const handleSave = () => {
    saveSection({ basic, meta });
  };

  return (
    <EditorSectionCard
      title="1. 个人基本信息 (Basic & Meta)"
      description="配置网站公开显示的姓名、简介、标签、价值观及 SEO 元数据"
      icon={User}
      saveStatus={saveStatus}
      errorMessage={errorMessage}
      onSave={handleSave}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TextInput
          label="姓名 / 昵称"
          value={basic.name}
          onChange={(val) => setBasic({ ...basic, name: val })}
          required
        />
        <TextInput
          label="当前状态"
          value={basic.current_status}
          onChange={(val) => setBasic({ ...basic, current_status: val })}
          placeholder="例如: 正在构建 iNon OS..."
        />
        <div className="col-span-full">
          <TextAreaInput
            label="一句话简介 / Bio"
            value={basic.intro}
            onChange={(val) => setBasic({ ...basic, intro: val })}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
        <StringListEditor
          label="关键词 Keywords"
          value={basic.keywords}
          onChange={(val) => setBasic({ ...basic, keywords: val })}
        />
        <StringListEditor
          label="价值观 Values"
          value={basic.values}
          onChange={(val) => setBasic({ ...basic, values: val })}
        />
        <StringListEditor
          label="个人标签 Tags"
          value={basic.tags}
          onChange={(val) => setBasic({ ...basic, tags: val })}
        />
      </div>

      <div className="border-t border-white/10 pt-4 mt-4 space-y-3">
        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">SEO & Page Meta</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <TextInput
            label="网页标题 (Meta Title)"
            value={meta.title}
            onChange={(val) => setMeta({ ...meta, title: val })}
          />
          <TextInput
            label="网页作者 (Meta Author)"
            value={meta.author}
            onChange={(val) => setMeta({ ...meta, author: val })}
          />
          <TextInput
            label="网页描述 (Meta Description)"
            value={meta.description}
            onChange={(val) => setMeta({ ...meta, description: val })}
          />
        </div>
      </div>
    </EditorSectionCard>
  );
}
