import React, { useState } from 'react';
import { Link as LinkIcon, Plus, Trash2, Home } from 'lucide-react';

interface SlugSettingsManagerProps {
  slugs: string[];
  onAddSlug: (slug: string) => void;
  onRemoveSlug: (slug: string) => void;
  onAddRootSlug: () => void;
  onError: (msg: string) => void;
}

export function SlugSettingsManager({
  slugs,
  onAddSlug,
  onRemoveSlug,
  onAddRootSlug,
  onError,
}: SlugSettingsManagerProps) {
  const [newSlugInput, setNewSlugInput] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const val = newSlugInput.trim();
    const lower = val.toLowerCase();

    if (slugs.some((s) => s.toLowerCase() === lower)) {
      onError(`Slug "${val || '/'}" 已经存在于你的列表中`);
      return;
    }

    onAddSlug(val);
    setNewSlugInput('');
  };

  return (
    <div className="space-y-3 pt-3 border-t border-white/20">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
          路径 Slug 列表 (Path Slugs)
        </label>
        <span className="text-[11px] text-gray-500 font-mono">
          单个用户可绑定多个 Slug，支持空 Slug (代表 <code className="text-teal-600">/</code> 或 <code className="text-teal-600">/i/</code>)
        </span>
      </div>

      {/* Existing Slugs List */}
      <div className="flex flex-wrap gap-2">
        {slugs.map((s, idx) => {
          const isRoot = s === '';
          return (
            <div
              key={idx}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-mono transition shadow-sm ${
                isRoot
                  ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30'
                  : 'bg-teal-500/10 text-teal-700 dark:text-teal-300 border-teal-500/30'
              }`}
            >
              {isRoot ? (
                <div className="flex items-center gap-1">
                  <Home className="w-3.5 h-3.5 text-amber-500" />
                  <span className="font-bold">/ (根路径空 Slug)</span>
                </div>
              ) : (
                <div className="flex items-center gap-1">
                  <LinkIcon className="w-3.5 h-3.5 text-teal-500" />
                  <span>/{s}</span>
                </div>
              )}
              <button
                type="button"
                onClick={() => onRemoveSlug(s)}
                className="p-0.5 rounded hover:bg-rose-500/20 text-rose-500 transition"
                title="移除 Slug"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
        {slugs.length === 0 && (
          <span className="text-xs text-gray-400 italic">暂未绑定额外 Slug</span>
        )}
      </div>

      {/* Add Slug Inline Form */}
      <div className="flex flex-col sm:flex-row gap-2 pt-2">
        <input
          type="text"
          value={newSlugInput}
          onChange={(e) => setNewSlugInput(e.target.value)}
          placeholder="输入新 Slug (例如: jackson-he)"
          className="flex-1 px-3.5 py-1.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white/50 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
        <button
          type="button"
          onClick={handleAdd}
          className="flex items-center justify-center gap-1 px-4 py-1.5 rounded-xl bg-teal-500 text-white text-xs font-semibold hover:bg-teal-600 transition shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>添加 Slug</span>
        </button>
        {!slugs.includes('') && (
          <button
            type="button"
            onClick={onAddRootSlug}
            className="flex items-center justify-center gap-1 px-3.5 py-1.5 rounded-xl bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 text-xs font-semibold hover:bg-amber-500/30 transition shadow-sm"
          >
            <Home className="w-3.5 h-3.5" />
            <span>绑定根路径 (/)</span>
          </button>
        )}
      </div>
    </div>
  );
}
export default SlugSettingsManager;
