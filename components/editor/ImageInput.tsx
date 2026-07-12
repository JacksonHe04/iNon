import React from 'react';
import { X, Image as ImageIcon } from 'lucide-react';

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
