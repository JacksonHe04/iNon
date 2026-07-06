'use client';

import { useState } from 'react';
import type { ReadmeData } from '@/types';
import EditorSectionCard from '../EditorSectionCard';
import { ObjectArrayEditor } from '../EditorControls';
import { useSectionSave } from '../hooks/useSectionSave';
import { Film } from 'lucide-react';

export default function FilmsEditor({ initialData }: { initialData: ReadmeData }) {
  const [films, setFilms] = useState(initialData.films);
  const { saveStatus, errorMessage, saveSection } = useSectionSave('films');

  const handleSave = () => {
    saveSection(films);
  };

  return (
    <EditorSectionCard
      title="10. 影视海报墙与导演 (Films)"
      description="管理看过的影片、最爱电影墙、导演档案与影评"
      icon={Film}
      saveStatus={saveStatus}
      errorMessage={errorMessage}
      onSave={handleSave}
    >
      <ObjectArrayEditor
        title="电影与剧集 Films"
        items={films.films}
        onChange={(next) => setFilms({ ...films, films: next })}
        createItem={() => ({ name: '', director: '', country: '', link: '', comment: '' })}
        getItemTitle={(item) => `${item.name || '片名'} — 导演: ${item.director || '未知'}`}
        fields={[
          { key: 'name', label: '影片名称' },
          { key: 'director', label: '导演' },
          { key: 'country', label: '出品国家 / 地区' },
          { key: 'link', label: '豆瓣 / IMDb 链接' },
          { key: 'comment', label: '影评与观影感受', type: 'textarea' },
        ]}
      />

      <div className="border-t border-white/10 pt-4">
        <ObjectArrayEditor
          title="喜爱导演 Directors"
          items={films.directors}
          onChange={(next) => setFilms({ ...films, directors: next })}
          createItem={() => ({ name: '', country: '', link: '', comment: '' })}
          getItemTitle={(item) => item.name || '导演姓名'}
          fields={[
            { key: 'name', label: '导演姓名' },
            { key: 'country', label: '国家 / 地区' },
            { key: 'link', label: '介绍链接' },
            { key: 'comment', label: '评价与推介', type: 'textarea' },
          ]}
        />
      </div>
    </EditorSectionCard>
  );
}
