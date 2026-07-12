import React from 'react';
import { Plus, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import { TextInput } from './TextInput';
import { TextAreaInput } from './TextAreaInput';
import { StringListEditor } from './StringListEditor';
import { ImageInput } from './ImageInput';
import type { FieldConfig } from './types';

interface ObjectArrayEditorProps<T extends Record<string, any>> {
  title: string;
  items: T[];
  onChange: (next: T[]) => void;
  createItem: () => T;
  fields: FieldConfig[];
  getItemTitle?: (item: T, index: number) => string;
}

export function ObjectArrayEditor<T extends Record<string, any>>({
  title,
  items = [],
  onChange,
  createItem,
  fields,
  getItemTitle,
}: ObjectArrayEditorProps<T>) {
  const handleAdd = () => {
    onChange([...items, createItem()]);
  };

  const handleUpdateField = (index: number, key: string, val: any) => {
    const next = [...items];
    next[index] = { ...next[index], [key]: val };
    onChange(next);
  };

  const handleDelete = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === items.length - 1) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const next = [...items];
    const temp = next[index];
    next[index] = next[targetIndex];
    next[targetIndex] = temp;
    onChange(next);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between border-b border-white/10 pb-2">
        <h4 className="text-xs font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider">
          {title} ({items.length})
        </h4>
        <button
          type="button"
          onClick={handleAdd}
          className="flex items-center gap-1 px-3 py-1 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20 text-xs font-semibold hover:bg-teal-500/20 transition"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>添加新{title}</span>
        </button>
      </div>

      <div className="space-y-3">
        {items.map((item, index) => (
          <div
            key={index}
            className="p-4 rounded-2xl bg-white/30 dark:bg-gray-800/40 border border-white/20 space-y-3 transition hover:border-teal-500/30"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <span className="text-xs font-bold text-teal-600 dark:text-teal-400">
                #{index + 1} {getItemTitle ? getItemTitle(item, index) : `条目 ${index + 1}`}
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={index === 0}
                  onClick={() => handleMove(index, 'up')}
                  className="p-1 text-gray-400 hover:text-gray-700 dark:hover:text-white disabled:opacity-30"
                  title="上移"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  disabled={index === items.length - 1}
                  onClick={() => handleMove(index, 'down')}
                  className="p-1 text-gray-400 hover:text-gray-700 dark:hover:text-white disabled:opacity-30"
                  title="下移"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(index)}
                  className="p-1 text-rose-500 hover:bg-rose-500/10 rounded transition ml-1"
                  title="删除条目"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {fields.map((f) => {
                if (f.type === 'textarea') {
                  return (
                    <div key={f.key} className="col-span-full">
                      <TextAreaInput
                        label={f.label}
                        value={item[f.key] || ''}
                        onChange={(val) => handleUpdateField(index, f.key, val)}
                        placeholder={f.placeholder}
                      />
                    </div>
                  );
                }
                if (f.type === 'string-list') {
                  return (
                    <div key={f.key} className="col-span-full">
                      <StringListEditor
                        label={f.label}
                        value={Array.isArray(item[f.key]) ? item[f.key] : []}
                        onChange={(val) => handleUpdateField(index, f.key, val)}
                        placeholder={f.placeholder}
                      />
                    </div>
                  );
                }
                if (f.type === 'image') {
                  return (
                    <div key={f.key} className="col-span-full">
                      <ImageInput
                        label={f.label}
                        value={item[f.key] || ''}
                        onChange={(val) => handleUpdateField(index, f.key, val)}
                        placeholder={f.placeholder}
                      />
                    </div>
                  );
                }
                return (
                  <TextInput
                    key={f.key}
                    label={f.label}
                    value={item[f.key] || ''}
                    onChange={(val) => handleUpdateField(index, f.key, val)}
                    placeholder={f.placeholder}
                  />
                );
              })}
            </div>
          </div>
        ))}

        {items.length === 0 && (
          <p className="text-xs text-gray-400 italic text-center py-4 border border-dashed border-white/20 rounded-2xl">
            暂无{title}，点击上方新增
          </p>
        )}
      </div>
    </div>
  );
}
