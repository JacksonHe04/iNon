'use client';

import { useState } from 'react';
import type { ReadmeData } from '@/types';
import EditorSectionCard from '../EditorSectionCard';
import { StringListEditor, ObjectArrayEditor } from '../EditorControls';
import { useSectionSave } from '../hooks/useSectionSave';
import { Compass } from 'lucide-react';

export default function ThoughtsEditor({ initialData }: { initialData: ReadmeData }) {
  const [thoughts, setThoughts] = useState(initialData.thoughts);
  const { saveStatus, errorMessage } = useSectionSave('thoughts', thoughts);

  return (
    <EditorSectionCard
      title="14. 深水区与思考 (Thoughts)"
      description="管理个人哲学、行业视角、意识形态、人生愿景及访客常见 Q&A 问答"
      icon={Compass}
      saveStatus={saveStatus}
      errorMessage={errorMessage}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-2">
        <StringListEditor
          label="个人哲学 Personal Philosophy"
          value={thoughts.personal_philosophy || []}
          onChange={(val) => setThoughts({ ...thoughts, personal_philosophy: val })}
        />
        <StringListEditor
          label="行业视角 Industry Views"
          value={thoughts.industry_views || []}
          onChange={(val) => setThoughts({ ...thoughts, industry_views: val })}
        />
        <StringListEditor
          label="意识形态 Ideology"
          value={thoughts.ideology || []}
          onChange={(val) => setThoughts({ ...thoughts, ideology: val })}
        />
        <StringListEditor
          label="生活元素 Life Elements"
          value={thoughts.life_elements || []}
          onChange={(val) => setThoughts({ ...thoughts, life_elements: val })}
        />
        <StringListEditor
          label="宏观愿景 Macro Vision"
          value={thoughts.macro_vision || []}
          onChange={(val) => setThoughts({ ...thoughts, macro_vision: val })}
        />
        <StringListEditor
          label="个人愿景 Personal Vision"
          value={thoughts.personal_vision || []}
          onChange={(val) => setThoughts({ ...thoughts, personal_vision: val })}
        />
      </div>

      <div className="border-t border-white/10 pt-4">
        <ObjectArrayEditor
          title="问答与访客 Q&A"
          items={thoughts.qa}
          onChange={(next) => setThoughts({ ...thoughts, qa: next })}
          createItem={() => ({ question: '', answer: '', source: '', date: '' })}
          getItemTitle={(item) => item.question || '问题'}
          fields={[
            { key: 'question', label: '提问 Question' },
            { key: 'source', label: '来源 / 提问者', placeholder: '如: 访客 / 播客采访' },
            { key: 'date', label: '回答日期', placeholder: '2024-06-01' },
            { key: 'answer', label: '回答 Answer', type: 'textarea' },
          ]}
        />
      </div>
    </EditorSectionCard>
  );
}
