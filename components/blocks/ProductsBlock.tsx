'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import GlassCard from '@/components/GlassCard';
import Modal from '@/components/Modal';
import { Monitor, Heart, Star, Laptop, Compass, Eye, EyeOff, ExternalLink } from 'lucide-react';
import ProductCard from './products/ProductCard';
import HardwareGrid from './products/HardwareGrid';
import useNearViewportActivation from '@/hooks/useNearViewportActivation';

const ProductDeskScene = dynamic(() => import('@/components/scenes/ProductDeskScene'), {
  ssr: false,
  loading: () => <div className="min-h-[280px]" aria-hidden="true" />,
});

export interface ProductItem {
  name: string;
  link: string;
  intro: string;
  tags: string[];
  image_url?: string;
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
  image_url?: string;
}

interface ProductsBlockProps {
  favoriteProducts: ProductItem[];
  recommendedProducts: ProductItem[];
  myHardware: HardwareInfo;
  favoriteBrands: BrandItem[];
  title?: string;
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
  title,
  colSpan = 2,
}: ProductsBlockProps) {
  const [selectedProduct, setSelectedProduct] = useState<SelectedDetail | null>(null);
  const [showScene, setShowScene] = useState(true);
  const [activeTab, setActiveTab] = useState<'favorite' | 'recommended' | 'hardware' | 'brands'>(
    'favorite'
  );
  const contentActivation = useNearViewportActivation();

  return (
    <GlassCard className="p-5 space-y-5 hover:border-amber-400/40 transition-all duration-300">
      <div ref={contentActivation.targetRef} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <Monitor className="w-5 h-5" />
          </div>
          <div>
            {title && <h3 className="font-bold text-base text-gray-900 dark:text-white">{title}</h3>}
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
                  <span>隐藏器物台</span>
                </>
              ) : (
                <>
                  <Eye className="w-3.5 h-3.5" />
                  <span>显示器物台</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {colSpan === 2 && showScene && (
        <div className="archive-embedded-field-panel">
          {contentActivation.active ? <ProductDeskScene
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
          /> : <div className="min-h-[280px]" aria-hidden="true" />}
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
        {contentActivation.active ? <>
        {activeTab === 'favorite' && (
          <div className={`grid gap-3 ${colSpan === 2 ? 'grid-cols-2' : 'grid-cols-1'}`}>
            {favoriteProducts.map((prod, idx) => (
              <ProductCard
                key={idx}
                name={prod.name}
                intro={prod.intro}
                tags={prod.tags}
                image_url={prod.image_url}
                onClick={() =>
                  setSelectedProduct({
                    title: prod.name,
                    description: prod.intro,
                    tags: prod.tags,
                    link: prod.link,
                  })
                }
              />
            ))}
          </div>
        )}

        {activeTab === 'recommended' && (
          <div className={`grid gap-3 ${colSpan === 2 ? 'grid-cols-2' : 'grid-cols-1'}`}>
            {recommendedProducts.map((prod, idx) => (
              <ProductCard
                key={idx}
                name={prod.name}
                intro={prod.intro}
                tags={prod.tags}
                image_url={prod.image_url}
                onClick={() =>
                  setSelectedProduct({
                    title: prod.name,
                    description: prod.intro,
                    tags: prod.tags,
                    link: prod.link,
                  })
                }
              />
            ))}
          </div>
        )}

        {activeTab === 'hardware' && (
          <HardwareGrid myHardware={myHardware} />
        )}

        {activeTab === 'brands' && (
          <div className={`grid gap-3 ${colSpan === 2 ? 'grid-cols-2' : 'grid-cols-1'}`}>
            {favoriteBrands.map((brand, idx) => (
              <ProductCard
                key={idx}
                name={brand.name}
                intro={brand.intro}
                tags={brand.tags}
                image_url={brand.image_url}
                onClick={() =>
                  setSelectedProduct({
                    title: brand.name,
                    description: brand.intro,
                    tags: brand.tags,
                    link: brand.link,
                  })
                }
              />
            ))}
          </div>
        )}
        </> : <div className="min-h-[180px]" aria-hidden="true" />}
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
