import type { ReadmeData } from '@/types';

export type HomeRecordId = 'desk' | 'bookcase' | 'record-box' | 'bedside' | 'letters';
export type HomeInspectionId = HomeRecordId | `exhibit:${string}`;

export interface HomeExhibit {
  id: string;
  kind: 'music' | 'film' | 'book';
  title: string;
  creator: string;
  imageUrl: string;
  comment: string;
  href: string;
  categoryName: string;
}

export interface HomeRecordEntry {
  title: string;
  meta: string;
  body: string;
  imageUrl?: string | null;
  href?: string;
  tags?: string[];
}

export interface HomeRecord {
  id: HomeRecordId;
  folio: string;
  title: string;
  subtitle: string;
  annotation: string;
  entries: HomeRecordEntry[];
}

export function buildHomeExhibits(data: ReadmeData): HomeExhibit[] {
  const collect = (
    items: ReadmeData['library']['music']['works'],
    kind: HomeExhibit['kind'],
    limit: number,
  ) => items
    .filter((item): item is typeof item & { imageUrl: string } => Boolean(item.imageUrl))
    .slice(0, limit)
    .map((item) => ({
      id: `${kind}:${item.id}`,
      kind,
      title: item.name,
      creator: item.creator,
      imageUrl: item.imageUrl,
      comment: item.comment,
      href: item.link,
      categoryName: item.categoryName,
    }));

  return [
    ...collect(data.library.music.works, 'music', 3),
    ...collect(data.library.film.works, 'film', 1),
    ...collect(data.library.book.works, 'book', 1),
  ];
}

export function exhibitInspectionId(id: string): HomeInspectionId {
  return `exhibit:${id}`;
}

export function exhibitIdFromInspection(id: HomeInspectionId | null) {
  return id?.startsWith('exhibit:') ? id.slice('exhibit:'.length) : null;
}

export function buildHomeRecord(data: ReadmeData, id: HomeRecordId): HomeRecord {
  if (id === 'desk') {
    return {
      id,
      folio: 'WORKTABLE / 01',
      title: '书桌上的项目手稿',
      subtitle: `${data.development.projects.length} 项正在被保存的工作`,
      annotation: '铅笔、代码与没有写完的想法，都留在这张桌上。',
      entries: data.development.projects.slice(0, 7).map((project) => ({
        title: project.project_name,
        meta: [project.start_date, project.end_date].filter(Boolean).join(' — ') || '未注明日期',
        body: project.description,
        href: project.link || project.github,
        tags: project.tech_stack,
      })),
    };
  }
  if (id === 'bookcase') {
    return {
      id,
      folio: 'BOOKCASE / 02',
      title: '反复翻阅的书',
      subtitle: `${data.library.book.works.length} 册私人藏书`,
      annotation: '书脊被日光晒淡，夹页里仍留着旧时的判断。',
      entries: data.library.book.works.slice(0, 7).map((book) => ({
        title: book.name,
        meta: [book.creator, book.categoryName].filter(Boolean).join(' · '),
        body: book.comment,
        imageUrl: book.imageUrl,
        href: book.link,
      })),
    };
  }
  if (id === 'record-box') {
    const music = data.library.music.works.slice(0, 4).map((item) => ({
      title: item.name,
      meta: `唱片 · ${item.creator}`,
      body: item.comment,
      imageUrl: item.imageUrl,
      href: item.link,
    }));
    const films = data.library.film.works.slice(0, 4).map((item) => ({
      title: item.name,
      meta: `影片 · ${item.creator}`,
      body: item.comment,
      imageUrl: item.imageUrl,
      href: item.link,
    }));
    return {
      id,
      folio: 'RECORD CRATE / 03',
      title: '唱片与旧电影',
      subtitle: `${data.library.music.works.length} 张唱片 · ${data.library.film.works.length} 部影片`,
      annotation: '这里仍沿用原收藏数据；完整卡片陈列保留在上方“档案”中。',
      entries: [...music, ...films],
    };
  }
  if (id === 'letters') {
    return {
      id,
      folio: 'LETTERS / 04',
      title: '窗边收到的来信',
      subtitle: `${data.messages.length} 封被留下的留言`,
      annotation: '纸张会老去，但一个人曾经认真写下的话不会。',
      entries: data.messages.slice(0, 8).map((message) => ({
        title: message.nickname,
        meta: new Date(message.created_at).toLocaleDateString('zh-CN'),
        body: message.content,
      })),
    };
  }
  return {
    id,
    folio: 'BEDSIDE / 05',
    title: '床头的近况便笺',
    subtitle: data.life.current_city || '在某个正在生活的地方',
    annotation: data.basic.intro,
    entries: [
      { title: '此刻', meta: 'CURRENT STATUS', body: data.basic.current_status, tags: data.basic.keywords },
      { title: '生活习惯', meta: data.life.current_city, body: data.life.habits.join('、') },
      { title: '在意的事', meta: 'VALUES', body: data.basic.values.join('、'), tags: data.basic.tags },
    ],
  };
}
