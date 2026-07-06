'use client';

import { useState } from 'react';
import type { ReadmeData } from '@/types';
import EditorSectionCard from '../EditorSectionCard';
import { StringListEditor, ObjectArrayEditor } from '../EditorControls';
import { useSectionSave } from '../hooks/useSectionSave';
import { PenTool } from 'lucide-react';

export default function CreationEditor({ initialData }: { initialData: ReadmeData }) {
  const [creation, setCreation] = useState(initialData.creation);
  const { saveStatus, errorMessage, saveSection } = useSectionSave('creation');

  const handleSave = () => {
    saveSection(creation);
  };

  return (
    <EditorSectionCard
      title="8. 内容创作 (Creation)"
      description="管理发布的视频/播客节目、撰写的长文、演讲汇报、人生格言与金句"
      icon={PenTool}
      saveStatus={saveStatus}
      errorMessage={errorMessage}
      onSave={handleSave}
    >
      <ObjectArrayEditor
        title="文章 Articles"
        items={creation.articles}
        onChange={(next) => setCreation({ ...creation, articles: next })}
        createItem={() => ({ title: '', link: '', excerpt: '' })}
        getItemTitle={(item) => item.title || '文章标题'}
        fields={[
          { key: 'title', label: '文章标题' },
          { key: 'link', label: '阅读链接' },
          { key: 'excerpt', label: '内容摘要', type: 'textarea' },
        ]}
      />

      <div className="border-t border-white/10 pt-4">
        <ObjectArrayEditor
          title="视频与播客 Videos & Podcasts"
          items={creation.videos}
          onChange={(next) => setCreation({ ...creation, videos: next })}
          createItem={() => ({ series: '', title: '', video_link: '', podcast_link: '' })}
          getItemTitle={(item) => item.title || '节目名称'}
          fields={[
            { key: 'series', label: '所属系列' },
            { key: 'title', label: '节目/视频标题' },
            { key: 'video_link', label: '视频播放链接 (Bilibili/YouTube)' },
            { key: 'podcast_link', label: '播客音频链接' },
          ]}
        />
      </div>

      <div className="border-t border-white/10 pt-4">
        <ObjectArrayEditor
          title="演讲与汇报 Speeches"
          items={creation.speeches}
          onChange={(next) => setCreation({ ...creation, speeches: next })}
          createItem={() => ({ speech_name: '', link: '', outline_doc: '', presentation_link: '' })}
          getItemTitle={(item) => item.speech_name || '演讲主题'}
          fields={[
            { key: 'speech_name', label: '演讲/汇报主题' },
            { key: 'link', label: '回放链接' },
            { key: 'presentation_link', label: 'PPT / 幻灯片链接' },
            { key: 'outline_doc', label: '大纲文档链接' },
          ]}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-white/10 pt-4">
        <StringListEditor
          label="座右铭 / 格言 Mottos"
          value={creation.mottos || []}
          onChange={(val) => setCreation({ ...creation, mottos: val })}
        />
        <StringListEditor
          label="经典引言 / 金句 Quotes"
          value={creation.quotes || []}
          onChange={(val) => setCreation({ ...creation, quotes: val })}
        />
      </div>
    </EditorSectionCard>
  );
}
