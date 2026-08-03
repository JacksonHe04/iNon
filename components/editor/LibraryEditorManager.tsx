'use client';

import React, { useState, useEffect } from 'react';
import GlassCard from '@/components/GlassCard';
import LibraryCategoryModal from './LibraryCategoryModal';
import LibraryItemEditorList from './LibraryItemEditorList';
import { useSectionSave } from './hooks/useSectionSave';
import type { LibraryByKind, LibraryItemDTO, LibraryCategoryDTO, LibraryKind, LibrarySubtype } from '@/types';
import LibraryPreviewPanel from './LibraryPreviewPanel';
import { LibraryCollectionControls, LibraryKindToolbar } from './LibraryEditorToolbar';

// Safe UUID/ID generator helper
const generateUUID = () => {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.randomUUID) {
    return window.crypto.randomUUID();
  }
  return 'id-' + Math.random().toString(36).substring(2, 15);
};

// Normalize and ensure all lists exist
const normalizeLibrary = (lib: LibraryByKind): LibraryByKind => {
  const kinds: LibraryKind[] = ['music', 'film', 'game', 'book'];
  const res = {} as LibraryByKind;
  for (const k of kinds) {
    const src = lib[k] || {};
    res[k] = {
      categories: src.categories || [],
      works: src.works || [],
      creators: src.creators || [],
      ...(k === 'music' ? { songs: (src as any).songs || [] } : {}),
    } as any;
  }
  return res;
};

interface LibraryEditorManagerProps {
  initialLibrary: LibraryByKind;
}

