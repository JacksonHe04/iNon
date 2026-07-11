'use client';

import { useState, useEffect } from 'react';
import {
  UploadCloud,
  Grid,
  List,
  Copy,
  Check,
  Edit2,
  Trash2,
  X,
  AlertTriangle,
  ExternalLink,
  Loader2
} from 'lucide-react';
import type { AdminAsset } from '@/lib/content/admin-data';
import Modal from '@/components/Modal';

type AdminAssetsManagerProps = {
  initialAssets: AdminAsset[];
};

function formatBytes(bytes: number | null | undefined): string {
  if (bytes === null || bytes === undefined) return '未知大小';
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function formatDate(dateString: string): string {
  try {
    const d = new Date(dateString);
    return d.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '未知时间';
  }
}

export default function AdminAssetsManager({ initialAssets }: AdminAssetsManagerProps) {
  const [assets, setAssets] = useState(initialAssets);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  // Toast notifications
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Edit Modal State
  const [editAsset, setEditAsset] = useState<AdminAsset | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editAltText, setEditAltText] = useState('');
  const [editAssetType, setEditAssetType] = useState('');
  const [editPending, setEditPending] = useState(false);

  // Delete Modal State
  const [deleteAssetConfirm, setDeleteAssetConfirm] = useState<AdminAsset | null>(null);
  const [deletePending, setDeletePending] = useState(false);

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

  // Drag and drop event handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFilesSelected(e.dataTransfer.files);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFilesSelected(e.target.files);
    }
  };

  // Concurrency controlled file uploader (Max 4 parallel uploads)
  const handleFilesSelected = async (fileList: FileList) => {
    const filesArray = Array.from(fileList);
    if (filesArray.length === 0) return;

    setIsUploading(true);
    let successCount = 0;
    const failedFiles: string[] = [];
    const uploadedAssets: AdminAsset[] = [];

    const queue = [...filesArray];

    const uploadSingleFile = async (file: File) => {
      try {
        const formData = new FormData();
        formData.append('file', file);

        const defaultTitle = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
        const defaultAssetType = file.type.startsWith('image/') ? 'image' : 'misc';

        formData.append('title', defaultTitle);
        formData.append('altText', '');
        formData.append('assetType', defaultAssetType);
        formData.append('folder', 'misc');

        const response = await fetch('/api/admin/assets/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.error || '上传请求失败');
        }

        const result = await response.json();
        successCount++;

        const newAsset: AdminAsset = {
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          bucket: 'public-assets',
          object_path: result.objectPath || '',
          asset_type: defaultAssetType,
          title: defaultTitle,
          alt_text: '',
          file_name: file.name,
          public_url: result.publicUrl || '',
          source_path: '',
          file_size_bytes: file.size,
          created_at: new Date().toISOString(),
        };
        uploadedAssets.push(newAsset);
      } catch (err: any) {
        console.error(err);
        failedFiles.push(`${file.name} (${err.message || '未知错误'})`);
      }
    };

    const worker = async () => {
      while (queue.length > 0) {
        const file = queue.shift();
        if (file) {
          await uploadSingleFile(file);
        }
      }
    };

    // Spawn 4 concurrent upload workers
    const workers = Array.from({ length: Math.min(4, filesArray.length) }, () => worker());
    await Promise.all(workers);

    // Refresh display
    if (uploadedAssets.length > 0) {
      setAssets((prev) => [...uploadedAssets, ...prev]);
    }

    setIsUploading(false);

    if (failedFiles.length === 0) {
      showToast(`成功上传了 ${successCount} 个文件`, 'success');
    } else {
      showToast(
        `${successCount} 个文件上传成功，${failedFiles.length} 个失败。\n失败原因: ${failedFiles.join(', ')}`,
        'error'
      );
    }
  };

  // Inline editing handler
  const openEditModal = (asset: AdminAsset) => {
    setEditAsset(asset);
    setEditTitle(asset.title || '');
    setEditAltText(asset.alt_text || '');
    setEditAssetType(asset.asset_type || 'misc');
  };

  const handleSaveEdit = async () => {
    if (!editAsset) return;
    setEditPending(true);
    try {
      const response = await fetch('/api/admin/assets', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editAsset.id,
          title: editTitle,
          alt_text: editAltText,
          asset_type: editAssetType,
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || '更新失败');
      }

      setAssets((prev) =>
        prev.map((a) =>
          a.id === editAsset.id
            ? { ...a, title: editTitle, alt_text: editAltText, asset_type: editAssetType }
            : a
        )
      );
      setEditAsset(null);
      showToast('修改资产信息成功', 'success');
    } catch (err: any) {
      showToast(err.message || '更新失败', 'error');
    } finally {
      setEditPending(false);
    }
  };

  // Delete handler
  const handleConfirmDelete = async () => {
    if (!deleteAssetConfirm) return;
    setDeletePending(true);
    try {
      const response = await fetch(`/api/admin/assets/${deleteAssetConfirm.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || '删除失败');
      }

      setAssets((prev) => prev.filter((a) => a.id !== deleteAssetConfirm.id));
      setDeleteAssetConfirm(null);
      showToast('资源已成功删除', 'success');
    } catch (err: any) {
      showToast(err.message || '删除失败', 'error');
    } finally {
      setDeletePending(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4">
      {/* Upload area */}
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-3xl p-8 flex flex-col items-center justify-center text-center transition-all duration-300 backdrop-blur-md bg-white/40 dark:bg-gray-900/30 ${
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
            <div
              key={asset.id}
              className="group relative border border-white/20 dark:border-gray-700/40 bg-white/40 dark:bg-gray-800/40 backdrop-blur rounded-2xl p-3 shadow hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="aspect-square rounded-xl bg-gray-100 dark:bg-gray-950 overflow-hidden flex items-center justify-center relative shadow-inner">
                  {asset.asset_type === 'image' || asset.public_url.match(/\.(jpeg|jpg|gif|png|webp|svg)/i) ? (
                    <img
                      src={asset.public_url}
                      alt={asset.alt_text || asset.title}
                      loading="lazy"
                      className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                        const sib = (e.target as HTMLImageElement).nextElementSibling;
                        if (sib) (sib as HTMLElement).style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div
                    className="flex flex-col items-center justify-center text-gray-400 p-2 text-center"
                    style={{
                      display:
                        asset.asset_type === 'image' ||
                        asset.public_url.match(/\.(jpeg|jpg|gif|png|webp|svg)/i)
                          ? 'none'
                          : 'flex',
                    }}
                  >
                    <span className="text-[10px] font-bold uppercase border border-gray-300 px-2 py-0.5 rounded">
                      {asset.file_name.split('.').pop() || 'File'}
                    </span>
                  </div>

                  {/* Asset Type Badge */}
                  <span className="absolute top-2 left-2 bg-black/65 px-2 py-0.5 rounded-full text-[9px] text-white backdrop-blur font-mono">
                    {asset.asset_type}
                  </span>
                </div>

                <div className="mt-2 space-y-1">
                  <p
                    className="text-[11px] font-bold text-gray-800 dark:text-white truncate"
                    title={asset.file_name}
                  >
                    {asset.file_name}
                  </p>
                  <p className="text-[10px] text-gray-500 truncate" title={asset.title}>
                    {asset.title || <span className="italic text-gray-400">无标题</span>}
                  </p>
                  <p className="text-[9px] text-gray-400 font-medium">
                    {formatDate(asset.created_at)}
                  </p>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-1.5 mt-3 pt-2 border-t border-gray-100 dark:border-gray-700/40">
                <button
                  onClick={() => handleCopy(asset.id, asset.public_url)}
                  className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-[10px] font-semibold transition ${
                    copiedId === asset.id
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                      : 'bg-gray-100 dark:bg-gray-700/60 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 border border-transparent'
                  }`}
                  title="复制直链"
                >
                  {copiedId === asset.id ? (
                    <>
                      <Check className="w-3 h-3" />
                      <span>已复制</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>复制</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => openEditModal(asset)}
                  className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition"
                  title="编辑"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setDeleteAssetConfirm(asset)}
                  className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/20 text-rose-500 transition"
                  title="删除"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Table view */}
      {viewMode === 'table' && assets.length > 0 && (
        <div className="overflow-x-auto rounded-2xl border border-white/20 dark:border-gray-700/40 bg-white/40 dark:bg-gray-800/40 shadow">
          <table className="min-w-full divide-y divide-gray-200/50 dark:divide-gray-700/50 text-left text-xs">
            <thead className="bg-gray-50/50 dark:bg-gray-800/60 font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-4 py-3">预览</th>
                <th className="px-4 py-3">文件名 / 时间</th>
                <th className="px-4 py-3">标题</th>
                <th className="px-4 py-3">类型</th>
                <th className="px-4 py-3">大小</th>
                <th className="px-4 py-3 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100/50 dark:divide-gray-800/40 text-gray-800 dark:text-gray-200">
              {assets.map((asset) => (
                <tr
                  key={asset.id}
                  className="hover:bg-white/30 dark:hover:bg-gray-800/20 transition-all"
                >
                  <td className="px-4 py-2.5">
                    <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-950 overflow-hidden flex items-center justify-center border border-gray-200/60 dark:border-gray-700/40">
                      {asset.asset_type === 'image' || asset.public_url.match(/\.(jpeg|jpg|gif|png|webp|svg)/i) ? (
                        <img
                          src={asset.public_url}
                          alt=""
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                            const sib = (e.target as HTMLImageElement).nextElementSibling;
                            if (sib) (sib as HTMLElement).style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div
                        className="flex items-center justify-center text-gray-400 font-bold uppercase text-[9px] scale-90"
                        style={{
                          display:
                            asset.asset_type === 'image' ||
                            asset.public_url.match(/\.(jpeg|jpg|gif|png|webp|svg)/i)
                              ? 'none'
                              : 'flex',
                        }}
                      >
                        {asset.file_name.split('.').pop() || 'File'}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="font-semibold truncate max-w-[200px]" title={asset.file_name}>
                      {asset.file_name}
                    </div>
                    <div className="text-[10px] text-gray-400">{formatDate(asset.created_at)}</div>
                  </td>
                  <td className="px-4 py-2.5 truncate max-w-[150px]" title={asset.title}>
                    {asset.title || <span className="italic text-gray-400">无标题</span>}
                  </td>
                  <td className="px-4 py-2.5">
                    <span className="bg-gray-100 dark:bg-gray-700 border border-gray-200/60 dark:border-gray-600/40 px-2 py-0.5 rounded text-[10px] font-mono">
                      {asset.asset_type}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-gray-500 font-mono">
                    {formatBytes(asset.file_size_bytes)}
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleCopy(asset.id, asset.public_url)}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[10px] font-semibold transition ${
                          copiedId === asset.id
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                            : 'bg-transparent border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        {copiedId === asset.id ? (
                          <>
                            <Check className="w-3 h-3" />
                            <span>已复制</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>复制链接</span>
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => openEditModal(asset)}
                        className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 hover:text-gray-800 dark:hover:text-white transition"
                        title="编辑"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteAssetConfirm(asset)}
                        className="p-1 rounded hover:bg-rose-50 dark:hover:bg-rose-950/20 text-rose-500 transition"
                        title="删除"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit Modal */}
      <Modal open={!!editAsset} onClose={() => setEditAsset(null)}>
        {editAsset && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700/60 pb-3">
              <h3 className="text-base font-bold text-gray-900 dark:text-white">编辑资产属性</h3>
              <button
                onClick={() => setEditAsset(null)}
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
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/60 dark:bg-gray-800/60 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  placeholder="文件名或自定义标题..."
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-gray-700 dark:text-gray-300">Alt 文本（图像无障碍说明）</label>
                <input
                  type="text"
                  value={editAltText}
                  onChange={(e) => setEditAltText(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/60 dark:bg-gray-800/60 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  placeholder="用于屏幕阅读器的图片替代描述..."
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-gray-700 dark:text-gray-300">资产类别 (Asset Type)</label>
                <input
                  type="text"
                  value={editAssetType}
                  onChange={(e) => setEditAssetType(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/60 dark:bg-gray-800/60 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  placeholder="e.g. image, document, audio, video..."
                />
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-4 border-t border-gray-100 dark:border-gray-700/60 mt-4">
              <button
                onClick={() => setEditAsset(null)}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-bold rounded-xl transition"
              >
                取消
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={editPending}
                className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition shadow disabled:opacity-50"
              >
                {editPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                <span>保存修改</span>
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal open={!!deleteAssetConfirm} onClose={() => setDeleteAssetConfirm(null)}>
        {deleteAssetConfirm && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 text-rose-500 border-b border-gray-100 dark:border-gray-700/60">
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              <h3 className="text-base font-bold">确定要删除该资产吗？</h3>
            </div>

            <div className="space-y-2 text-xs leading-relaxed text-gray-600 dark:text-gray-300">
              <p>
                文件: <span className="font-bold text-gray-900 dark:text-white">{deleteAssetConfirm.file_name}</span>
              </p>
              <p className="bg-rose-500/5 dark:bg-rose-500/10 border border-rose-500/20 rounded-xl p-3.5 text-rose-600 dark:text-rose-400 font-semibold">
                ⚠️ 若已被其他位置引用，所有引用都将失效。该操作不可逆，将从对象存储中彻底物理移除。
              </p>
            </div>

            <div className="flex justify-end gap-2.5 pt-2 border-t border-gray-100 dark:border-gray-700/60 mt-4">
              <button
                onClick={() => setDeleteAssetConfirm(null)}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-bold rounded-xl transition"
              >
                取消
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={deletePending}
                className="flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl transition shadow disabled:opacity-50"
              >
                {deletePending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                <span>物理删除</span>
              </button>
            </div>
          </div>
        )}
      </Modal>

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
