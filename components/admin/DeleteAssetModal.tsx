import React, { useState } from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';
import type { AdminAsset } from '@/lib/content/admin-data';
import Modal from '@/components/Modal';

interface DeleteAssetModalProps {
  asset: AdminAsset | null;
  onClose: () => void;
  onDelete: (id: string) => Promise<void>;
}

export function DeleteAssetModal({ asset, onClose, onDelete }: DeleteAssetModalProps) {
  const [pending, setPending] = useState(false);

  const handleDelete = async () => {
    if (!asset) return;
    setPending(true);
    try {
      await onDelete(asset.id);
      onClose();
    } finally {
      setPending(false);
    }
  };

  return (
    <Modal open={!!asset} onClose={onClose}>
      {asset && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 text-rose-500 border-b border-gray-100 dark:border-gray-700/60">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <h3 className="text-base font-bold">确定要删除该资产吗？</h3>
          </div>

          <div className="space-y-2 text-xs leading-relaxed text-gray-600 dark:text-gray-300">
            <p>
              文件: <span className="font-bold text-gray-900 dark:text-white">{asset.file_name}</span>
            </p>
            <p className="bg-rose-500/5 dark:bg-rose-500/10 border border-rose-500/20 rounded-xl p-3.5 text-rose-600 dark:text-rose-400 font-semibold">
              ⚠️ 若已被其他位置引用，所有引用都将失效。该操作不可逆，将从对象存储中彻底物理移除。
            </p>
          </div>

          <div className="flex justify-end gap-2.5 pt-2 border-t border-gray-100 dark:border-gray-700/60 mt-4">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-bold rounded-xl transition"
            >
              取消
            </button>
            <button
              onClick={handleDelete}
              disabled={pending}
              className="flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl transition shadow disabled:opacity-50"
            >
              {pending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
              <span>物理删除</span>
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}
export default DeleteAssetModal;
