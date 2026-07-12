import React, { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import type { AdminAsset } from '@/lib/content/admin-data';
import Modal from '@/components/Modal';

interface EditAssetModalProps {
  asset: AdminAsset | null;
  onClose: () => void;
  onSave: (id: string, updates: { title: string; alt_text: string; asset_type: string }) => Promise<void>;
}

export function EditAssetModal({ asset, onClose, onSave }: EditAssetModalProps) {
  const [title, setTitle] = useState('');
  const [altText, setAltText] = useState('');
  const [assetType, setAssetType] = useState('');
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (asset) {
      setTitle(asset.title || '');
      setAltText(asset.alt_text || '');
      setAssetType(asset.asset_type || 'misc');
    }
  }, [asset]);

  const handleSave = async () => {
    if (!asset) return;
    setPending(true);
    try {
      await onSave(asset.id, {
        title,
        alt_text: altText,
        asset_type: assetType,
      });
      onClose();
    } finally {
      setPending(false);
    }
  };

  return (
    <Modal open={!!asset} onClose={onClose}>
      {asset && (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700/60 pb-3">
            <h3 className="text-base font-bold text-gray-900 dark:text-white">编辑资产属性</h3>
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-white transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3.5 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-gray-700 dark:text-gray-300">标题</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/60 dark:bg-gray-800/60 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                placeholder="文件名或自定义标题..."
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-gray-700 dark:text-gray-300">Alt 文本（图像无障碍说明）</label>
              <input
                type="text"
                value={altText}
                onChange={(e) => setAltText(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/60 dark:bg-gray-800/60 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                placeholder="用于屏幕阅读器的图片替代描述..."
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-gray-700 dark:text-gray-300">资产类别 (Asset Type)</label>
              <input
                type="text"
                value={assetType}
                onChange={(e) => setAssetType(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/60 dark:bg-gray-800/60 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                placeholder="e.g. image, document, audio, video..."
              />
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-4 border-t border-gray-100 dark:border-gray-700/60 mt-4">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-bold rounded-xl transition"
            >
              取消
            </button>
            <button
              onClick={handleSave}
              disabled={pending}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition shadow disabled:opacity-50"
            >
              {pending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
              <span>保存修改</span>
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}
export default EditAssetModal;
