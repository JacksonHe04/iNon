import { useState, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import type { DeviceMeta } from './types';

interface LaptopMeshProps {
  device: DeviceMeta;
  active: boolean;
  onSelect: (detail: DeviceMeta['detail']) => void;
}

export function LaptopMesh({ device, active, onSelect }: LaptopMeshProps) {
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
