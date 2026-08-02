import { BufferGeometry, Mesh, Object3D } from 'three';
import { clone as cloneSkeleton } from 'three/addons/utils/SkeletonUtils.js';

const compactGeometryCache = new WeakMap<BufferGeometry, BufferGeometry>();

function compactMaterialGroups(source: BufferGeometry) {
  const cached = compactGeometryCache.get(source);
  if (cached) return cached;
  if (source.groups.length <= 1) {
    compactGeometryCache.set(source, source);
    return source;
  }

  const sourceIndex = source.getIndex();
  const vertexOrder = sourceIndex
    ? Array.from(sourceIndex.array)
    : Array.from({ length: source.getAttribute('position').count }, (_, index) => index);
  const indicesByMaterial = new Map<number, number[]>();
  source.groups.forEach((group) => {
    const materialIndex = group.materialIndex ?? 0;
    const indices = indicesByMaterial.get(materialIndex) ?? [];
    indices.push(...vertexOrder.slice(group.start, group.start + group.count));
    indicesByMaterial.set(materialIndex, indices);
  });

  const geometry = source.clone();
  geometry.clearGroups();
  const compactIndex: number[] = [];
  indicesByMaterial.forEach((indices, materialIndex) => {
    const start = compactIndex.length;
    compactIndex.push(...indices);
    geometry.addGroup(start, indices.length, materialIndex);
  });
  geometry.setIndex(compactIndex);
  geometry.computeBoundingBox();
  geometry.computeBoundingSphere();
  compactGeometryCache.set(source, geometry);
  return geometry;
}

export function cloneAnimatedAsset(source: Object3D) {
  const clone = cloneSkeleton(source);
  clone.traverse((object) => {
    if (!(object instanceof Mesh)) return;
    object.geometry = compactMaterialGroups(object.geometry);
  });
  return clone;
}
