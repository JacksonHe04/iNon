import React from 'react';
import { UploadCloud, Loader2 } from 'lucide-react';

interface UploadZoneProps {
  isUploading: boolean;
  dragActive: boolean;
  handleDrag: (e: React.DragEvent) => void;
  handleDrop: (e: React.DragEvent) => void;
  handleFileInput: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function UploadZone({
  isUploading,
  dragActive,
  handleDrag,
  handleDrop,
  handleFileInput,
}: UploadZoneProps) {
  return (
    <div
      onDragEnter={handleDrag}
      onDragOver={handleDrag}
      onDragLeave={handleDrag}
      onDrop={handleDrop}
      className={`archive-upload-zone relative border-2 border-dashed rounded-3xl p-8 flex flex-col items-center justify-center text-center transition-all duration-300 backdrop-blur-md bg-white/40 dark:bg-gray-900/30 ${
        dragActive
          ? 'border-emerald-500 bg-emerald-500/5 scale-[0.99]'
          : 'border-gray-300 dark:border-gray-700/60 hover:border-gray-400 dark:hover:border-gray-500'
      }`}
    >
      <input
        id="file-upload-input"
        type="file"
        multiple
        className="hidden"
        onChange={handleFileInput}
        disabled={isUploading}
      />
      <div className="p-4 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mb-4">
        {isUploading ? (
          <Loader2 className="w-8 h-8 animate-spin" />
        ) : (
          <UploadCloud className="w-8 h-8" />
        )}
      </div>
      <div className="space-y-1">
        <p className="text-sm font-semibold text-gray-900 dark:text-white">
          {isUploading ? '正在上传资源...' : '拖拽图片至此处，或点击上传'}
        </p>
        <p className="text-xs text-gray-500">
          支持点击多选，最多 4 张图片并发上传，上传完成后可获取公开直链。
        </p>
      </div>
      {!isUploading && (
        <label
          htmlFor="file-upload-input"
          className="mt-4 px-4 py-2 bg-gray-900 dark:bg-gray-100 hover:bg-gray-800 dark:hover:bg-white text-white dark:text-gray-900 text-xs font-bold rounded-full cursor-pointer shadow transition"
        >
          选择文件
        </label>
      )}
    </div>
  );
}
export default UploadZone;
