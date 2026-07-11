'use client';

import { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, OrbitControls, Stars, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

export default function DeepSpaceScene() {
  return (
    <div className="relative aspect-[16/7] w-full overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-slate-950/80 via-indigo-950/40 to-slate-950/80 backdrop-blur-md shadow-2xl">
      <Canvas camera={{ position: [0, 0, 10], fov: 45 }}>
        <ambientLight intensity={0.4} />
        <pointLight position={[5, 5, 5]} intensity={2.5} color="#8b5cf6" />
        <pointLight position={[-5, -5, -5]} intensity={1.5} color="#06b6d4" />
        <pointLight position={[0, 0, 2]} intensity={2} color="#ec4899" />
        
        <Stars radius={120} depth={60} count={2000} factor={6} fade speed={1} />
        
        <Float speed={2} rotationIntensity={1.5} floatIntensity={1.2}>
          <ThoughtCrystal />
        </Float>
        
        <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.4} />
      </Canvas>
    </div>
  );
}

function ThoughtCrystal() {
  const crystalRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const [clicked, setClicked] = useState(false);
  
  // Custom rotation and scaling animations
  useFrame((state, delta) => {
    if (crystalRef.current) {
      crystalRef.current.rotation.y += delta * 0.25;
      crystalRef.current.rotation.x += delta * 0.15;
    }
    if (ringRef.current) {
      ringRef.current.rotation.y -= delta * 0.12;
      ringRef.current.rotation.z += delta * 0.05;
    }
  });

  return (
    <group>
      {/* Outer Floating Ring (Swirling Thoughts) */}
      <group ref={ringRef}>
        <mesh rotation={[Math.PI / 3, 0, 0]}>
          <ringGeometry args={[3.2, 3.23, 64]} />
          <meshBasicMaterial color="#06b6d4" transparent opacity={0.2} side={THREE.DoubleSide} />
        </mesh>
        
        {/* Orbiting particles */}
        {[...Array(6)].map((_, i) => {
          const angle = (i / 6) * Math.PI * 2;
          const radius = 3.2;
          return (
            <mesh 
              key={i} 
              position={[Math.cos(angle) * radius, 0, Math.sin(angle) * radius]}
            >
              <sphereGeometry args={[0.08, 16, 16]} />
              <meshBasicMaterial color={i % 2 === 0 ? '#ec4899' : '#00ffc7'} />
            </mesh>
          );
        })}
      </group>

      {/* Internal Core (Glow Source) */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.45, 32, 32]} />
        <meshBasicMaterial color={clicked ? '#00f0ff' : '#ec4899'} />
      </mesh>
      
      {/* Core point light */}
      <pointLight 
        position={[0, 0, 0]} 
        intensity={clicked ? 4.5 : 2.5} 
        distance={6} 
        color={clicked ? '#00f0ff' : '#ec4899'} 
      />

      {/* Main Faceted Crystal Geometries */}
      <mesh
        ref={crystalRef}
        scale={hovered ? 1.15 : 1.0}
        onPointerDown={(e) => {
          e.stopPropagation();
          setClicked(!clicked);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          setHovered(false);
          document.body.style.cursor = 'auto';
        }}
      >
        <icosahedronGeometry args={[2.0, 1]} />
        <MeshDistortMaterial
          color={clicked ? '#3b82f6' : '#8b5cf6'}
          transparent
          opacity={0.65}
          speed={hovered ? 2.5 : 1}
          distort={hovered ? 0.15 : 0.05}
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>

      {/* Glowing Aura Outer Shield */}
      <mesh scale={1.22}>
        <icosahedronGeometry args={[2.0, 1]} />
        <meshBasicMaterial 
          color={clicked ? '#3b82f6' : '#8b5cf6'} 
          transparent 
          opacity={hovered ? 0.12 : 0.05} 
          wireframe 
        />
      </mesh>
    </group>
  );
}
