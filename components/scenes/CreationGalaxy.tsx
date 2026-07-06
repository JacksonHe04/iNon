'use client';

import { Suspense, useMemo, useRef } from 'react';
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
        color: ['#f472b6', '#60a5fa', '#34d399', '#fcd34d', '#a855f7'][idx % 5],
        size: 0.8 + idx * 0.2,
        radius: 2.6 + idx * 0.8,
        angle: (idx / categories.length) * Math.PI * 2,
      })),
    [categories]
  );

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900 via-black to-slate-900">
      <Canvas camera={{ position: [0, 0, 10], fov: 45 }}>
        <color attach="background" args={['#020617']} />
        <ambientLight intensity={0.8} />
        <pointLight position={[0, 0, 10]} intensity={1.4} color="#fce7f3" />
        <Stars radius={80} depth={50} count={3000} factor={4} fade />
        <group rotation={[-0.4, 0.3, 0]}>
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
        <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.5} />
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

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.05;
    }
    if (planetRef.current) {
      planetRef.current.rotation.y += delta * 0.3;
    }
  });

  return (
    <group ref={groupRef}>
      <group position={[Math.cos(config.angle) * config.radius, 0, Math.sin(config.angle) * config.radius]}>
        <mesh position={[0, -0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[config.radius - 0.4, config.radius + 0.02, 64]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.03} />
        </mesh>
        <mesh
          ref={planetRef}
          scale={active ? 1.3 : 1}
          onPointerDown={(event) => {
            event.stopPropagation();
            onSelect();
          }}
        >
          <sphereGeometry args={[config.size, 64, 64]} />
          <MeshDistortMaterial
            color={config.color}
            speed={2}
            distort={0.15}
            metalness={0.2}
            roughness={0.2}
          />
        </mesh>
        <mesh scale={active ? 1.5 : 1.3}>
          <sphereGeometry args={[config.size + 0.18, 32, 32]} />
          <meshBasicMaterial color={config.color} transparent opacity={0.15} />
        </mesh>
        <Html center distanceFactor={8}>
          <div
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              active ? 'bg-white text-black shadow' : 'bg-white/20 text-white'
            }`}
          >
            {config.label}
          </div>
        </Html>
      </group>
    </group>
  );
}
