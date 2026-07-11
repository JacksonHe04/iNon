'use client';

import React from 'react';
import { Plus, Trash2, ArrowUp, ArrowDown, X, Image as ImageIcon } from 'lucide-react';

interface TextInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
}

export function TextInput({ label, value, onChange, placeholder, required }: TextInputProps) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
        {label} {required && <span className="text-rose-500">*</span>}
      </label>
      <input
        type="text"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3.5 py-2 rounded-xl border border-gray-200 dark:border-gray-700/60 bg-white/60 dark:bg-gray-800/60 text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition"
      />
    </div>
  );
}

interface TextAreaInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
}

export function TextAreaInput({ label, value, onChange, placeholder, rows = 3 }: TextAreaInputProps) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">{label}</label>
      <textarea
        rows={rows}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3.5 py-2 rounded-xl border border-gray-200 dark:border-gray-700/60 bg-white/60 dark:bg-gray-800/60 text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition resize-y"
      />
    </div>
  );
}

interface StringListEditorProps {
  label: string;
  value: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
}

export function StringListEditor({ label, value = [], onChange, placeholder }: StringListEditorProps) {
  const handleAdd = () => {
    onChange([...value, '']);
  };

  const handleUpdate = (index: number, val: string) => {
    const next = [...value];
    next[index] = val;
    onChange(next);
  };

  const handleDelete = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">{label}</label>
        <button
          type="button"
          onClick={handleAdd}
          className="flex items-center gap-1 text-[11px] font-medium text-teal-600 dark:text-teal-400 hover:underline"
        >
          <Plus className="w-3 h-3" />
          <span>添加项</span>
        </button>
      </div>

      <div className="space-y-2">
        {value.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <input
              type="text"
              value={item}
              onChange={(e) => handleUpdate(index, e.target.value)}
              placeholder={placeholder || `条目 ${index + 1}`}
              className="flex-1 px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700/60 bg-white/60 dark:bg-gray-800/60 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/50"
            />
            <button
              type="button"
              onClick={() => handleDelete(index)}
              className="p-1.5 text-rose-500 hover:bg-rose-500/10 rounded-lg transition"
              title="删除此项"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
        {value.length === 0 && (
          <p className="text-[11px] text-gray-400 italic">暂无数据，点击上方添加</p>
        )}
      </div>
    </div>
  );
}

interface ImageInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function ImageInput({ label, value, onChange, placeholder }: ImageInputProps) {
  return (
    <div className="space-y-2 col-span-full">
      <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
        {label}
      </label>
      <div className="flex gap-4 items-start">
        {/* Preview block */}
        <div className="w-24 h-24 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700/60 bg-gray-100 dark:bg-gray-800/60 flex items-center justify-center flex-shrink-0 relative shadow-inner">
          {value ? (
            <img
              src={value}
              alt="Preview"
              className="w-full h-full object-cover"
              onError={(e) => {
                const img = e.currentTarget;
                img.style.display = 'none';
                const fallback = img.parentElement?.querySelector('.fallback-preview') as HTMLElement;
                if (fallback) {
                  fallback.style.display = 'flex';
                }
              }}
              onLoad={(e) => {
                const img = e.currentTarget;
                img.style.display = 'block';
                const fallback = img.parentElement?.querySelector('.fallback-preview') as HTMLElement;
                if (fallback) {
                  fallback.style.display = 'none';
                }
              }}
            />
          ) : null}
          <div
            className="fallback-preview flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 gap-1 p-2 text-center"
            style={{ display: value ? 'none' : 'flex' }}
          >
            <ImageIcon className="w-5 h-5 opacity-60" />
            <span className="text-[10px]">暂无预览</span>
          </div>
        </div>

        {/* Input block */}
        <div className="flex-1 space-y-2">
          <div className="relative">
            <input
              type="text"
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder || '粘贴图片链接...'}
              className="w-full pl-3.5 pr-10 py-2 rounded-xl border border-gray-200 dark:border-gray-700/60 bg-white/60 dark:bg-gray-800/60 text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition"
            />
            {value && (
              <button
                type="button"
                onClick={() => onChange('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-white rounded-lg transition"
                title="清空"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <p className="text-[10px] text-gray-400 dark:text-gray-500 leading-normal">
            可粘贴外部链接，或在后台“图床管理”上传后复制 URL 填入此处。
          </p>
        </div>
      </div>
    </div>
  );
}

export type FieldConfig = {
  key: string;
  label: string;
  type?: 'text' | 'textarea' | 'string-list' | 'image';
  placeholder?: string;
};

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
