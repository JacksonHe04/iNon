'use client';

import React, { useState, useEffect } from 'react';
import {
  Music as MusicIcon,
  Film as FilmIcon,
  BookOpen as BookIcon,
  Gamepad2 as GameIcon,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Compass,
  FileEdit,
  Settings,
} from 'lucide-react';
import GlassCard from '@/components/GlassCard';
import Modal from '@/components/Modal';
import { useSectionSave } from './hooks/useSectionSave';
import type { LibraryByKind, LibraryItemDTO, LibraryCategoryDTO, LibraryKind, LibrarySubtype } from '@/types';
import MusicBlock from '@/components/blocks/MusicBlock';
import MovieBlock from '@/components/blocks/MovieBlock';
import BookBlock from '@/components/blocks/BookBlock';
import GameBlock from '@/components/blocks/GameBlock';
import ImageInput from './ImageInput';

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
  useSectionSave('library', libraryData);

  const kindConfig = {
    music: { label: '音乐', icon: MusicIcon },
    film: { label: '影视', icon: FilmIcon },
    game: { label: '游戏', icon: GameIcon },
    book: { label: '读书', icon: BookIcon },
  } as const;

  const updateCategories = (newCategories: LibraryCategoryDTO[]) => {
    setLibraryData((prev) => ({
      ...prev,
      [activeKind]: {
        ...prev[activeKind],
        categories: newCategories,
      },
    }));
  };

  const updateItems = (subtype: LibrarySubtype, newItems: LibraryItemDTO[]) => {
    const key = subtype === 'work' ? 'works' : subtype === 'creator' ? 'creators' : 'songs';
    setLibraryData((prev) => ({
      ...prev,
      [activeKind]: {
        ...prev[activeKind],
        [key]: newItems,
      },
    }));
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
      return {
        ...prev,
        [activeKind]: {
          ...current,
          categories: nextCats,
          works: updateList(current.works),
          creators: updateList(current.creators),
          ...(activeKind === 'music' ? { songs: updateList((current as any).songs) } : {}),
        },
      };
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
      return {
        ...prev,
        [activeKind]: {
          ...current,
          categories: nextCats,
          works: updateList(current.works),
          creators: updateList(current.creators),
          ...(activeKind === 'music' ? { songs: updateList((current as any).songs) } : {}),
        },
      };
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

  const activeConfig = kindConfig[activeKind];

  return (
    <div className="space-y-6">
      {/* Top Header Row: Merges Kind Tabs and Mode Switch into a single highly-compact line */}
      <div className="flex flex-row items-center justify-between gap-4 border-b border-white/10 pb-4 overflow-x-auto">
        {/* Kind selector tabs */}
        <div className="flex bg-gray-500/10 rounded-2xl p-1 border border-white/5">
          {(Object.keys(kindConfig) as LibraryKind[]).map((k) => {
            const cfg = kindConfig[k];
            const Icon = cfg.icon;
            const isSelected = activeKind === k;
            return (
              <button
                key={k}
                onClick={() => setActiveKind(k)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{cfg.label}</span>
              </button>
            );
          })}
        </div>

        {/* Mode Switch (Edit vs Preview) */}
        <div className="flex bg-gray-500/10 rounded-2xl p-1 border border-white/5">
          <button
            onClick={() => setEditMode('edit')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              editMode === 'edit'
                ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
            }`}
          >
            <FileEdit className="w-3.5 h-3.5" />
            <span>编辑数据</span>
          </button>
          <button
            onClick={() => setEditMode('preview')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              editMode === 'preview'
                ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>卡片预览</span>
          </button>
        </div>
      </div>

      {/* Main Panel Card (No hover bouncy effects, starts directly with content controls) */}
      <GlassCard className="p-6 space-y-6" hover={false}>
        {/* Category Tabs & Subtype controls merged into a single clean line */}
        {(activeKind === 'music' || editMode === 'edit') && (
          <div className="flex flex-row items-center justify-between gap-4 border-b border-white/10 pb-4 overflow-x-auto">
            {activeKind === 'music' ? (
              <>
                {/* Left Column: Categories List */}
                <div className="flex items-center gap-1.5 flex-nowrap">
                  {categories.map((cat) => {
                    const isSelected = selectedCategoryName === cat.name;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedCategoryName(cat.name)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition duration-200 cursor-pointer whitespace-nowrap ${
                          isSelected
                            ? 'bg-teal-500/10 border-teal-500/30 text-teal-600 dark:text-teal-400'
                            : 'bg-white/30 dark:bg-gray-800/30 border-white/10 text-gray-500 hover:text-gray-800 hover:bg-white/50 dark:hover:bg-gray-800/50'
                        }`}
                      >
                        {cat.name}
                      </button>
                    );
                  })}
                  
                  {editMode === 'edit' && (
                    <button
                      onClick={() => setIsCategoryModalOpen(true)}
                      className="p-2 rounded-xl bg-white/30 dark:bg-gray-800/30 border border-white/10 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-white/50 dark:hover:bg-gray-800/50 cursor-pointer transition ml-1"
                      title="管理分类"
                    >
                      <Settings className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Right Column: Subtype filter & Add button */}
                {editMode === 'edit' && categories.length > 0 && selectedCategoryName && (
                  <div className="flex items-center gap-3">
                    <div className="flex bg-gray-500/10 rounded-xl p-0.5 border border-white/5">
                      {[
                        { id: 'work', label: '专辑' },
                        { id: 'song', label: '单曲' },
                        { id: 'creator', label: '音乐人' },
                      ].map((tab) => {
                        const isActive = activeSubtypeTab === tab.id;
                        const count = getActiveItems(
                          tab.id === 'work' ? works : tab.id === 'creator' ? creators : songs
                        ).length;
                        return (
                          <button
                            key={tab.id}
                            onClick={() => setActiveSubtypeTab(tab.id as any)}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                              isActive
                                ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                                : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
                            }`}
                          >
                            <span>{tab.label}</span>
                            <span className="text-[10px] opacity-75 font-mono ml-1">({count})</span>
                          </button>
                        );
                      })}
                    </div>

                    <button
                      onClick={handleAddItem}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20 text-xs font-semibold hover:bg-teal-500/20 transition cursor-pointer whitespace-nowrap"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>添加条目</span>
                    </button>
                  </div>
                )}
              </>
            ) : (
              <>
                {/* Left Column: Subtype Tabs */}
                <div className="flex bg-gray-500/10 rounded-xl p-0.5 border border-white/5">
                  {[
                    { id: 'work', label: activeKind === 'game' ? '游戏' : activeKind === 'book' ? '书籍' : '影片' },
                    { id: 'creator', label: activeKind === 'game' ? '开发商' : activeKind === 'book' ? '作者' : '影人' },
                  ].map((tab) => {
                    const isActive = activeSubtypeTab === tab.id;
                    const count = tab.id === 'work' ? works.length : creators.length;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveSubtypeTab(tab.id as any)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                          isActive
                            ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                            : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
                        }`}
                      >
                        <span>{tab.label}</span>
                        <span className="text-[10px] opacity-75 font-mono ml-1">({count})</span>
                      </button>
                    );
                  })}
                </div>

                {/* Right Column: Add Item Button (Uniformly aligned to the right!) */}
                <button
                  onClick={handleAddItem}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20 text-xs font-semibold hover:bg-teal-500/20 transition cursor-pointer whitespace-nowrap animate-fadeIn"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>添加条目</span>
                </button>
              </>
            )}
          </div>
        )}

        {/* Mode contents */}
        {editMode === 'preview' ? (
          <div className="space-y-6 animate-fadeIn">
            {activeKind !== 'music' || (categories.length > 0 && selectedCategoryName) ? (
              <div className="border border-white/10 rounded-3xl p-1 bg-black/5 dark:bg-black/20">
                {activeKind === 'music' && (
                  <MusicBlock
                    albums={getActiveItems(works)}
                    songs={getActiveItems(songs)}
                    musicians={getActiveItems(creators)}
                    title={`${selectedCategoryName} · 音乐`}
                    colSpan={2}
                  />
                )}
                {activeKind === 'film' && (
                  <MovieBlock
                    films={works}
                    directors={creators}
                    title="影视"
                    colSpan={2}
                    mode="readonly"
                  />
                )}
                {activeKind === 'book' && (
                  <BookBlock
                    books={works}
                    authors={creators}
                    title="读书"
                    colSpan={2}
                    mode="readonly"
                  />
                )}
                {activeKind === 'game' && (
                  <GameBlock
                    works={works}
                    creators={creators}
                    title="游戏"
                    colSpan={2}
                  />
                )}
              </div>
            ) : (
              <p className="text-xs text-gray-400 italic text-center py-12">
                无任何分类，请先切换到“编辑数据”模式新增分类
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-6 animate-fadeIn">
            {activeKind !== 'music' || (categories.length > 0 && selectedCategoryName) ? (
              <>
                {/* Items List (Strictly isolated by selectedCategoryName for music, or global for others) */}
                <div className="space-y-4 max-h-[640px] overflow-y-auto pr-1">
                  {getActiveItems(
                    activeSubtypeTab === 'work' ? works : activeSubtypeTab === 'creator' ? creators : songs
                  ).map((item, idx) => (
                    <div
                      key={item.id}
                      className="p-4 rounded-2xl bg-white/30 dark:bg-gray-800/40 border border-white/20 space-y-4 hover:border-teal-500/20 transition"
                    >
                      {/* Item Header */}
                      <div className="flex items-center justify-between border-b border-white/10 pb-2">
                        <span className="text-xs font-extrabold text-teal-600 dark:text-teal-400">
                          #{idx + 1} {item.name || '新条目'}
                        </span>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleMoveItem(activeSubtypeTab, idx, 'up')}
                            disabled={idx === 0}
                            className="p-1 text-gray-400 hover:text-gray-700 dark:hover:text-white disabled:opacity-30 cursor-pointer"
                            title="上移"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleMoveItem(activeSubtypeTab, idx, 'down')}
                            disabled={
                              idx ===
                              getActiveItems(
                                activeSubtypeTab === 'work' ? works : activeSubtypeTab === 'creator' ? creators : songs
                              ).length - 1
                            }
                            className="p-1 text-gray-400 hover:text-gray-700 dark:hover:text-white disabled:opacity-30 cursor-pointer"
                            title="下移"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteItem(activeSubtypeTab, item.id)}
                            className="p-1 text-rose-500 hover:bg-rose-500/10 rounded-xl transition cursor-pointer ml-1"
                            title="删除"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Fields grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Name */}
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                            名称
                          </label>
                          <input
                            type="text"
                            value={item.name}
                            onChange={(e) => {
                              const globalListKey = activeSubtypeTab === 'work' ? 'works' : activeSubtypeTab === 'creator' ? 'creators' : 'songs';
                              const globalList = (libraryData[activeKind] as any)[globalListKey];
                              const globalIdx = globalList.findIndex((it: LibraryItemDTO) => it.id === item.id);
                              if (globalIdx !== -1) {
                                handleUpdateItemField(activeSubtypeTab, globalIdx, 'name', e.target.value);
                              }
                            }}
                            className="w-full bg-white/50 dark:bg-gray-900/50 border border-white/10 dark:border-gray-800 rounded-xl px-3 py-1.5 text-xs text-gray-800 dark:text-gray-100 focus:outline-none focus:border-teal-500"
                            placeholder="名称"
                          />
                        </div>

                        {/* Creator */}
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                            {activeSubtypeTab === 'creator'
                              ? '所属地区/类型'
                              : activeKind === 'music'
                              ? '音乐人'
                              : activeKind === 'film'
                              ? '导演/主创'
                              : activeKind === 'game'
                              ? '发行/开发商'
                              : '作者'}
                          </label>
                          <input
                            type="text"
                            value={item.creator}
                            onChange={(e) => {
                              const globalListKey = activeSubtypeTab === 'work' ? 'works' : activeSubtypeTab === 'creator' ? 'creators' : 'songs';
                              const globalList = (libraryData[activeKind] as any)[globalListKey];
                              const globalIdx = globalList.findIndex((it: LibraryItemDTO) => it.id === item.id);
                              if (globalIdx !== -1) {
                                handleUpdateItemField(activeSubtypeTab, globalIdx, 'creator', e.target.value);
                              }
                            }}
                            className="w-full bg-white/50 dark:bg-gray-900/50 border border-white/10 dark:border-gray-800 rounded-xl px-3 py-1.5 text-xs text-gray-800 dark:text-gray-100 focus:outline-none focus:border-teal-500"
                            placeholder="创作者"
                          />
                        </div>

                        {/* Category Dropdown (Only for music) */}
                        {activeKind === 'music' && (
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                              归属类别
                            </label>
                            <select
                              value={item.categoryName || ''}
                              onChange={(e) => {
                                const globalListKey = activeSubtypeTab === 'work' ? 'works' : activeSubtypeTab === 'creator' ? 'creators' : 'songs';
                                const globalList = (libraryData[activeKind] as any)[globalListKey];
                                const globalIdx = globalList.findIndex((it: LibraryItemDTO) => it.id === item.id);
                                if (globalIdx !== -1) {
                                  handleUpdateItemField(activeSubtypeTab, globalIdx, 'categoryName', e.target.value);
                              }
                            }}
                            className="w-full bg-white/50 dark:bg-gray-900/50 border border-white/10 dark:border-gray-800 rounded-xl px-3 py-1.5 text-xs text-gray-800 dark:text-gray-100 focus:outline-none focus:border-teal-500"
                            >
                              <option value="">未分类</option>
                              {categories.map((cat) => (
                                <option key={cat.id} value={cat.name}>
                                  {cat.name}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}

                        {/* Link */}
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                            跳转链接 (Link)
                          </label>
                          <input
                            type="text"
                            value={item.link}
                            onChange={(e) => {
                              const globalListKey = activeSubtypeTab === 'work' ? 'works' : activeSubtypeTab === 'creator' ? 'creators' : 'songs';
                              const globalList = (libraryData[activeKind] as any)[globalListKey];
                              const globalIdx = globalList.findIndex((it: LibraryItemDTO) => it.id === item.id);
                              if (globalIdx !== -1) {
                                handleUpdateItemField(activeSubtypeTab, globalIdx, 'link', e.target.value);
                              }
                            }}
                            className="w-full bg-white/50 dark:bg-gray-900/50 border border-white/10 dark:border-gray-800 rounded-xl px-3 py-1.5 text-xs text-gray-800 dark:text-gray-100 focus:outline-none focus:border-teal-500"
                            placeholder="https://..."
                          />
                        </div>

                        {/* Image URL with upload & preview */}
                        <div className="col-span-full">
                          <ImageInput
                            label="封面图片链接 (ImageUrl)"
                            value={item.imageUrl || ''}
                            disableUpload={true}
                            onChange={(val) => {
                              const globalListKey = activeSubtypeTab === 'work' ? 'works' : activeSubtypeTab === 'creator' ? 'creators' : 'songs';
                              const globalList = (libraryData[activeKind] as any)[globalListKey];
                              const globalIdx = globalList.findIndex((it: LibraryItemDTO) => it.id === item.id);
                              if (globalIdx !== -1) {
                                handleUpdateItemField(activeSubtypeTab, globalIdx, 'imageUrl', val);
                              }
                            }}
                          />
                        </div>

                        {/* Comment */}
                        <div className="col-span-full space-y-1">
                          <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                            短评 / 鉴赏心得
                          </label>
                          <textarea
                            value={item.comment}
                            onChange={(e) => {
                              const globalListKey = activeSubtypeTab === 'work' ? 'works' : activeSubtypeTab === 'creator' ? 'creators' : 'songs';
                              const globalList = (libraryData[activeKind] as any)[globalListKey];
                              const globalIdx = globalList.findIndex((it: LibraryItemDTO) => it.id === item.id);
                              if (globalIdx !== -1) {
                                handleUpdateItemField(activeSubtypeTab, globalIdx, 'comment', e.target.value);
                              }
                            }}
                            rows={3}
                            className="w-full bg-white/50 dark:bg-gray-900/50 border border-white/10 dark:border-gray-800 rounded-xl px-3 py-1.5 text-xs text-gray-800 dark:text-gray-100 focus:outline-none focus:border-teal-500"
                            placeholder="评论 / 鉴赏心得"
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  {getActiveItems(
                    activeSubtypeTab === 'work' ? works : activeSubtypeTab === 'creator' ? creators : songs
                  ).length === 0 && (
                    <p className="text-xs text-gray-400 italic text-center py-12 border border-dashed border-white/20 rounded-2xl bg-white/5 dark:bg-black/10 animate-fadeIn">
                      暂无条目，请点击右上角“添加条目”
                    </p>
                  )}
                </div>
              </>
            ) : (
              <p className="text-xs text-gray-400 italic text-center py-12 animate-fadeIn">
                请先点击上方的编辑图标以创建您的第一个类别
              </p>
            )}
          </div>
        )}
      </GlassCard>

      {/* Categories Editing Modal */}
      <Modal
        open={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        className="max-w-md bg-white/95 dark:bg-gray-900/95 text-gray-900 dark:text-gray-100 border border-white/20"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 dark:border-gray-800 pb-2">
            <h3 className="text-sm font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
              管理音乐分类
            </h3>
            <button
              onClick={handleAddCategory}
              className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20 text-xs font-bold hover:bg-teal-500/20 transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>新增分类</span>
            </button>
          </div>

          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
            {categories.map((cat, idx) => (
              <div
                key={cat.id}
                className="flex items-center gap-2 p-2 rounded-xl bg-gray-500/5 border border-white/10 dark:border-gray-800 transition"
              >
                <input
                  type="text"
                  value={cat.name}
                  onChange={(e) => handleUpdateCategoryName(idx, e.target.value)}
                  className="flex-1 bg-white/50 dark:bg-gray-900/50 border border-white/10 dark:border-gray-800 rounded-lg px-2.5 py-1.5 text-xs text-gray-800 dark:text-gray-200 focus:outline-none focus:border-teal-500 font-bold"
                  placeholder="分类名称"
                />

                <div className="flex items-center gap-0.5">
                  <button
                    onClick={() => handleMoveCategory(idx, 'up')}
                    disabled={idx === 0}
                    className="p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-white disabled:opacity-30 cursor-pointer"
                    title="上移"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleMoveCategory(idx, 'down')}
                    disabled={idx === categories.length - 1}
                    className="p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-white disabled:opacity-30 cursor-pointer"
                    title="下移"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteCategory(idx)}
                    className="p-1.5 text-rose-500 hover:bg-rose-500/10 rounded-lg transition cursor-pointer"
                    title="删除"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}

            {categories.length === 0 && (
              <p className="text-xs text-gray-400 italic text-center py-6">
                暂无分类，请点击右上角“新增分类”
              </p>
            )}
          </div>

          <div className="flex justify-end pt-2 border-t border-white/10 dark:border-gray-800">
            <button
              onClick={() => setIsCategoryModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-teal-500/10 hover:bg-teal-500/20 text-teal-600 dark:text-teal-400 border border-teal-500/20 text-xs font-bold transition cursor-pointer"
            >
              完成编辑
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
