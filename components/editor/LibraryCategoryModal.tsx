import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react';
import Modal from '@/components/Modal';
import type { LibraryCategoryDTO } from '@/types';

interface LibraryCategoryModalProps {
  categories: LibraryCategoryDTO[];
  onAdd: () => void;
  onClose: () => void;
  onDelete: (index: number) => void;
  onMove: (index: number, direction: 'up' | 'down') => void;
  onRename: (index: number, name: string) => void;
  open: boolean;
}

export default function LibraryCategoryModal({
  categories,
  onAdd,
  onClose,
  onDelete,
  onMove,
  onRename,
  open,
}: LibraryCategoryModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      className="max-w-md border border-white/20 bg-white/95 text-gray-900 dark:bg-gray-900/95 dark:text-gray-100"
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between border-white/10 border-b pb-2 dark:border-gray-800">
          <h3 className="font-bold text-sm text-teal-600 uppercase tracking-wider dark:text-teal-400">
            管理音乐分类
          </h3>
          <button
            onClick={onAdd}
            className="flex cursor-pointer items-center gap-1 rounded-xl border border-teal-500/20 bg-teal-500/10 px-2.5 py-1 font-bold text-teal-600 text-xs transition hover:bg-teal-500/20 dark:text-teal-400"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>新增分类</span>
          </button>
        </div>

        <div className="max-h-[300px] space-y-2 overflow-y-auto pr-1">
          {categories.map((category, index) => (
            <div
              key={category.id}
              className="flex items-center gap-2 rounded-xl border border-white/10 bg-gray-500/5 p-2 transition dark:border-gray-800"
            >
              <input
                type="text"
                value={category.name}
                onChange={(event) => onRename(index, event.target.value)}
                className="flex-1 rounded-lg border border-white/10 bg-white/50 px-2.5 py-1.5 font-bold text-gray-800 text-xs focus:border-teal-500 focus:outline-none dark:border-gray-800 dark:bg-gray-900/50 dark:text-gray-200"
                placeholder="分类名称"
              />
              <div className="flex items-center gap-0.5">
                <button onClick={() => onMove(index, 'up')} disabled={index === 0} className="cursor-pointer p-1.5 text-gray-400 hover:text-gray-700 disabled:opacity-30 dark:hover:text-white" title="上移">
                  <ArrowUp className="h-3.5 w-3.5" />
                </button>
                <button onClick={() => onMove(index, 'down')} disabled={index === categories.length - 1} className="cursor-pointer p-1.5 text-gray-400 hover:text-gray-700 disabled:opacity-30 dark:hover:text-white" title="下移">
                  <ArrowDown className="h-3.5 w-3.5" />
                </button>
                <button onClick={() => onDelete(index)} className="cursor-pointer rounded-lg p-1.5 text-rose-500 transition hover:bg-rose-500/10" title="删除">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
          {categories.length === 0 ? (
            <p className="py-6 text-center text-gray-400 text-xs italic">暂无分类，请点击右上角“新增分类”</p>
          ) : null}
        </div>

        <div className="flex justify-end border-white/10 border-t pt-2 dark:border-gray-800">
          <button onClick={onClose} className="cursor-pointer rounded-xl border border-teal-500/20 bg-teal-500/10 px-4 py-2 font-bold text-teal-600 text-xs transition hover:bg-teal-500/20 dark:text-teal-400">
            完成编辑
          </button>
        </div>
      </div>
    </Modal>
  );
}
