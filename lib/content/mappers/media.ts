import type {
  LibraryCategoryRow,
  LibraryItemRow,
  PerformanceRow,
  ContactMethodRow,
  PlatformAccountRow,
  ThoughtQaRow,
  NotificationRow,
  ValueRow,
} from '@/types/database';
import type {
  LibraryItemDTO,
  LibraryCategoryDTO,
  LibraryByKind,
  LibraryKind,
} from '@/types';
import { sortByOrder, listValuesByType } from './utils';

function sortByLibraryOrder<T extends { sort_order: number; created_at?: string }>(arr: T[]): T[] {
  return [...arr].sort((a, b) => {
    if (a.sort_order !== b.sort_order) {
      return a.sort_order - b.sort_order;
    }
    const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
    const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
    return dateA - dateB;
  });
}

export function mapLibrary(items: LibraryItemRow[], categories: LibraryCategoryRow[]): LibraryByKind {
  const categoryMap = new Map<string, string>();
  for (const cat of categories) {
    categoryMap.set(cat.id, cat.name);
  }

  const itemToDTO = (item: LibraryItemRow): LibraryItemDTO => ({
    id: item.id,
    kind: item.kind,
    subtype: item.subtype,
    categoryId: item.category_id,
    categoryName: item.category_id ? (categoryMap.get(item.category_id) || '') : '',
    name: item.name,
    creator: item.creator,
    link: item.link,
    comment: item.comment,
    imageUrl: item.image_url,
    sortOrder: item.sort_order,
  });

  const categoryToDTO = (cat: LibraryCategoryRow): LibraryCategoryDTO => ({
    id: cat.id,
    kind: cat.kind,
    name: cat.name,
    sortOrder: cat.sort_order,
  });

  const sortedCategories = sortByLibraryOrder(categories);
  const sortedItems = sortByLibraryOrder(items);

  const getByKind = (kind: LibraryKind) => {
    const kindCategories = sortedCategories.filter((c) => c.kind === kind).map(categoryToDTO);
    const kindItems = sortedItems.filter((i) => i.kind === kind);

    const works = kindItems.filter((i) => i.subtype === 'work').map(itemToDTO);
    const creators = kindItems.filter((i) => i.subtype === 'creator').map(itemToDTO);

    if (kind === 'music') {
      const songs = kindItems.filter((i) => i.subtype === 'song').map(itemToDTO);
      return {
        categories: kindCategories,
        works,
        songs,
        creators,
      };
    }

    return {
      categories: kindCategories,
      works,
      creators,
    };
  };

  return {
    music: getByKind('music') as LibraryByKind['music'],
    film: getByKind('film') as LibraryByKind['film'],
    game: getByKind('game') as LibraryByKind['game'],
    book: getByKind('book') as LibraryByKind['book'],
  };
}

export function mapEvents(performances: PerformanceRow[]) {
  return {
    performances: sortByOrder(performances).map((item) => ({
      type: item.event_type,
      name: item.name,
      date: item.event_date,
      genre: item.genre,
      location: item.location,
    })),
  };
}

export function mapContact(contactMethods: ContactMethodRow[], platformAccounts: PlatformAccountRow[]) {
  return {
    contact_info: sortByOrder(contactMethods).map((item) => ({
      method_name: item.method_name,
      content: item.content,
    })),
    platform_accounts: sortByOrder(platformAccounts).map((item) => ({
      platform_name: item.platform_name,
      username: item.username,
      homepage_link: item.homepage_link,
    })),
  };
}

export function mapThoughts(listItems: (ValueRow & { list_type: string })[], thoughtQa: ThoughtQaRow[]) {
  return {
    personal_philosophy: listValuesByType(listItems, 'personal_philosophy'),
    industry_views: listValuesByType(listItems, 'industry_view'),
    ideology: listValuesByType(listItems, 'ideology'),
    life_elements: listValuesByType(listItems, 'life_element'),
    macro_vision: listValuesByType(listItems, 'macro_vision'),
    personal_vision: listValuesByType(listItems, 'personal_vision'),
    qa: sortByOrder(thoughtQa).map((item) => ({
      question: item.question,
      answer: item.answer,
      source: item.source,
      date: item.qa_date,
    })),
  };
}

export function mapNotifications(notifications: NotificationRow[]) {
  return [...notifications]
    .sort((a, b) => (b.notification_date ?? '').localeCompare(a.notification_date ?? ''))
    .map((item) => ({
      date: item.notification_date,
      text: item.text,
      type: item.type,
    }));
}
