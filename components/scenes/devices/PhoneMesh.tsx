import { useState, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import type { DeviceMeta } from './types';

interface PhoneMeshProps {
  device: DeviceMeta;
  active: boolean;
  onSelect: (detail: DeviceMeta['detail']) => void;
}

export function PhoneMesh({ device, active, onSelect }: PhoneMeshProps) {
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
