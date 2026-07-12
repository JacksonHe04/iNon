import React, { useState, useRef } from 'react';
import { X, Image as ImageIcon, Upload, Loader2 } from 'lucide-react';

interface ImageInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disableUpload?: boolean;
}

export function ImageInput({ label, value, onChange, placeholder, disableUpload = false }: ImageInputProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', file.name.substring(0, file.name.lastIndexOf('.')) || file.name);
      formData.append('altText', '');
      formData.append('assetType', 'image');
      formData.append('folder', 'misc');

      const response = await fetch('/api/admin/assets/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || '图片上传接口错误');
      }

      const result = await response.json();
      if (result.publicUrl) {
        onChange(result.publicUrl);
      }
    } catch (err: any) {
      console.error('Failed to upload image:', err);
      alert(err.message || '图片上传失败，请重试');
    } finally {
      setIsUploading(false);
    }
  };

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
              className="w-full pl-3.5 pr-20 py-2 rounded-xl border border-gray-200 dark:border-gray-700/60 bg-white/60 dark:bg-gray-800/60 text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition"
            />
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              {value && (
                <button
                  type="button"
                  onClick={() => onChange('')}
                  className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-white rounded-lg transition"
                  title="清空"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
              
              {!disableUpload && (
                <>
                  <button
                    type="button"
                    onClick={handleUploadClick}
                    disabled={isUploading}
                    className="p-1.5 bg-teal-500 hover:bg-teal-600 text-white rounded-lg transition flex items-center gap-1 cursor-pointer disabled:opacity-50"
                    title="选择并上传图片"
                  >
                    {isUploading ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Upload className="w-3 h-3" />
                    )}
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </>
              )}
            </div>
          </div>
          {disableUpload ? (
            <p className="text-[10px] text-gray-400 dark:text-gray-500 leading-normal">
              粘贴外部图片链接以自动加载预览。
            </p>
          ) : (
            <p className="text-[10px] text-gray-400 dark:text-gray-500 leading-normal">
              可粘贴外部链接，或点击右侧 <Upload className="inline w-3 h-3 text-teal-500" /> 上传本地图片并自动填充。
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
export default ImageInput;
