import { BookOpen, Compass, FileEdit, Film, Gamepad2, Music, Plus, Settings } from 'lucide-react';
import type { LibraryCategoryDTO, LibraryItemDTO, LibraryKind, LibrarySubtype } from '@/types';

const KIND_CONFIG = {
  music: { label: '音乐', icon: Music },
  film: { label: '影视', icon: Film },
  game: { label: '游戏', icon: Gamepad2 },
  book: { label: '读书', icon: BookOpen },
} as const;

export function LibraryKindToolbar({
  activeKind,
  editMode,
  onKindChange,
  onModeChange,
}: {
  activeKind: LibraryKind;
  editMode: 'preview' | 'edit';
  onKindChange: (kind: LibraryKind) => void;
  onModeChange: (mode: 'preview' | 'edit') => void;
}) {
  return (
    <div className="flex flex-row items-center justify-between gap-4 overflow-x-auto border-white/10 border-b pb-4">
      <div className="flex rounded-2xl border border-white/5 bg-gray-500/10 p-1">
        {(Object.keys(KIND_CONFIG) as LibraryKind[]).map((kind) => {
          const config = KIND_CONFIG[kind];
          const Icon = config.icon;
          return (
            <button key={kind} onClick={() => onKindChange(kind)} className={`flex cursor-pointer items-center gap-1.5 rounded-xl px-3.5 py-1.5 font-extrabold text-xs transition-all ${activeKind === kind ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-800 dark:text-white' : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'}`}>
              <Icon className="h-4 w-4" /><span>{config.label}</span>
            </button>
          );
        })}
      </div>
      <div className="flex rounded-2xl border border-white/5 bg-gray-500/10 p-1">
        <ModeButton active={editMode === 'edit'} icon={FileEdit} label="编辑数据" onClick={() => onModeChange('edit')} />
        <ModeButton active={editMode === 'preview'} icon={Compass} label="卡片预览" onClick={() => onModeChange('preview')} />
      </div>
    </div>
  );
}

function ModeButton({ active, icon: Icon, label, onClick }: { active: boolean; icon: typeof FileEdit; label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className={`flex cursor-pointer items-center gap-1.5 rounded-xl px-3 py-1.5 font-bold text-xs transition-all ${active ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-800 dark:text-white' : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'}`}>
      <Icon className="h-3.5 w-3.5" /><span>{label}</span>
    </button>
  );
}

interface LibraryCollectionControlsProps {
  activeKind: LibraryKind;
  activeSubtype: LibrarySubtype;
  categories: LibraryCategoryDTO[];
  creators: LibraryItemDTO[];
  editMode: 'preview' | 'edit';
  selectedCategoryName: string;
  songs: LibraryItemDTO[];
  works: LibraryItemDTO[];
  onAddItem: () => void;
  onManageCategories: () => void;
  onSelectCategory: (name: string) => void;
  onSubtypeChange: (subtype: LibrarySubtype) => void;
}

export function LibraryCollectionControls(props: LibraryCollectionControlsProps) {
  const { activeKind, activeSubtype, categories, creators, editMode, selectedCategoryName,
    songs, works, onAddItem, onManageCategories, onSelectCategory, onSubtypeChange } = props;
  if (activeKind !== 'music' && editMode !== 'edit') return null;

  const categoryCount = (items: LibraryItemDTO[]) => items.filter((item) => item.categoryName === selectedCategoryName).length;
  const tabs: Array<{ id: LibrarySubtype; label: string; count: number }> = activeKind === 'music'
    ? [
        { id: 'work', label: '专辑', count: categoryCount(works) },
        { id: 'song', label: '单曲', count: categoryCount(songs) },
        { id: 'creator', label: '音乐人', count: categoryCount(creators) },
      ]
    : [
        { id: 'work', label: activeKind === 'game' ? '游戏' : activeKind === 'book' ? '书籍' : '影片', count: works.length },
        { id: 'creator', label: activeKind === 'game' ? '开发商' : activeKind === 'book' ? '作者' : '影人', count: creators.length },
      ];
  const canEditMusic = activeKind !== 'music' || (categories.length > 0 && Boolean(selectedCategoryName));

  return (
    <div className="flex flex-row items-center justify-between gap-4 overflow-x-auto border-white/10 border-b pb-4">
      {activeKind === 'music' ? (
        <div className="flex flex-nowrap items-center gap-1.5">
          {categories.map((category) => <button key={category.id} onClick={() => onSelectCategory(category.name)} className={`cursor-pointer whitespace-nowrap rounded-xl border px-3.5 py-1.5 font-bold text-xs transition duration-200 ${selectedCategoryName === category.name ? 'border-teal-500/30 bg-teal-500/10 text-teal-600 dark:text-teal-400' : 'border-white/10 bg-white/30 text-gray-500 hover:bg-white/50 hover:text-gray-800 dark:bg-gray-800/30 dark:hover:bg-gray-800/50'}`}>{category.name}</button>)}
          {editMode === 'edit' ? <button onClick={onManageCategories} className="ml-1 cursor-pointer rounded-xl border border-white/10 bg-white/30 p-2 text-gray-500 transition hover:bg-white/50 hover:text-gray-800 dark:bg-gray-800/30 dark:hover:bg-gray-800/50 dark:hover:text-gray-200" title="管理分类"><Settings className="h-3.5 w-3.5" /></button> : null}
        </div>
      ) : <SubtypeTabs tabs={tabs} activeSubtype={activeSubtype} onChange={onSubtypeChange} />}
      {editMode === 'edit' && canEditMusic ? (
        <div className="flex items-center gap-3">
          {activeKind === 'music' ? <SubtypeTabs tabs={tabs} activeSubtype={activeSubtype} onChange={onSubtypeChange} /> : null}
          <button onClick={onAddItem} className="flex cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-xl border border-teal-500/20 bg-teal-500/10 px-3 py-1.5 font-semibold text-teal-600 text-xs transition hover:bg-teal-500/20 dark:text-teal-400"><Plus className="h-3.5 w-3.5" /><span>添加条目</span></button>
        </div>
      ) : null}
    </div>
  );
}

function SubtypeTabs({ tabs, activeSubtype, onChange }: { tabs: Array<{ id: LibrarySubtype; label: string; count: number }>; activeSubtype: LibrarySubtype; onChange: (subtype: LibrarySubtype) => void }) {
  return (
    <div className="flex rounded-xl border border-white/5 bg-gray-500/10 p-0.5">
      {tabs.map((tab) => <button key={tab.id} onClick={() => onChange(tab.id)} className={`cursor-pointer whitespace-nowrap rounded-lg px-3 py-1 font-bold text-xs transition ${activeSubtype === tab.id ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-800 dark:text-white' : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'}`}><span>{tab.label}</span><span className="ml-1 font-mono text-[10px] opacity-75">({tab.count})</span></button>)}
    </div>
  );
}
