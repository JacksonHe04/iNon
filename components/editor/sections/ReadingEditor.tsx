'use client';

import { useState } from 'react';
import type { ReadmeData } from '@/types';
import EditorSectionCard from '../EditorSectionCard';
import { ObjectArrayEditor } from '../EditorControls';
import { useSectionSave } from '../hooks/useSectionSave';
import { BookOpen } from 'lucide-react';

export default function ReadingEditor({ initialData }: { initialData: ReadmeData }) {
  const [reading, setReading] = useState(initialData.reading);
  const { saveStatus, errorMessage, saveSection } = useSectionSave('reading');

  const handleSave = () => {
    saveSection(reading);
  };

  return (
    <EditorSectionCard
      title="9. 在读书单与作者 (Reading)"
      description="管理在读书目、推荐书单、作者档案与读书感悟"
      icon={BookOpen}
      saveStatus={saveStatus}
      errorMessage={errorMessage}
      onSave={handleSave}
    >
      <ObjectArrayEditor
        title="书籍档案 Books"
        items={reading.books}
        onChange={(next) => setReading({ ...reading, books: next })}
        createItem={() => ({ name: '', author: '', country: '', link: '', comment: '', image_url: '' })}
        getItemTitle={(item) => `${item.name || '书名'} — ${item.author || '作者'}`}
        fields={[
          { key: 'name', label: '书名' },
          { key: 'author', label: '作者' },
          { key: 'country', label: '国家 / 地区' },
          { key: 'link', label: '豆瓣 / 购买链接' },
          { key: 'comment', label: '读书笔记与评语', type: 'textarea' },
          { key: 'image_url', label: '书籍封面 URL', type: 'image' },
        ]}
      />

      <div className="border-t border-white/10 pt-4">
        <ObjectArrayEditor
          title="喜爱作者 Authors"
          items={reading.authors}
          onChange={(next) => setReading({ ...reading, authors: next })}
          createItem={() => ({ name: '', country: '', link: '', comment: '', image_url: '' })}
          getItemTitle={(item) => item.name || '作者姓名'}
          fields={[
            { key: 'name', label: '作者姓名' },
            { key: 'country', label: '国家 / 地区' },
            { key: 'link', label: '介绍链接' },
            { key: 'comment', label: '评价与推介', type: 'textarea' },
            { key: 'image_url', label: '作者图片 URL', type: 'image' },
          ]}
        />
      </div>
    </EditorSectionCard>
  );
}
