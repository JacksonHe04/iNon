'use client';

import { useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import type { ReadmeData } from '@/types';
import { DeskSurface } from './DeskSurface';
import DeviceMesh from './DeviceMesh';
import type { DeviceMeta } from './DeviceMesh';

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
  const deviceMetas = useMemo<DeviceMeta[]>(() => {
    const laptopProduct = recommendedProducts[0] ?? favoriteProducts[0];
    const phoneProduct = favoriteProducts[0];
    const tabletProduct = recommendedProducts[1] ?? favoriteProducts[1];

    return [
      {
        id: 'laptop',
        type: 'laptop',
        position: [0, 0.2, 0.2],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        detail: {
          title: laptopProduct?.name || hardware.computer || 'MacBook Pro',
          description:
            laptopProduct?.intro ||
            '主力开发电脑，也是核心创意与代码产出的工作台。',
          tags: laptopProduct?.tags,
          link: laptopProduct?.link,
        },
      },
      {
        id: 'phone',
        type: 'phone',
        position: [-2.1, 0.05, 1.1],
        rotation: [0, Math.PI / 10, 0],
        scale: [0.85, 0.85, 0.85],
        detail: {
          title: phoneProduct?.name || hardware.phone || '随身备忘录',
          description: phoneProduct?.intro || '右手边的灵感记录仪，收集零碎的思想与日常记录。',
          tags: phoneProduct?.tags,
          link: phoneProduct?.link,
        },
      },
      {
        id: 'tablet',
        type: 'tablet',
        position: [2.1, 0.05, 1.1],
        rotation: [0, -Math.PI / 10, 0],
        scale: [0.95, 0.95, 0.95],
        detail: {
          title: tabletProduct?.name || hardware.tablet || '绘图手写板',
          description: tabletProduct?.intro || '思维导图、手写笔记与阅读文献的最佳伴侣。',
          tags: tabletProduct?.tags,
          link: tabletProduct?.link,
        },
      },
    ];
  }, [favoriteProducts, recommendedProducts, hardware]);

  return (
    <div className="relative mt-8 w-full overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-slate-950/80 via-slate-900/40 to-slate-950/80 backdrop-blur-md shadow-2xl p-6 text-white">
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-teal-400 font-bold">硬件与产品体验</p>
          <h3 className="text-2xl font-bold mt-1">三维交互创作桌面</h3>
          <p className="text-xs text-gray-400 mt-1">鼠标左键拖拽旋转视角，点击设备查看对应的硬件灵感与详情。</p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs font-mono text-teal-400 bg-white/5 border border-white/10 px-3 py-2 rounded-2xl">
          <span className="opacity-75">{hardware.computer || 'MacBook'}</span>
          <span className="opacity-40">|</span>
          <span className="opacity-75">{hardware.phone || 'iPhone'}</span>
          <span className="opacity-40">|</span>
          <span className="opacity-75">{hardware.tablet || 'iPad'}</span>
        </div>
      </div>

      {/* Styled 3D Frame container */}
      <div className="relative mt-6 h-[380px] rounded-2xl overflow-hidden border border-white/10 bg-black/40 shadow-inner">
        <Canvas camera={{ position: [0, 4.5, 6], fov: 40 }}>
          <ambientLight intensity={0.6} />
          <directionalLight position={[3, 8, 4]} intensity={1.5} color="#ffffff" />
          <pointLight position={[-4, 4, -4]} intensity={1.2} color="#00f0ff" />
          <pointLight position={[4, 4, 4]} intensity={1.2} color="#ff007f" />
          
          <DeskSurface />
          
          {deviceMetas.map((device) => (
            <DeviceMesh
              key={device.id}
              device={device}
              active={activeTitle === device.detail.title}
              onSelect={onSelect}
            />
          ))}
          
          {/* Allow constrained rotation for custom viewing experience */}
          <OrbitControls 
            enablePan={false} 
            enableZoom={false} 
            enableRotate={true}
            maxPolarAngle={Math.PI / 2.2}
            minPolarAngle={Math.PI / 4}
            maxAzimuthAngle={Math.PI / 6}
            minAzimuthAngle={-Math.PI / 6}
          />
        </Canvas>
      </div>
    </div>
  );
}
