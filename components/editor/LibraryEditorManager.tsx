'use client';

import GlassCard from '@/components/GlassCard';
import type { LibraryByKind } from '@/types';
import LibraryCategoryModal from './LibraryCategoryModal';
import { LibraryCollectionControls, LibraryKindToolbar } from './LibraryEditorToolbar';
import LibraryItemEditorList from './LibraryItemEditorList';
import LibraryPreviewPanel from './LibraryPreviewPanel';
import { useLibraryEditor } from './hooks/useLibraryEditor';

interface LibraryEditorManagerProps {
  initialLibrary: LibraryByKind;
}

export default function LibraryEditorManager({ initialLibrary }: LibraryEditorManagerProps) {
  const {
    activeItems,
    activeKind,
    activeSubtypeTab,
    addCategory,
    addItem,
    categories,
    creators,
    deleteCategory,
    deleteItem,
    editMode,
    isCategoryModalOpen,
    moveCategory,
    moveItem,
    renameCategory,
    selectedCategoryName,
    setActiveKind,
    setActiveSubtypeTab,
    setEditMode,
    setIsCategoryModalOpen,
    setSelectedCategoryName,
    songs,
    updateItem,
    works,
  } = useLibraryEditor(initialLibrary);

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
          onAddItem={addItem}
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
                  items={activeItems(
                    activeSubtypeTab === 'work'
                      ? works
                      : activeSubtypeTab === 'creator'
                        ? creators
                        : songs
                  )}
                  kind={activeKind}
                  onDelete={deleteItem}
                  onMove={moveItem}
                  onUpdate={updateItem}
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
        onAdd={addCategory}
        onClose={() => setIsCategoryModalOpen(false)}
        onDelete={deleteCategory}
        onMove={moveCategory}
        onRename={renameCategory}
        open={isCategoryModalOpen}
      />
    </div>
  );
}
