import React from 'react';
import { Copy, Check, Edit2, Trash2 } from 'lucide-react';
import type { AdminAsset } from '@/lib/content/admin-data';

interface AssetTableProps {
  assets: AdminAsset[];
  copiedId: string | null;
  handleCopy: (id: string, url: string) => void;
  openEditModal: (asset: AdminAsset) => void;
  setDeleteAssetConfirm: (asset: AdminAsset) => void;
}

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

export function AssetTable({
  assets,
  copiedId,
  handleCopy,
  openEditModal,
  setDeleteAssetConfirm,
}: AssetTableProps) {
  return (
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
  );
}
export default AssetTable;
