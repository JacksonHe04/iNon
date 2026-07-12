import React from 'react';
import { Plus, Trash2 } from 'lucide-react';

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
