import React from 'react';

export function DeskSurface() {
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
