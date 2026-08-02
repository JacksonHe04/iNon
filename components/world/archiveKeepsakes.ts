import type { ReadmeData } from '@/types';

export interface ArchiveKeepsake {
  id: string;
  folio: string;
  kind: string;
  text: string;
  note: string;
}

interface KeepsakeFragment {
  kind: string;
  text: string;
  note: string;
}

export function buildArchiveKeepsakes(data: ReadmeData): ArchiveKeepsake[] {
  const fragments: KeepsakeFragment[] = [
    ...data.creation.mottos.map((text) => ({ kind: 'MOTTO', text, note: '写在页边的自我提醒' })),
    ...data.creation.quotes.map((text) => ({ kind: 'QUOTE', text, note: '曾经反复读过的一句话' })),
    ...data.thoughts.personal_philosophy.map((text) => ({ kind: 'PHILOSOPHY', text, note: '关于怎样生活' })),
    ...data.thoughts.personal_vision.map((text) => ({ kind: 'VISION', text, note: '想要抵达的远处' })),
    ...data.thoughts.life_elements.map((text) => ({ kind: 'LIFE', text, note: '构成日常的碎片' })),
    ...data.notifications.map((item) => ({
      kind: item.type || 'NOTICE',
      text: item.text,
      note: item.date || '未注明日期',
    })),
    ...data.experience.experience.map((item) => ({
      kind: 'PLACE MEMORY',
      text: item.description,
      note: [item.city, item.date].filter(Boolean).join(' · '),
    })),
    ...data.basic.values.map((text) => ({ kind: 'VALUE', text, note: '一直在意的事' })),
    ...data.life.habits.map((text) => ({ kind: 'HABIT', text, note: data.life.current_city })),
  ].filter((fragment) => fragment.text.trim().length > 0);

  const fallback: KeepsakeFragment = {
    kind: 'FIELD NOTE',
    text: data.basic.current_status || data.basic.intro,
    note: data.basic.name,
  };
  return Array.from({ length: 18 }, (_, index) => {
    const fragment = fragments[index % Math.max(1, fragments.length)] ?? fallback;
    return {
      id: `field-${String(index + 1).padStart(2, '0')}`,
      folio: `FIELD / ${String(index + 1).padStart(2, '0')}`,
      ...fragment,
    };
  });
}
