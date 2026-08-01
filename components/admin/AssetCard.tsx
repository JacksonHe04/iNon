import React from 'react';
import { Copy, Check, Edit2, Trash2 } from 'lucide-react';
import type { AdminAsset } from '@/lib/content/admin-data';

interface AssetCardProps {
  asset: AdminAsset;
  copiedId: string | null;
  handleCopy: (id: string, url: string) => void;
  openEditModal: (asset: AdminAsset) => void;
  setDeleteAssetConfirm: (asset: AdminAsset) => void;
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

export function AssetCard({
  asset,
  copiedId,
  handleCopy,
  openEditModal,
  setDeleteAssetConfirm,
}: AssetCardProps) {
  return (
    <div
      className="archive-asset-card group relative border border-white/20 dark:border-gray-700/40 bg-white/40 dark:bg-gray-800/40 backdrop-blur rounded-2xl p-3 shadow hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
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
  );
}
export default AssetCard;
