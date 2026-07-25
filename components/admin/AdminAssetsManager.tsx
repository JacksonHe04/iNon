'use client';

import { useState } from 'react';
import { Grid, List, X } from 'lucide-react';
import type { AdminAsset } from '@/lib/content/admin-data';
import { readJsonRecord, readJsonString } from '@/lib/http/json-response';
import useAssetUpload from '@/hooks/useAssetUpload';
import UploadZone from './UploadZone';
import AssetCard from './AssetCard';
import AssetTable from './AssetTable';
import EditAssetModal from './EditAssetModal';
import DeleteAssetModal from './DeleteAssetModal';

type AdminAssetsManagerProps = {
  initialAssets: AdminAsset[];
};

export default function AdminAssetsManager({ initialAssets }: AdminAssetsManagerProps) {
  const [assets, setAssets] = useState(initialAssets);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Toast notifications
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Edit Modal State
  const [editAsset, setEditAsset] = useState<AdminAsset | null>(null);

  // Delete Modal State
  const [deleteAssetConfirm, setDeleteAssetConfirm] = useState<AdminAsset | null>(null);

  // Copy Feedback State
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  const handleCopy = (id: string, url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    showToast('链接已成功复制到剪贴板', 'success');
    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  };

  const { isUploading, dragActive, handleDrag, handleDrop, handleFileInput } = useAssetUpload({
    onUploaded: (newAssets) => {
      setAssets((prev) => [...newAssets, ...prev]);
    },
    showToast,
  });

  const handleSaveEdit = async (
    id: string,
    updates: { title: string; alt_text: string; asset_type: string }
  ) => {
    try {
      const response = await fetch('/api/admin/assets', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          ...updates,
        }),
      });

      if (!response.ok) {
        const errData = await readJsonRecord(response);
        throw new Error(readJsonString(errData, 'error') || '更新失败');
      }

      setAssets((prev) =>
        prev.map((a) => (a.id === id ? { ...a, ...updates } : a))
      );
      showToast('修改资产信息成功', 'success');
    } catch (err: any) {
      showToast(err.message || '更新失败', 'error');
      throw err;
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/assets/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errData = await readJsonRecord(response);
        throw new Error(readJsonString(errData, 'error') || '删除失败');
      }

      setAssets((prev) => prev.filter((a) => a.id !== id));
      showToast('资源已成功删除', 'success');
    } catch (err: any) {
      showToast(err.message || '删除失败', 'error');
      throw err;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4">
      {/* Upload area */}
      <UploadZone
        isUploading={isUploading}
        dragActive={dragActive}
        handleDrag={handleDrag}
        handleDrop={handleDrop}
        handleFileInput={handleFileInput}
      />

      {/* Control bar */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider flex items-center gap-2">
          <span>资源列表</span>
          <span className="text-xs text-gray-500 font-mono">({assets.length})</span>
        </h3>

        {/* View mode toggle */}
        <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800/80 p-0.5 rounded-xl border border-gray-200/50 dark:border-gray-700/60">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded-lg transition-all ${
              viewMode === 'grid'
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
            }`}
            title="网格视图"
          >
            <Grid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`p-1.5 rounded-lg transition-all ${
              viewMode === 'table'
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
            }`}
            title="表格视图"
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Empty State */}
      {assets.length === 0 && (
        <div className="py-16 text-center border border-dashed border-gray-200 dark:border-gray-700/60 rounded-3xl bg-white/20 dark:bg-gray-900/10">
          <p className="text-sm text-gray-500">暂无资源。拖拽图片到上方上传区，快速拥有图床公开直链！</p>
        </div>
      )}

      {/* Grid view */}
      {viewMode === 'grid' && assets.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {assets.map((asset) => (
            <AssetCard
              key={asset.id}
              asset={asset}
              copiedId={copiedId}
              handleCopy={handleCopy}
              openEditModal={setEditAsset}
              setDeleteAssetConfirm={setDeleteAssetConfirm}
            />
          ))}
        </div>
      )}

      {/* Table view */}
      {viewMode === 'table' && assets.length > 0 && (
        <AssetTable
          assets={assets}
          copiedId={copiedId}
          handleCopy={handleCopy}
          openEditModal={setEditAsset}
          setDeleteAssetConfirm={setDeleteAssetConfirm}
        />
      )}

      {/* Edit Modal */}
      <EditAssetModal
        asset={editAsset}
        onClose={() => setEditAsset(null)}
        onSave={handleSaveEdit}
      />

      {/* Delete Confirmation Modal */}
      <DeleteAssetModal
        asset={deleteAssetConfirm}
        onClose={() => setDeleteAssetConfirm(null)}
        onDelete={handleDelete}
      />

      {/* Floating Toast Notification */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 max-w-md px-4 py-3 rounded-2xl border shadow-xl backdrop-blur-md transition-all duration-300 ${
          toast.type === 'success'
            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400 shadow-emerald-500/5'
            : 'bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400 shadow-rose-500/5'
        }`}>
          <div className="text-xs font-semibold whitespace-pre-line leading-relaxed">{toast.message}</div>
          <button
            onClick={() => setToast(null)}
            className="ml-2 p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
