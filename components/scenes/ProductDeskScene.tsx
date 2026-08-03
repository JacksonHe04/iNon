'use client';

import { Laptop, Smartphone, Tablet } from 'lucide-react';
import type { ReadmeData } from '@/types';

interface ProductDeskSceneProps {
  favoriteProducts: ReadmeData['products']['favorite_products'];
  recommendedProducts: ReadmeData['products']['recommended_products'];
  hardware: ReadmeData['products']['my_hardware'];
  onSelect: (detail: {
    title: string;
    description: string;
    tags?: string[];
    link?: string;
  }) => void;
  activeTitle?: string | null;
}

export default function ProductDeskScene({
  favoriteProducts,
  recommendedProducts,
  hardware,
  onSelect,
  activeTitle,
}: ProductDeskSceneProps) {
  const laptopProduct = recommendedProducts[0] ?? favoriteProducts[0];
  const phoneProduct = favoriteProducts[0];
  const tabletProduct = recommendedProducts[1] ?? favoriteProducts[1];
  const artifacts = [
    {
      id: 'computer',
      code: 'WORKSTATION / 01',
      icon: Laptop,
      title: laptopProduct?.name || hardware.computer || '主力电脑',
      description: laptopProduct?.intro || '核心创作与代码产出的工作台。',
      tags: laptopProduct?.tags,
      link: laptopProduct?.link,
    },
    {
      id: 'phone',
      code: 'POCKET LOG / 02',
      icon: Smartphone,
      title: phoneProduct?.name || hardware.phone || '随身设备',
      description: phoneProduct?.intro || '记录零散灵感与日常观察。',
      tags: phoneProduct?.tags,
      link: phoneProduct?.link,
    },
    {
      id: 'tablet',
      code: 'READING SLATE / 03',
      icon: Tablet,
      title: tabletProduct?.name || hardware.tablet || '阅读平板',
      description: tabletProduct?.intro || '用于阅读、手写与梳理思路。',
      tags: tabletProduct?.tags,
      link: tabletProduct?.link,
    },
  ];

  return (
    <section className="archive-product-table" aria-label="产品与硬件工作台">
      <header>
        <div>
          <span>FIELD EQUIPMENT REGISTER</span>
          <h4>使用中的器物</h4>
        </div>
        <p>点击一件器物，翻阅它对应的产品记录。</p>
      </header>

      <div className="archive-product-table__surface">
        {artifacts.map((artifact, index) => {
          const Icon = artifact.icon;
          const active = artifact.title === activeTitle;
          return (
            <button
              key={artifact.id}
              type="button"
              className={active ? 'is-active' : undefined}
              aria-pressed={active}
              onClick={() => onSelect(artifact)}
            >
              <span className="archive-product-table__index">{artifact.code}</span>
              <Icon aria-hidden="true" />
              <strong>{artifact.title}</strong>
              <small>{artifact.description}</small>
              <em>查看记录 →</em>
              <i>{String(index + 1).padStart(2, '0')}</i>
            </button>
          );
        })}
      </div>
    </section>
  );
}
