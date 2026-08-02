'use client';

import { useEffect, useMemo, useRef, type ComponentProps } from 'react';
import { useGLTF } from '@react-three/drei';
import { CuboidCollider, RigidBody } from '@react-three/rapier';
import { Color, InstancedMesh, Matrix4, Mesh, type Material } from 'three';
import { collectQuaterniusParts } from '@/components/world/QuaterniusForest';
import { RIVER_BRIDGE_POSITION, WORLD_HOME_POSITION } from '@/components/world/archiveWorldConstants';
import { terrainHeightAt } from '@/components/world/archiveTerrainMath';

const MEDIEVAL_ROOT = '/archive-world/quaternius-medieval';
const PROP_ROOT = '/archive-world/quaternius-props';

function TintedGltfAsset({
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

function MedievalAsset({ name, ...props }: Omit<ComponentProps<typeof TintedGltfAsset>, 'src'> & { name: string }) {
  return <TintedGltfAsset src={`${MEDIEVAL_ROOT}/${name}.gltf`} {...props} />;
}

function PropAsset({ name, ...props }: Omit<ComponentProps<typeof TintedGltfAsset>, 'src'> & { name: string }) {
  return <TintedGltfAsset src={`${PROP_ROOT}/${name}.gltf`} tint="#a2ad98" {...props} />;
}

function InstancedAsset({ src, transforms }: { src: string; transforms: Matrix4[] }) {
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

export function RiverFootbridge() {
  const floor = useMemo(() => Array.from({ length: 14 }, (_, index) => {
    const x = -13 + index * 2;
    return [-1, 1].map((z) => new Matrix4().makeTranslation(x, 0, z));
  }).flat(), []);
  const fences = useMemo(() => Array.from({ length: 14 }, (_, index) => {
    const x = -13 + index * 2;
    return [-2.05, 2.05].map((z) => new Matrix4().makeTranslation(x, 0.12, z));
  }).flat(), []);
  const even = useMemo(() => fences.filter((_, index) => Math.floor(index / 2) % 2 === 0), [fences]);
  const odd = useMemo(() => fences.filter((_, index) => Math.floor(index / 2) % 2 === 1), [fences]);
  return (
    <RigidBody type="fixed" colliders={false} position={[...RIVER_BRIDGE_POSITION]} rotation={[0, 0, -0.04]}>
      <CuboidCollider args={[14, 0.18, 2]} />
      <InstancedAsset src={`${MEDIEVAL_ROOT}/Floor_WoodDark.gltf`} transforms={floor} />
      <InstancedAsset src={`${MEDIEVAL_ROOT}/Prop_WoodenFence_Single.gltf`} transforms={even} />
      <InstancedAsset src={`${MEDIEVAL_ROOT}/Prop_WoodenFence_Extension1.gltf`} transforms={odd} />
      <PropAsset name="Lantern_Wall" position={[-10.7, 1.05, -2.18]} rotation={[0, Math.PI / 2, 0]} scale={1.05} />
      <PropAsset name="Lantern_Wall" position={[8.9, 1.05, 2.18]} rotation={[0, -Math.PI / 2, 0]} scale={1.05} />
    </RigidBody>
  );
}

function ArchiveHomeModel() {
  return (
    <group name="single-coastal-archive-home" rotation-y={-0.07} scale={[2.05, 1.48, 1.72]}>
      <MedievalAsset name="Wall_Plaster_Door_Round" position={[-1, 0, 3]} />
      <MedievalAsset name="Wall_Plaster_Window_Wide_Round" position={[1, 0, 3]} />
      <MedievalAsset name="Window_Wide_Round1" position={[1, 0, 3.06]} />
      <MedievalAsset name="WindowShutters_Wide_Round_Open" position={[1, 0, 3.05]} />
      {[-1, 1].map((x) => <MedievalAsset key={`rear-${x}`} name="Wall_Plaster_Straight" position={[x, 0, -3]} rotation={[0, Math.PI, 0]} />)}
      {[-2, 2].map((z) => <MedievalAsset key={`left-${z}`} name="Wall_Plaster_Straight" position={[-2, 0, z]} rotation={[0, Math.PI / 2, 0]} />)}
      {[-2, 2].map((z) => <MedievalAsset key={`right-${z}`} name="Wall_Plaster_Straight" position={[2, 0, z]} rotation={[0, -Math.PI / 2, 0]} />)}
      {[-2, 2].map((x) => <MedievalAsset key={`side-window-${x}`} name="Wall_Plaster_Window_Wide_Round" position={[x, 0, 0]} rotation={[0, x < 0 ? Math.PI / 2 : -Math.PI / 2, 0]} />)}
      {[-2.05, 2.05].map((x) => <MedievalAsset key={`window-${x}`} name="Window_Wide_Round1" position={[x, 0, 0]} rotation={[0, x < 0 ? Math.PI / 2 : -Math.PI / 2, 0]} />)}
      {[-1, 1].flatMap((x) => [-2, 0, 2].map((z) => <MedievalAsset key={`floor-${x}-${z}`} name="Floor_WoodDark" position={[x, 0.03, z]} />))}
      <MedievalAsset name="Roof_RoundTiles_4x6" position={[0, 3, 0]} rotation={[0, 0, 0.025]} />
      <MedievalAsset name="Roof_Front_Brick4" position={[0, 3, 3]} />
      <MedievalAsset name="Roof_Front_Brick4" position={[0, 3, -3]} rotation={[0, Math.PI, 0]} />
      <MedievalAsset name="Prop_Chimney" position={[-1.35, 3.8, -0.8]} scale={0.82} />
      <MedievalAsset name="Prop_Vine1" position={[1.8, 2.3, 3.13]} />
      <PropAsset name="Workbench" position={[0.55, 0.05, -1.95]} rotation={[0, Math.PI, 0]} scale={0.82} />
      <PropAsset name="Workbench_Drawers" position={[0.55, 0.05, -1.95]} rotation={[0, Math.PI, 0]} scale={0.82} />
      <PropAsset name="Scroll_1" position={[0.15, 0.84, -1.86]} rotation={[0, -0.34, 0]} scale={2.7} />
      <PropAsset name="Bench" position={[-0.7, 0.03, 0.75]} rotation={[0, Math.PI / 2 + 0.08, 0]} scale={0.72} />
      <PropAsset name="Bag" position={[-1.25, 0.03, -1.78]} rotation={[0, 0.42, 0]} scale={0.62} />
      <MedievalAsset name="Prop_Crate" position={[1.3, 0.05, 1.7]} rotation={[0, -0.26, 0]} scale={0.6} />
      <PropAsset name="Lantern_Wall" position={[1.82, 1.58, -0.75]} rotation={[0, -Math.PI / 2, 0]} scale={0.72} />
      <pointLight position={[0.7, 1.7, 0.5]} intensity={5.4} distance={13} color="#c5a15d" />
    </group>
  );
}

export function CoastalArchiveHome() {
  const [x, , z] = WORLD_HOME_POSITION;
  return (
    <RigidBody type="fixed" colliders={false} position={[x, terrainHeightAt(x, z), z]} rotation={[0, -0.08, 0]}>
      <CuboidCollider args={[4.35, 2.25, 0.24]} position={[0, 2.25, -5.05]} />
      <CuboidCollider args={[0.24, 2.25, 5]} position={[-4.18, 2.25, 0]} />
      <CuboidCollider args={[0.24, 2.25, 5]} position={[4.18, 2.25, 0]} />
      <CuboidCollider args={[2.05, 2.25, 0.24]} position={[2.15, 2.25, 5.05]} />
      <ArchiveHomeModel />
    </RigidBody>
  );
}
