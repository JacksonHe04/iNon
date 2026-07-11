'use client';

import { useMemo, useState, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Html, OrbitControls, Float } from '@react-three/drei';
import type { ReadmeData } from '@/types';
import * as THREE from 'three';

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

type DeviceMeta = {
  id: string;
  type: 'laptop' | 'phone' | 'tablet';
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
  detail: {
    title: string;
    description: string;
    tags?: string[];
    link?: string;
  };
};

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

function DeskSurface() {
  return (
    <group position={[0, -0.05, 0]}>
      {/* Sleek metallic frosted desk mat */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[7.8, 4.8]} />
        <meshStandardMaterial 
          color="#1e293b" 
          roughness={0.4} 
          metalness={0.8}
        />
      </mesh>
      
      {/* Neon border strip at the back */}
      <mesh position={[0, 0.01, -2.35]}>
        <boxGeometry args={[7.6, 0.02, 0.06]} />
        <meshBasicMaterial color="#00f0ff" />
      </mesh>
      
      {/* Grid Pattern Floor helper */}
      <gridHelper args={[20, 20, '#00f0ff', '#1e293b']} position={[0, -0.06, 0]} />
    </group>
  );
}

function DeviceMesh({
  device,
  active,
  onSelect,
}: {
  device: DeviceMeta;
  active: boolean;
  onSelect: ProductDeskSceneProps['onSelect'];
}) {
  const { type, position, rotation, scale, detail } = device;
  const [hovered, setHovered] = useState(false);
  const groupRef = useRef<THREE.Group>(null);

  const handleClick = (e: any) => {
    e.stopPropagation();
    onSelect(detail);
  };

  // Add subtle float on hover
  useFrame((state) => {
    if (groupRef.current) {
      if (hovered || active) {
        groupRef.current.position.y = position[1] + Math.sin(state.clock.getElapsedTime() * 4) * 0.06 + 0.08;
      } else {
        groupRef.current.position.y = position[1];
      }
    }
  });

  const pointerOver = (e: any) => {
    e.stopPropagation();
    setHovered(true);
    document.body.style.cursor = 'pointer';
  };

  const pointerOut = (e: any) => {
    e.stopPropagation();
    setHovered(false);
    document.body.style.cursor = 'auto';
  };

  if (type === 'laptop') {
    return (
      <group 
        ref={groupRef}
        position={position} 
        rotation={rotation} 
        scale={scale}
        onClick={handleClick}
        onPointerOver={pointerOver}
        onPointerOut={pointerOut}
      >
        {/* Laptop Base */}
        <mesh position={[0, 0.04, 0]}>
          <boxGeometry args={[2.5, 0.06, 1.7]} />
          <meshStandardMaterial 
            color={active ? '#00f0ff' : hovered ? '#475569' : '#0f172a'} 
            metalness={0.8}
            roughness={0.2}
          />
        </mesh>
        
        {/* Trackpad */}
        <mesh position={[0, 0.075, 0.55]}>
          <boxGeometry args={[0.5, 0.01, 0.35]} />
          <meshStandardMaterial color="#334155" roughness={0.6} />
        </mesh>

        {/* Keyboard Area */}
        <mesh position={[0, 0.075, -0.15]}>
          <boxGeometry args={[2.2, 0.01, 0.8]} />
          <meshStandardMaterial color="#1e293b" roughness={0.9} />
        </mesh>

        {/* Screen Hinge and Lid */}
        <group position={[0, 0.07, -0.8]}>
          <mesh position={[0, 0.75, -0.03]} rotation={[Math.PI / 12, 0, 0]}>
            <boxGeometry args={[2.5, 1.5, 0.04]} />
            <meshStandardMaterial color="#0f172a" metalness={0.9} roughness={0.2} />
          </mesh>
          
          {/* Glowing Screen display */}
          <mesh position={[0, 0.75, 0.01]} rotation={[Math.PI / 12, 0, 0]}>
            <planeGeometry args={[2.45, 1.45]} />
            <meshStandardMaterial 
              color={active ? '#e0f2fe' : hovered ? '#38bdf8' : '#0369a1'} 
              emissive={active ? '#00f0ff' : '#0f172a'}
              emissiveIntensity={active ? 1.5 : hovered ? 0.8 : 0.3}
            />
          </mesh>
        </group>

        {/* Floating Screen Tag */}
        <Html position={[0, 1.8, -0.8]} center style={{ pointerEvents: 'none' }}>
          <div className={`whitespace-nowrap px-2.5 py-1 rounded-xl text-[9px] font-bold border backdrop-blur-md select-none transition-all duration-300 ${
            active 
              ? 'bg-gradient-to-r from-teal-400 to-emerald-400 text-white border-teal-300/40 shadow-lg scale-110' 
              : hovered 
              ? 'bg-white/30 text-white border-white/35 scale-105 shadow' 
              : 'bg-white/10 text-white/70 border-white/10'
          }`}>
            {detail.title}
          </div>
        </Html>
      </group>
    );
  }

  if (type === 'phone') {
    return (
      <group
        ref={groupRef}
        position={position}
        rotation={rotation}
        scale={scale}
        onClick={handleClick}
        onPointerOver={pointerOver}
        onPointerOut={pointerOut}
      >
        {/* Phone Case */}
        <mesh position={[0, 0.03, 0]}>
          <boxGeometry args={[0.72, 0.05, 1.45]} />
          <meshStandardMaterial
            color={active ? '#ff007f' : hovered ? '#475569' : '#0f172a'}
            roughness={0.15}
            metalness={0.9}
          />
        </mesh>
        
        {/* Phone Screen Display */}
        <mesh position={[0, 0.06, 0]}>
          <boxGeometry args={[0.67, 0.01, 1.4]} />
          <meshStandardMaterial 
            color={active ? '#fff0f6' : hovered ? '#f472b6' : '#9d174d'} 
            emissive={active ? '#ff007f' : '#0f172a'}
            emissiveIntensity={active ? 1.5 : hovered ? 0.8 : 0.2}
          />
        </mesh>
        
        {/* Camera bump on back */}
        <mesh position={[0.2, 0.015, -0.5]}>
          <boxGeometry args={[0.2, 0.01, 0.25]} />
          <meshStandardMaterial color="#0f172a" />
        </mesh>

        <Html position={[0, 0.7, 0]} center style={{ pointerEvents: 'none' }}>
          <div className={`whitespace-nowrap px-2 py-0.5 rounded-lg text-[9px] font-bold border backdrop-blur-md select-none transition-all duration-300 ${
            active 
              ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white border-pink-400/40 shadow-lg scale-110' 
              : hovered 
              ? 'bg-white/30 text-white border-white/35 scale-105 shadow' 
              : 'bg-white/10 text-white/70 border-white/10'
          }`}>
            {detail.title}
          </div>
        </Html>
      </group>
    );
  }

  // Tablet
  return (
    <group
      ref={groupRef}
      position={position}
      rotation={rotation}
      scale={scale}
      onClick={handleClick}
      onPointerOver={pointerOver}
      onPointerOut={pointerOut}
    >
      {/* Tablet shell */}
      <mesh position={[0, 0.03, 0]}>
        <boxGeometry args={[1.35, 0.04, 1.85]} />
        <meshStandardMaterial
          color={active ? '#c22bff' : hovered ? '#475569' : '#0f172a'}
          metalness={0.9}
          roughness={0.2}
        />
      </mesh>
      
      {/* Tablet screen display */}
      <mesh position={[0, 0.055, 0]}>
        <boxGeometry args={[1.28, 0.01, 1.78]} />
        <meshStandardMaterial 
          color={active ? '#f5f3ff' : hovered ? '#c084fc' : '#6b21a8'} 
          emissive={active ? '#c22bff' : '#0f172a'}
          emissiveIntensity={active ? 1.5 : hovered ? 0.8 : 0.2}
        />
      </mesh>

      <Html position={[0, 0.8, 0]} center style={{ pointerEvents: 'none' }}>
        <div className={`whitespace-nowrap px-2 py-0.5 rounded-lg text-[9px] font-bold border backdrop-blur-md select-none transition-all duration-300 ${
          active 
            ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white border-purple-400/40 shadow-lg scale-110' 
            : hovered 
            ? 'bg-white/30 text-white border-white/35 scale-105 shadow' 
            : 'bg-white/10 text-white/70 border-white/10'
        }`}>
          {detail.title}
        </div>
      </Html>
    </group>
  );
}
