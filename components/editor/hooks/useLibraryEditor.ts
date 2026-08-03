import { useEffect, useState } from 'react';
import type { LibraryByKind, LibraryCategoryDTO, LibraryItemDTO, LibraryKind, LibrarySubtype } from '@/types';
import { useSectionSave } from './useSectionSave';

const KINDS: LibraryKind[] = ['music', 'film', 'game', 'book'];

function generateId() {
  return window.crypto?.randomUUID?.() ?? `id-${Math.random().toString(36).slice(2, 15)}`;
}

function normalizeLibrary(library: LibraryByKind): LibraryByKind {
  const result = {} as LibraryByKind;
  for (const kind of KINDS) {
    const source = library[kind];
    if (kind === 'music') {
      result.music = {
        categories: source?.categories ?? [],
        works: source?.works ?? [],
        creators: source?.creators ?? [],
        songs: library.music?.songs ?? [],
      };
    } else {
      result[kind] = {
        categories: source?.categories ?? [],
        works: source?.works ?? [],
        creators: source?.creators ?? [],
      };
    }
  }
  return result;
}

function listKey(subtype: LibrarySubtype) {
  return subtype === 'work' ? 'works' : subtype === 'creator' ? 'creators' : 'songs';
}

export function useLibraryEditor(initialLibrary: LibraryByKind) {
  const [libraryData, setLibraryData] = useState(() => normalizeLibrary(initialLibrary));
  const [activeKind, setActiveKind] = useState<LibraryKind>('music');
  const [editMode, setEditMode] = useState<'preview' | 'edit'>('edit');
  const [selectedCategoryName, setSelectedCategoryName] = useState('');
  const [activeSubtypeTab, setActiveSubtypeTab] = useState<LibrarySubtype>('work');
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const { triggerSave } = useSectionSave('library');

  const current = libraryData[activeKind];
  const categories = current.categories ?? [];
  const works = current.works ?? [];
  const creators = current.creators ?? [];
  const songs = activeKind === 'music' ? libraryData.music.songs ?? [] : [];

  useEffect(() => {
    if (activeKind === 'music') {
      setSelectedCategoryName((selected) =>
        selected && categories.some((category) => category.name === selected)
          ? selected
          : categories[0]?.name ?? ''
      );
    } else {
      setSelectedCategoryName('');
    }
    setActiveSubtypeTab('work');
  }, [activeKind, categories]);

  const saveData = (recipe: (previous: LibraryByKind) => LibraryByKind) => {
    setLibraryData((previous) => {
      const next = recipe(previous);
      triggerSave(next);
      return next;
    });
  };

  const updateCategories = (nextCategories: LibraryCategoryDTO[]) => {
    saveData((previous) => ({
      ...previous,
      [activeKind]: { ...previous[activeKind], categories: nextCategories },
    }));
  };

  const updateItems = (subtype: LibrarySubtype, items: LibraryItemDTO[]) => {
    saveData((previous) => ({
      ...previous,
      [activeKind]: { ...previous[activeKind], [listKey(subtype)]: items },
    }));
  };

  const itemList = (subtype: LibrarySubtype): LibraryItemDTO[] => {
    if (subtype === 'song') return songs;
    return subtype === 'work' ? works : creators;
  };

  const addCategory = () => {
    const name = `新分类 ${categories.length + 1}`;
    updateCategories([...categories, { id: generateId(), kind: activeKind, name, sortOrder: categories.length }]);
    setSelectedCategoryName(name);
  };

  const renameCategory = (index: number, name: string) => {
    const oldName = categories[index].name;
    if (oldName === name) return;
    const nextCategories = categories.map((category, categoryIndex) =>
      categoryIndex === index ? { ...category, name } : category
    );
    const renameItems = (items: LibraryItemDTO[]) =>
      items.map((item) => item.categoryName === oldName ? { ...item, categoryName: name } : item);
    saveData((previous) => ({
      ...previous,
      [activeKind]: {
        ...previous[activeKind],
        categories: nextCategories,
        works: renameItems(previous[activeKind].works),
        creators: renameItems(previous[activeKind].creators),
        ...(activeKind === 'music' ? { songs: renameItems(previous.music.songs) } : {}),
      },
    }));
  };

  const deleteCategory = (index: number) => {
    const name = categories[index].name;
    const nextCategories = categories.filter((_, categoryIndex) => categoryIndex !== index)
      .map((category, sortOrder) => ({ ...category, sortOrder }));
    const detach = (items: LibraryItemDTO[]) => items.map((item) =>
      item.categoryName === name ? { ...item, categoryName: '', categoryId: null } : item
    );
    saveData((previous) => ({
      ...previous,
      [activeKind]: {
        ...previous[activeKind],
        categories: nextCategories,
        works: detach(previous[activeKind].works),
        creators: detach(previous[activeKind].creators),
        ...(activeKind === 'music' ? { songs: detach(previous.music.songs) } : {}),
      },
    }));
  };

  const moveCategory = (index: number, direction: 'up' | 'down') => {
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= categories.length) return;
    const next = [...categories];
    [next[index], next[target]] = [next[target], next[index]];
    updateCategories(next.map((category, sortOrder) => ({ ...category, sortOrder })));
  };

  const addItem = () => {
    const items = itemList(activeSubtypeTab);
    const category = activeKind === 'music'
      ? categories.find((entry) => entry.name === selectedCategoryName)
      : undefined;
    const item: LibraryItemDTO = {
      id: generateId(), kind: activeKind, subtype: activeSubtypeTab,
      categoryId: category?.id ?? null, categoryName: category?.name ?? '',
      name: '新项目', creator: '', link: '', comment: '', imageUrl: null,
      sortOrder: items.length,
    };
    updateItems(activeSubtypeTab, [...items, item]);
  };

  const updateItem = (id: string, field: keyof LibraryItemDTO, value: unknown) => {
    const items = itemList(activeSubtypeTab);
    const index = items.findIndex((item) => item.id === id);
    if (index === -1) return;
    const next = [...items];
    if (field === 'categoryName') {
      const category = categories.find((entry) => entry.name === value);
      next[index] = { ...next[index], categoryName: String(value), categoryId: category?.id ?? null };
    } else {
      next[index] = { ...next[index], [field]: value } as LibraryItemDTO;
    }
    updateItems(activeSubtypeTab, next);
  };

  const deleteItem = (subtype: LibrarySubtype, id: string) => {
    updateItems(subtype, itemList(subtype).filter((item) => item.id !== id)
      .map((item, sortOrder) => ({ ...item, sortOrder })));
  };

  const moveItem = (subtype: LibrarySubtype, index: number, direction: 'up' | 'down') => {
    const items = itemList(subtype);
    const visible = activeKind === 'music'
      ? items.filter((item) => item.categoryName === selectedCategoryName)
      : items;
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= visible.length) return;
    const sourceIndex = items.findIndex((item) => item.id === visible[index].id);
    const targetIndex = items.findIndex((item) => item.id === visible[target].id);
    const next = [...items];
    [next[sourceIndex], next[targetIndex]] = [next[targetIndex], next[sourceIndex]];
    updateItems(subtype, next.map((item, sortOrder) => ({ ...item, sortOrder })));
  };

  const activeItems = (items: LibraryItemDTO[]) => activeKind === 'music'
    ? items.filter((item) => item.categoryName === selectedCategoryName)
    : items;

  return {
    activeItems, activeKind, activeSubtypeTab, addCategory, addItem, categories, creators,
    deleteCategory, deleteItem, editMode, isCategoryModalOpen, moveCategory, moveItem,
    renameCategory, selectedCategoryName, setActiveKind, setActiveSubtypeTab, setEditMode,
    setIsCategoryModalOpen, setSelectedCategoryName, songs, updateItem, works,
  };
}
