import { useState, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import type { DeviceMeta } from './types';

interface TabletMeshProps {
  device: DeviceMeta;
  active: boolean;
  onSelect: (detail: DeviceMeta['detail']) => void;
}

export function TabletMesh({ device, active, onSelect }: TabletMeshProps) {
  const { position, rotation, scale, detail } = device;
  const [hovered, setHovered] = useState(false);
  const groupRef = useRef<THREE.Group>(null);

  const handleClick = (e: any) => {
    e.stopPropagation();
    onSelect(detail);
  };

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
