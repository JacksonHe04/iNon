'use client';

import { useState } from 'react';
import type { ReadmeData } from '@/types';
import EditorSectionCard from '../EditorSectionCard';
import { TextInput, StringListEditor } from '../EditorControls';
import { useSectionSave } from '../hooks/useSectionSave';
import { Heart } from 'lucide-react';

export default function LifeEditor({ initialData }: { initialData: ReadmeData }) {
  const [life, setLife] = useState(initialData.life);
  const { saveStatus, errorMessage } = useSectionSave('life', life);

  return (
    <EditorSectionCard
      title="2. 生活状态 (Life)"
      description="管理常驻城市、MBTI、生日星座及日常饮食与生活习惯"
      icon={Heart}
      saveStatus={saveStatus}
      errorMessage={errorMessage}
    >
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <TextInput
          label="常驻城市"
          value={life.current_city}
          onChange={(val) => setLife({ ...life, current_city: val })}
        />
        <TextInput
          label="出生日期"
          value={life.birth_date}
          onChange={(val) => setLife({ ...life, birth_date: val })}
        />
        <TextInput
          label="星座"
          value={life.zodiac_sign}
          onChange={(val) => setLife({ ...life, zodiac_sign: val })}
        />
        <TextInput
          label="生活 MBTI"
          value={life.mbti?.life_mbti || ''}
          onChange={(val) =>
            setLife({
              ...life,
              mbti: { ...life.mbti, life_mbti: val, work_mbti: life.mbti?.work_mbti || '' },
            })
          }
        />
        <TextInput
          label="工作 MBTI"
          value={life.mbti?.work_mbti || ''}
          onChange={(val) =>
            setLife({
              ...life,
              mbti: { ...life.mbti, work_mbti: val, life_mbti: life.mbti?.life_mbti || '' },
            })
          }
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-white/10 pt-4">
        <StringListEditor
          label="日常习惯 Habits"
          value={life.habits}
          onChange={(val) => setLife({ ...life, habits: val })}
        />
        <StringListEditor
          label="喜爱美食 Favorite Food"
          value={life.diet?.favorite_food || []}
          onChange={(val) =>
            setLife({
              ...life,
              diet: { ...life.diet, favorite_food: val },
            })
          }
        />
        <StringListEditor
          label="喜爱饮品 Favorite Drinks"
          value={life.diet?.favorite_drinks || []}
          onChange={(val) =>
            setLife({
              ...life,
              diet: { ...life.diet, favorite_drinks: val },
            })
          }
        />
      </div>
    </EditorSectionCard>
  );
}
