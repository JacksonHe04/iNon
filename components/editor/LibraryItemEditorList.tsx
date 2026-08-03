import { ArrowDown, ArrowUp, Trash2 } from 'lucide-react';
import type { LibraryCategoryDTO, LibraryItemDTO, LibraryKind, LibrarySubtype } from '@/types';
import ImageInput from './ImageInput';

const INPUT_CLASS =
  'w-full rounded-xl border border-white/10 bg-white/50 px-3 py-1.5 text-gray-800 text-xs focus:border-teal-500 focus:outline-none dark:border-gray-800 dark:bg-gray-900/50 dark:text-gray-100';

interface LibraryItemEditorListProps {
  categories: LibraryCategoryDTO[];
  items: LibraryItemDTO[];
  kind: LibraryKind;
  onDelete: (subtype: LibrarySubtype, id: string) => void;
  onMove: (subtype: LibrarySubtype, index: number, direction: 'up' | 'down') => void;
  onUpdate: (id: string, field: keyof LibraryItemDTO, value: unknown) => void;
  subtype: LibrarySubtype;
}

function creatorLabel(kind: LibraryKind, subtype: LibrarySubtype) {
  if (subtype === 'creator') return '所属地区/类型';
  if (kind === 'music') return '音乐人';
  if (kind === 'film') return '导演/主创';
  if (kind === 'game') return '发行/开发商';
  return '作者';
}

export default function LibraryItemEditorList({
  categories,
  items,
  kind,
  onDelete,
  onMove,
  onUpdate,
  subtype,
}: LibraryItemEditorListProps) {
  if (items.length === 0) {
    return (
      <p className="animate-fadeIn rounded-2xl border border-white/20 border-dashed bg-white/5 py-12 text-center text-gray-400 text-xs italic dark:bg-black/10">
        暂无条目，请点击右上角“添加条目”
      </p>
    );
  }

  return (
    <div className="max-h-[640px] space-y-4 overflow-y-auto pr-1">
      {items.map((item, index) => (
        <div key={item.id} className="space-y-4 rounded-2xl border border-white/20 bg-white/30 p-4 transition hover:border-teal-500/20 dark:bg-gray-800/40">
          <div className="flex items-center justify-between border-white/10 border-b pb-2">
            <span className="font-extrabold text-teal-600 text-xs dark:text-teal-400">#{index + 1} {item.name || '新条目'}</span>
            <div className="flex items-center gap-1">
              <button onClick={() => onMove(subtype, index, 'up')} disabled={index === 0} className="cursor-pointer p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30 dark:hover:text-white" title="上移"><ArrowUp className="h-3.5 w-3.5" /></button>
              <button onClick={() => onMove(subtype, index, 'down')} disabled={index === items.length - 1} className="cursor-pointer p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30 dark:hover:text-white" title="下移"><ArrowDown className="h-3.5 w-3.5" /></button>
              <button onClick={() => onDelete(subtype, item.id)} className="ml-1 cursor-pointer rounded-xl p-1 text-rose-500 transition hover:bg-rose-500/10" title="删除"><Trash2 className="h-3.5 w-3.5" /></button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="名称">
              <input type="text" value={item.name} onChange={(event) => onUpdate(item.id, 'name', event.target.value)} className={INPUT_CLASS} placeholder="名称" />
            </Field>
            <Field label={creatorLabel(kind, subtype)}>
              <input type="text" value={item.creator} onChange={(event) => onUpdate(item.id, 'creator', event.target.value)} className={INPUT_CLASS} placeholder="创作者" />
            </Field>
            {kind === 'music' ? (
              <Field label="归属类别">
                <select value={item.categoryName || ''} onChange={(event) => onUpdate(item.id, 'categoryName', event.target.value)} className={INPUT_CLASS}>
                  <option value="">未分类</option>
                  {categories.map((category) => <option key={category.id} value={category.name}>{category.name}</option>)}
                </select>
              </Field>
            ) : null}
            <Field label="跳转链接 (Link)">
              <input type="text" value={item.link} onChange={(event) => onUpdate(item.id, 'link', event.target.value)} className={INPUT_CLASS} placeholder="https://..." />
            </Field>
            <div className="col-span-full">
              <ImageInput label="封面图片链接 (ImageUrl)" value={item.imageUrl || ''} disableUpload onChange={(value) => onUpdate(item.id, 'imageUrl', value)} />
            </div>
            <div className="col-span-full">
              <Field label="短评 / 鉴赏心得">
                <textarea value={item.comment} onChange={(event) => onUpdate(item.id, 'comment', event.target.value)} rows={3} className={INPUT_CLASS} placeholder="评论 / 鉴赏心得" />
              </Field>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function Field({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <div className="space-y-1">
      <label className="font-bold text-[10px] text-gray-400 uppercase tracking-wider dark:text-gray-500">{label}</label>
      {children}
    </div>
  );
}
