'use client';

import { useState } from 'react';
import GlassCard from '@/components/GlassCard';
import Modal from '@/components/Modal';
import { Monitor, Heart, Star, Laptop, Compass, Eye, EyeOff, ExternalLink } from 'lucide-react';
import ProductDeskScene from '@/components/scenes/ProductDeskScene';

export interface ProductItem {
  name: string;
  link: string;
  intro: string;
  tags: string[];
}

export interface HardwareInfo {
  phone: string;
  computer: string;
  tablet: string;
  smartwatch: string;
  headphones: string[];
}

export interface BrandItem {
  name: string;
  link: string;
  intro: string;
  tags: string[];
}

interface ProductsBlockProps {
  favoriteProducts: ProductItem[];
  recommendedProducts: ProductItem[];
  myHardware: HardwareInfo;
  favoriteBrands: BrandItem[];
  colSpan?: number;
}

type SelectedDetail = {
  title: string;
  description: string;
  tags?: string[];
  link?: string;
};

export default function ProductsBlock({
  favoriteProducts,
  recommendedProducts,
  myHardware,
  favoriteBrands,
  colSpan = 2,
}: ProductsBlockProps) {
  const [selectedProduct, setSelectedProduct] = useState<SelectedDetail | null>(null);
  const [showScene, setShowScene] = useState(true);
  const [activeTab, setActiveTab] = useState<'favorite' | 'recommended' | 'hardware' | 'brands'>(
    'favorite'
  );

  return (
    <GlassCard className="p-5 space-y-5 hover:border-amber-400/40 transition-all duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <Monitor className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-gray-900 dark:text-white">爱用产品与设备</h3>
          </div>
        </div>
        <div className="flex items-center gap-2 self-end sm:self-auto">
          {colSpan === 2 && (
            <button
              onClick={() => setShowScene(!showScene)}
              className="flex items-center gap-1 px-2.5 py-1 text-xs rounded-xl bg-white/40 dark:bg-gray-800/40 border border-white/20 hover:bg-white/60 dark:hover:bg-gray-800/60 text-gray-600 dark:text-gray-300 font-medium transition"
            >
              {showScene ? (
                <>
                  <EyeOff className="w-3.5 h-3.5" />
                  <span>隐藏桌面</span>
                </>
              ) : (
                <>
                  <Eye className="w-3.5 h-3.5" />
                  <span>显示桌面</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {colSpan === 2 && showScene && (
        <div className="relative overflow-hidden rounded-2xl border border-white/20 bg-gradient-to-br from-amber-50/50 to-orange-50/30 dark:from-amber-950/20 dark:to-orange-950/10 p-2">
          <ProductDeskScene
            favoriteProducts={favoriteProducts}
            recommendedProducts={recommendedProducts}
            hardware={myHardware}
            activeTitle={selectedProduct?.title ?? null}
            onSelect={(detail) =>
              setSelectedProduct({
                title: detail.title,
                description: detail.description,
                tags: detail.tags,
                link: detail.link,
              })
            }
          />
          <p className="text-[10px] text-gray-400 text-center mt-2">
            💡 点击 3D 桌面上的硬件或书籍查看产品卡片。
          </p>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-1.5 border-b border-white/10 pb-1 overflow-x-auto whitespace-nowrap scrollbar-none">
        {(
          [
            { id: 'favorite', label: '最爱产品', icon: Heart },
            { id: 'recommended', label: '推荐产品', icon: Star },
            { id: 'hardware', label: '我的硬件', icon: Laptop },
            { id: 'brands', label: '最爱品牌', icon: Compass },
          ] as const
        ).map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
                isActive
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400'
                  : 'bg-transparent border-transparent text-gray-500 hover:text-gray-800 hover:bg-white/20 dark:hover:bg-gray-800/20'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Content based on Active Tab */}
      <div className="space-y-3 min-h-[180px]">
        {activeTab === 'favorite' && (
          <div className={`grid gap-3 ${colSpan === 2 ? 'grid-cols-2' : 'grid-cols-1'}`}>
            {favoriteProducts.map((prod, idx) => (
              <div
                key={idx}
                onClick={() =>
                  setSelectedProduct({
                    title: prod.name,
                    description: prod.intro,
                    tags: prod.tags,
                    link: prod.link,
                  })
                }
                className="p-3.5 rounded-xl bg-white/40 dark:bg-gray-800/40 border border-white/20 hover:border-amber-400/40 transition cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <h4 className="font-bold text-sm text-gray-900 dark:text-white">{prod.name}</h4>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">{prod.intro}</p>
                </div>
                <div className="flex flex-wrap gap-1 mt-3">
                  {prod.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-1.5 py-0.5 rounded bg-amber-500/5 border border-amber-500/10 text-[9px] text-amber-600 dark:text-amber-400 font-mono"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'recommended' && (
          <div className={`grid gap-3 ${colSpan === 2 ? 'grid-cols-2' : 'grid-cols-1'}`}>
            {recommendedProducts.map((prod, idx) => (
              <div
                key={idx}
                onClick={() =>
                  setSelectedProduct({
                    title: prod.name,
                    description: prod.intro,
                    tags: prod.tags,
                    link: prod.link,
                  })
                }
                className="p-3.5 rounded-xl bg-white/40 dark:bg-gray-800/40 border border-white/20 hover:border-amber-400/40 transition cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <h4 className="font-bold text-sm text-gray-900 dark:text-white">{prod.name}</h4>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">{prod.intro}</p>
                </div>
                <div className="flex flex-wrap gap-1 mt-3">
                  {prod.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-1.5 py-0.5 rounded bg-amber-500/5 border border-amber-500/10 text-[9px] text-amber-600 dark:text-amber-400 font-mono"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'hardware' && (
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-white/40 dark:bg-gray-800/40 border border-white/20">
              <span className="text-[10px] text-gray-400 font-mono">📱 PHONE</span>
              <p className="font-bold text-gray-800 dark:text-white mt-0.5">{myHardware.phone}</p>
            </div>
            <div className="p-3 rounded-xl bg-white/40 dark:bg-gray-800/40 border border-white/20">
              <span className="text-[10px] text-gray-400 font-mono">💻 COMPUTER</span>
              <p className="font-bold text-gray-800 dark:text-white mt-0.5">
                {myHardware.computer}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-white/40 dark:bg-gray-800/40 border border-white/20">
              <span className="text-[10px] text-gray-400 font-mono">📟 TABLET</span>
              <p className="font-bold text-gray-800 dark:text-white mt-0.5">{myHardware.tablet}</p>
            </div>
            <div className="p-3 rounded-xl bg-white/40 dark:bg-gray-800/40 border border-white/20">
              <span className="text-[10px] text-gray-400 font-mono">⌚ WATCH</span>
              <p className="font-bold text-gray-800 dark:text-white mt-0.5">
                {myHardware.smartwatch}
              </p>
            </div>
            <div className="col-span-2 p-3 rounded-xl bg-white/40 dark:bg-gray-800/40 border border-white/20">
              <span className="text-[10px] text-gray-400 font-mono">🎧 HEADPHONES</span>
              <p className="font-bold text-gray-800 dark:text-white mt-0.5">
                {myHardware.headphones.join(' 、 ')}
              </p>
            </div>
          </div>
        )}

        {activeTab === 'brands' && (
          <div className={`grid gap-3 ${colSpan === 2 ? 'grid-cols-2' : 'grid-cols-1'}`}>
            {favoriteBrands.map((brand, idx) => (
              <div
                key={idx}
                onClick={() =>
                  setSelectedProduct({
                    title: brand.name,
                    description: brand.intro,
                    tags: brand.tags,
                    link: brand.link,
                  })
                }
                className="p-3.5 rounded-xl bg-white/40 dark:bg-gray-800/40 border border-white/20 hover:border-amber-400/40 transition cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <h4 className="font-bold text-sm text-gray-900 dark:text-white">{brand.name}</h4>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">{brand.intro}</p>
                </div>
                <div className="flex flex-wrap gap-1 mt-3">
                  {brand.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-1.5 py-0.5 rounded bg-amber-500/5 border border-amber-500/10 text-[9px] text-amber-600 dark:text-amber-400 font-mono"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal open={!!selectedProduct} onClose={() => setSelectedProduct(null)}>
        {selectedProduct && (
          <div className="space-y-3.5">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              {selectedProduct.title}
            </h3>
            {selectedProduct.tags && selectedProduct.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {selectedProduct.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-mono"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
            <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-200">
              {selectedProduct.description}
            </p>
            {selectedProduct.link && selectedProduct.link.trim() !== '' && (
              <a
                href={selectedProduct.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm font-semibold text-amber-600 dark:text-amber-400 hover:underline mt-2"
              >
                <span>官方链接</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        )}
      </Modal>
    </GlassCard>
  );
}
