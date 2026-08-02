'use client';

import { useEffect, useMemo, useRef, type ComponentProps } from 'react';
import { useGLTF } from '@react-three/drei';
import { Color, InstancedMesh, Matrix4, Mesh, type Material } from 'three';
import { collectQuaterniusParts } from '@/components/world/QuaterniusForest';

export const MEDIEVAL_ROOT = '/archive-world/quaternius-medieval';
export const PROP_ROOT = '/archive-world/quaternius-props';
export const FURNITURE_ROOT = '/archive-world/quaternius-furniture';

export function TintedGltfAsset({
  src,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  tint = '#8a9680',
}: {
  src: string;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number | [number, number, number];
  tint?: string;
}) {
  const { scene } = useGLTF(src);
  const clone = useMemo(() => {
    const root = scene.clone(true);
    root.traverse((object) => {
      if (!(object instanceof Mesh)) return;
      const tintMaterial = (material: Material) => {
        const copy = material.clone();
        if ('color' in copy && copy.color instanceof Color) copy.color.multiply(new Color(tint));
        copy.needsUpdate = true;
        return copy;
      };
      object.material = Array.isArray(object.material)
        ? object.material.map(tintMaterial)
        : tintMaterial(object.material);
      object.castShadow = true;
      object.receiveShadow = true;
    });
    return root;
  }, [scene, tint]);
  return <primitive object={clone} position={position} rotation={rotation} scale={scale} />;
}

export function MedievalAsset({ name, ...props }: Omit<ComponentProps<typeof TintedGltfAsset>, 'src'> & { name: string }) {
  return <TintedGltfAsset src={`${MEDIEVAL_ROOT}/${name}.gltf`} {...props} />;
}

export function PropAsset({ name, ...props }: Omit<ComponentProps<typeof TintedGltfAsset>, 'src'> & { name: string }) {
  return <TintedGltfAsset src={`${PROP_ROOT}/${name}.gltf`} tint="#a2ad98" {...props} />;
}

export function FurnitureAsset({ name, ...props }: Omit<ComponentProps<typeof TintedGltfAsset>, 'src'> & { name: string }) {
  return <TintedGltfAsset src={`${FURNITURE_ROOT}/${name}.glb`} tint="#a9ad92" {...props} />;
}

export function InstancedAsset({ src, transforms }: { src: string; transforms: Matrix4[] }) {
  const { scene } = useGLTF(src);
  const parts = useMemo(() => collectQuaterniusParts(scene), [scene]);
  const meshes = useRef<Array<InstancedMesh | null>>([]);
  useEffect(() => {
    parts.forEach((part, partIndex) => {
      const mesh = meshes.current[partIndex];
      if (!mesh) return;
      transforms.forEach((transform, index) => mesh.setMatrixAt(index, new Matrix4().multiplyMatrices(transform, part.localMatrix)));
      mesh.count = transforms.length;
      mesh.instanceMatrix.needsUpdate = true;
      mesh.computeBoundingSphere();
    });
  }, [parts, transforms]);
  return parts.map((part, index) => (
    <instancedMesh
      key={`${src}:${index}`}
      ref={(mesh) => { meshes.current[index] = mesh; }}
      args={[part.geometry, part.material, transforms.length]}
      castShadow
      receiveShadow
    />
  ));
}