export default function LibraryEditorManager({ initialLibrary }: LibraryEditorManagerProps) {
  const [libraryData, setLibraryData] = useState<LibraryByKind>(() => normalizeLibrary(initialLibrary));
  const [activeKind, setActiveKind] = useState<LibraryKind>('music');
  const [editMode, setEditMode] = useState<'preview' | 'edit'>('edit');
  
  // Selected category name state (strictly isolated for music, ignored for others)
  const [selectedCategoryName, setSelectedCategoryName] = useState<string>('');
  const [activeSubtypeTab, setActiveSubtypeTab] = useState<LibrarySubtype>('work');
  
  // Category management modal
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  const currentKindData = libraryData[activeKind];
  const { categories = [], works = [], creators = [] } = currentKindData;
  const songs = activeKind === 'music' ? (currentKindData as any).songs || [] : [];

  // Sync selectedCategoryName when activeKind changes or categories list updates (Only for music)
  useEffect(() => {
    if (activeKind === 'music') {
      if (categories.length > 0) {
        if (!selectedCategoryName || !categories.some(c => c.name === selectedCategoryName)) {
          setSelectedCategoryName(categories[0].name);
        }
      } else {
        setSelectedCategoryName('');
      }
    } else {
      setSelectedCategoryName('');
    }
    setActiveSubtypeTab('work');
  }, [activeKind, categories, selectedCategoryName]);

  // Hook handles auto-saving of changes to the "library" endpoint (background execution, no user-facing status pill)
  const { triggerSave } = useSectionSave('library');

  const updateCategories = (newCategories: LibraryCategoryDTO[]) => {
    setLibraryData((prev) => {
      const next = {
        ...prev,
        [activeKind]: {
          ...prev[activeKind],
          categories: newCategories,
        },
      };
      triggerSave(next);
      return next;
    });
  };

  const updateItems = (subtype: LibrarySubtype, newItems: LibraryItemDTO[]) => {
    const key = subtype === 'work' ? 'works' : subtype === 'creator' ? 'creators' : 'songs';
    setLibraryData((prev) => {
      const next = {
        ...prev,
        [activeKind]: {
          ...prev[activeKind],
          [key]: newItems,
        },
      };
      triggerSave(next);
      return next;
    });
  };

  // Categories Operations (Music only)
  const handleAddCategory = () => {
    const newName = `新分类 ${categories.length + 1}`;
    const newCat: LibraryCategoryDTO = {
      id: generateUUID(),
      kind: activeKind,
      name: newName,
      sortOrder: categories.length,
    };
    updateCategories([...categories, newCat]);
    setSelectedCategoryName(newName);
  };

  const handleUpdateCategoryName = (index: number, newName: string) => {
    const oldName = categories[index].name;
    if (oldName === newName) return;

    const nextCats = [...categories];
    nextCats[index] = { ...nextCats[index], name: newName };

    // Cascade rename items
    const updateList = (list: LibraryItemDTO[]) =>
      list.map((item) => (item.categoryName === oldName ? { ...item, categoryName: newName } : item));

    setLibraryData((prev) => {
      const current = prev[activeKind];
      const next = {
        ...prev,
        [activeKind]: {
          ...current,
          categories: nextCats,
          works: updateList(current.works),
          creators: updateList(current.creators),
          ...(activeKind === 'music' ? { songs: updateList((current as any).songs) } : {}),
        },
      };
      triggerSave(next);
      return next;
    });
  };

  const handleDeleteCategory = (index: number) => {
    const catName = categories[index].name;
    const nextCats = categories.filter((_, i) => i !== index).map((c, idx) => ({ ...c, sortOrder: idx }));

    // Decouple deleted category from items
    const updateList = (list: LibraryItemDTO[]) =>
      list.map((item) => (item.categoryName === catName ? { ...item, categoryName: '', categoryId: null } : item));

    setLibraryData((prev) => {
      const current = prev[activeKind];
      const next = {
        ...prev,
        [activeKind]: {
          ...current,
          categories: nextCats,
          works: updateList(current.works),
          creators: updateList(current.creators),
          ...(activeKind === 'music' ? { songs: updateList((current as any).songs) } : {}),
        },
      };
      triggerSave(next);
      return next;
    });
  };

  const handleMoveCategory = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === categories.length - 1) return;
    const target = direction === 'up' ? index - 1 : index + 1;
    const next = [...categories];
    const temp = next[index];
    next[index] = next[target];
    next[target] = temp;

    const nextCats = next.map((cat, idx) => ({ ...cat, sortOrder: idx }));
    updateCategories(nextCats);
  };

  // Items Operations (strictly scoped to the currently selected Category for music, or global for others)
  const handleAddItem = () => {
    const listKey = activeSubtypeTab === 'work' ? 'works' : activeSubtypeTab === 'creator' ? 'creators' : 'songs';
    const list = activeSubtypeTab === 'work' ? works : activeSubtypeTab === 'creator' ? creators : songs;

    let catId = null;
    let catName = '';

    if (activeKind === 'music' && selectedCategoryName) {
      const currentCat = categories.find((c) => c.name === selectedCategoryName);
      catId = currentCat ? currentCat.id : null;
      catName = selectedCategoryName;
    }

    const newItem: LibraryItemDTO = {
      id: generateUUID(),
      kind: activeKind,
      subtype: activeSubtypeTab,
      categoryId: catId,
      categoryName: catName,
      name: '新项目',
      creator: '',
      link: '',
      comment: '',
      imageUrl: null,
      sortOrder: list.length,
    };
    updateItems(activeSubtypeTab, [...list, newItem]);
  };

  const handleUpdateItemField = (subtype: LibrarySubtype, index: number, field: keyof LibraryItemDTO, value: any) => {
    const listKey = subtype === 'work' ? 'works' : subtype === 'creator' ? 'creators' : 'songs';
    const list = activeKind === 'music' && subtype === 'song' ? songs : (libraryData[activeKind] as any)[listKey];

    const next = [...list];
    if (field === 'categoryName') {
      const cat = categories.find((c) => c.name === value);
      next[index] = {
        ...next[index],
        categoryName: value,
        categoryId: cat ? cat.id : null,
      };
    } else {
      next[index] = { ...next[index], [field]: value };
    }
    updateItems(subtype, next);
  };

  const handleDeleteItem = (subtype: LibrarySubtype, id: string) => {
    const listKey = subtype === 'work' ? 'works' : subtype === 'creator' ? 'creators' : 'songs';
    const list = activeKind === 'music' && subtype === 'song' ? songs : (libraryData[activeKind] as any)[listKey];

    const next = list.filter((item: LibraryItemDTO) => item.id !== id).map((item: any, idx: number) => ({ ...item, sortOrder: idx }));
    updateItems(subtype, next);
  };

  // Swapping items within the active view
  const handleMoveItem = (subtype: LibrarySubtype, index: number, direction: 'up' | 'down') => {
    const listKey = subtype === 'work' ? 'works' : subtype === 'creator' ? 'creators' : 'songs';
    const list = activeKind === 'music' && subtype === 'song' ? songs : (libraryData[activeKind] as any)[listKey];
    
    const filtered = activeKind === 'music'
      ? list.filter((item: LibraryItemDTO) => item.categoryName === selectedCategoryName)
      : list;

    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === filtered.length - 1) return;
    
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const itemA = filtered[index];
    const itemB = filtered[targetIndex];
    
    const globalIdxA = list.findIndex((item: LibraryItemDTO) => item.id === itemA.id);
    const globalIdxB = list.findIndex((item: LibraryItemDTO) => item.id === itemB.id);
    
    if (globalIdxA !== -1 && globalIdxB !== -1) {
      const next = [...list];
      const temp = next[globalIdxA];
      next[globalIdxA] = next[globalIdxB];
      next[globalIdxB] = temp;
      
      const nextList = next.map((item, idx) => ({ ...item, sortOrder: idx }));
      updateItems(subtype, nextList);
    }
  };

  // Get active items list (filtered for music, unfiltered for others)
  const getActiveItems = (list: LibraryItemDTO[]) => {
    if (activeKind !== 'music') return list;
    return list.filter((item) => item.categoryName === selectedCategoryName);
  };

  return (
    <div className="space-y-6">
      <LibraryKindToolbar
        activeKind={activeKind}
        editMode={editMode}
        onKindChange={setActiveKind}
        onModeChange={setEditMode}
      />

      {/* Main Panel Card (No hover bouncy effects, starts directly with content controls) */}
      <GlassCard className="p-6 space-y-6" hover={false}>
        <LibraryCollectionControls
          activeKind={activeKind}
          activeSubtype={activeSubtypeTab}
          categories={categories}
          creators={creators}
          editMode={editMode}
          selectedCategoryName={selectedCategoryName}
          songs={songs}
          works={works}
          onAddItem={handleAddItem}
          onManageCategories={() => setIsCategoryModalOpen(true)}
          onSelectCategory={setSelectedCategoryName}
          onSubtypeChange={setActiveSubtypeTab}
        />

        {/* Mode contents */}
        {editMode === 'preview' ? (
          activeKind !== 'music' || (categories.length > 0 && selectedCategoryName) ? (
            <LibraryPreviewPanel
              creators={creators}
              kind={activeKind}
              selectedCategoryName={selectedCategoryName}
              songs={songs}
              works={works}
            />
          ) : (
            <p className="py-12 text-center text-gray-400 text-xs italic">
              无任何分类，请先切换到“编辑数据”模式新增分类
            </p>
          )
        ) : (
          <div className="space-y-6 animate-fadeIn">
            {activeKind !== 'music' || (categories.length > 0 && selectedCategoryName) ? (
              <>
                <LibraryItemEditorList
                  categories={categories}
                  items={getActiveItems(
                    activeSubtypeTab === 'work'
                      ? works
                      : activeSubtypeTab === 'creator'
                        ? creators
                        : songs
                  )}
                  kind={activeKind}
                  onDelete={handleDeleteItem}
                  onMove={handleMoveItem}
                  onUpdate={(id, field, value) => {
                    const list =
                      activeSubtypeTab === 'work'
                        ? works
                        : activeSubtypeTab === 'creator'
                          ? creators
                          : songs;
                    const index = list.findIndex((item: LibraryItemDTO) => item.id === id);
                    if (index !== -1) {
                      handleUpdateItemField(activeSubtypeTab, index, field, value);
                    }
                  }}
                  subtype={activeSubtypeTab}
                />
              </>
            ) : (
              <p className="text-xs text-gray-400 italic text-center py-12 animate-fadeIn">
                请先点击上方的编辑图标以创建您的第一个类别
              </p>
            )}
          </div>
        )}
      </GlassCard>

      <LibraryCategoryModal
        categories={categories}
        onAdd={handleAddCategory}
        onClose={() => setIsCategoryModalOpen(false)}
        onDelete={handleDeleteCategory}
        onMove={handleMoveCategory}
        onRename={handleUpdateCategoryName}
        open={isCategoryModalOpen}
      />
    </div>
  );
}
