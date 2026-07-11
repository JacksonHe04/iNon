'use client';

import { Suspense, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Html, OrbitControls, Stars, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

interface CreationGalaxyProps {
  activeCategory: string;
  categories: Array<{ id: string; label: string }>;
  onChange: (id: string) => void;
}

interface PlanetConfig {
  id: string;
  label: string;
  color: string;
  size: number;
  radius: number;
  angle: number;
}

export default function CreationGalaxy({
  activeCategory,
  categories,
  onChange,
}: CreationGalaxyProps) {
  const planetConfigs: PlanetConfig[] = useMemo(
    () =>
      categories.map((category, idx) => ({
        id: category.id,
        label: category.label,
        // Premium neon glow colors matching the new aesthetic
        color: ['#ff2a85', '#00f0ff', '#05ffc7', '#ffb700', '#c22bff'][idx % 5],
        size: 0.65 + idx * 0.15,
        radius: 2.2 + idx * 0.9,
        angle: (idx / categories.length) * Math.PI * 2,
      })),
    [categories]
  );

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-slate-950/80 via-indigo-950/40 to-slate-950/80 backdrop-blur-md shadow-2xl">
      <Canvas camera={{ position: [0, 5, 9], fov: 45 }}>
        <ambientLight intensity={0.5} />
        {/* Glowing point lights */}
        <pointLight position={[0, 2, 5]} intensity={2.5} color="#00f0ff" />
        <pointLight position={[-3, -2, -3]} intensity={1.5} color="#ff2a85" />
        <pointLight position={[3, -2, 3]} intensity={1.5} color="#c22bff" />
        
        <Stars radius={100} depth={50} count={2500} factor={5} fade speed={1.5} />
        
        <group rotation={[-0.2, 0.1, 0]}>
          {/* Central Sun/Core representing inspiration */}
          <mesh>
            <sphereGeometry args={[0.5, 32, 32]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
          <mesh scale={1.8}>
            <sphereGeometry args={[0.5, 16, 16]} />
            <meshBasicMaterial color="#00f0ff" transparent opacity={0.2} />
          </mesh>

          {/* Orbital Paths centered at the origin */}
          {planetConfigs.map((planet) => (
            <mesh key={`ring-${planet.id}`} rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[planet.radius - 0.02, planet.radius + 0.02, 128]} />
              <meshBasicMaterial color={planet.color} transparent opacity={0.12} />
            </mesh>
          ))}

          <Suspense fallback={null}>
            {planetConfigs.map((planet) => (
              <Planet
                key={planet.id}
                config={planet}
                active={planet.id === activeCategory}
                onSelect={() => onChange(planet.id)}
              />
            ))}
          </Suspense>
        </group>
        <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.3} />
      </Canvas>
    </div>
  );
}

function Planet({
  config,
  active,
  onSelect,
}: {
  config: PlanetConfig;
  active: boolean;
  onSelect: () => void;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const planetRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  // Orbit rotation
  useFrame((_, delta) => {
    if (groupRef.current) {
      // Different orbital speeds based on distance
      const speedFactor = 0.3 / config.radius;
      groupRef.current.rotation.y += delta * speedFactor;
    }
    if (planetRef.current) {
      planetRef.current.rotation.y += delta * 0.5;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Position planet along its orbit */}
      <group position={[Math.cos(config.angle) * config.radius, 0, Math.sin(config.angle) * config.radius]}>
        <mesh
          ref={planetRef}
          scale={active ? 1.4 : hovered ? 1.25 : 1}
          onPointerDown={(event) => {
            event.stopPropagation();
            onSelect();
          }}
          onPointerOver={(event) => {
            event.stopPropagation();
            setHovered(true);
            document.body.style.cursor = 'pointer';
          }}
          onPointerOut={(event) => {
            event.stopPropagation();
            setHovered(false);
            document.body.style.cursor = 'auto';
          }}
        >
          <sphereGeometry args={[config.size, 32, 32]} />
          <MeshDistortMaterial
            color={config.color}
            speed={hovered || active ? 3 : 1.5}
            distort={active ? 0.22 : hovered ? 0.18 : 0.1}
            metalness={0.4}
            roughness={0.15}
          />
        </mesh>

        {/* Aura Ring / Glow */}
        <mesh scale={active ? 1.6 : hovered ? 1.4 : 1.2}>
          <sphereGeometry args={[config.size + 0.15, 16, 16]} />
          <meshBasicMaterial 
            color={config.color} 
            transparent 
            opacity={active ? 0.3 : hovered ? 0.22 : 0.08} 
          />
        </mesh>

        {/* Floating Label */}
        <Html center distanceFactor={10} style={{ pointerEvents: 'none' }}>
          <div
            className={`whitespace-nowrap rounded-2xl px-3 py-1.5 text-[10px] font-bold tracking-wider uppercase transition-all duration-300 border backdrop-blur-md select-none ${
              active
                ? 'bg-gradient-to-r from-teal-400 to-emerald-400 text-white border-teal-300/40 shadow-lg scale-110'
                : hovered
                ? 'bg-white/30 dark:bg-black/50 text-white border-white/40 scale-105'
                : 'bg-white/10 dark:bg-black/30 text-white/80 border-white/10'
            }`}
          >
            {config.label}
          </div>
        </Html>
      </group>
    </group>
  );
}
