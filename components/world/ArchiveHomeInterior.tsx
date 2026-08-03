'use client';

import { Suspense, useEffect, useRef, useState, type MutableRefObject, type ReactNode } from 'react';
import { Image } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { DoubleSide, Vector3 } from 'three';
import { FurnitureAsset, MedievalAsset, PropAsset } from '@/components/world/ArchiveAsset';
import { exhibitInspectionId, type HomeExhibit, type HomeInspectionId, type HomeRecordId } from '@/components/world/archiveHomeRecords';
import { WORLD_HOME_POSITION } from '@/components/world/archiveWorldConstants';

function InteractiveFurniture({
  record,
  label,
  onInspect,
  children,
}: {
  record: HomeRecordId;
  label: string;
  onInspect: (record: HomeInspectionId) => void;
  children: ReactNode;
}) {
  const [hovered, setHovered] = useState(false);
  useEffect(() => {
    if (!hovered) return;
    document.body.style.cursor = 'pointer';
    return () => { document.body.style.cursor = ''; };
  }, [hovered]);
  const stop = (event: { stopPropagation: () => void }) => event.stopPropagation();
  return (
    <group
      name={`interactive-${record}-${label}`}
      onClick={(event) => { stop(event); onInspect(record); }}
      onPointerOver={(event) => { stop(event); setHovered(true); }}
      onPointerOut={() => setHovered(false)}
      scale={hovered ? 1.018 : 1}
    >
      {children}
    </group>
  );
}

function ExhibitImage({
  exhibit,
  position,
  rotation = [0, 0, 0],
  scale,
  onInspect,
}: {
  exhibit: HomeExhibit;
  position: [number, number, number];
  rotation?: [number, number, number];
  scale: [number, number];
  onInspect: (record: HomeInspectionId) => void;
}) {
  const [hovered, setHovered] = useState(false);
  useEffect(() => {
    if (!hovered) return;
    document.body.style.cursor = 'pointer';
    return () => { document.body.style.cursor = ''; };
  }, [hovered]);
  return (
    <group
      name={`database-exhibit-${exhibit.kind}-${exhibit.title}`}
      position={position}
      rotation={rotation}
      scale={hovered ? 1.035 : 1}
      onClick={(event) => {
        event.stopPropagation();
        onInspect(exhibitInspectionId(exhibit.id));
      }}
      onPointerOver={(event) => {
        event.stopPropagation();
        setHovered(true);
      }}
      onPointerOut={() => setHovered(false)}
    >
      <Image
        url={exhibit.imageUrl}
        scale={scale}
        grayscale={0.18}
        color="#c9c9ad"
        toneMapped={false}
        side={DoubleSide}
      />
    </group>
  );
}

function HomeDataExhibits({
  exhibits,
  onInspect,
}: {
  exhibits: HomeExhibit[];
  onInspect: (record: HomeInspectionId) => void;
}) {
  const music = exhibits.filter((exhibit) => exhibit.kind === 'music');
  const film = exhibits.find((exhibit) => exhibit.kind === 'film');
  const book = exhibits.find((exhibit) => exhibit.kind === 'book');
  const musicLayout = [
    { position: [-0.72, 1.72, -2.64], rotation: [0, 0, -0.035], scale: [0.48, 0.48] },
    { position: [-0.14, 1.66, -2.63], rotation: [0, 0, 0.028], scale: [0.46, 0.46] },
    { position: [1.18, 0.78, 1.56], rotation: [0, -0.04, 0.04], scale: [0.48, 0.48] },
  ] as const;
  return (
    <group name="database-content-visible-inside-home">
      {music.map((exhibit, index) => {
        const layout = musicLayout[index] ?? musicLayout[2];
        return (
          <Suspense key={exhibit.id} fallback={null}>
            <ExhibitImage
              exhibit={exhibit}
              position={[...layout.position]}
              rotation={[...layout.rotation]}
              scale={[...layout.scale]}
              onInspect={onInspect}
            />
          </Suspense>
        );
      })}
      {film && (
        <Suspense fallback={null}>
          <ExhibitImage
            exhibit={film}
            position={[-1.38, 0.92, 1.34]}
            rotation={[0, 0.12, -0.035]}
            scale={[0.42, 0.62]}
            onInspect={onInspect}
          />
        </Suspense>
      )}
      {book && (
        <Suspense fallback={null}>
          <ExhibitImage
            exhibit={book}
            position={[1.34, 1.18, -2.17]}
            rotation={[0, 0, 0.025]}
            scale={[0.4, 0.56]}
            onInspect={onInspect}
          />
        </Suspense>
      )}
    </group>
  );
}

export default function ArchiveHomeInterior({
  exhibits,
  onInspect,
  playerPosition,
}: {
  exhibits: HomeExhibit[];
  onInspect: (record: HomeInspectionId) => void;
  playerPosition: MutableRefObject<Vector3>;
}) {
  const distanceToHome = () => Math.hypot(
    playerPosition.current.x - WORLD_HOME_POSITION[0],
    playerPosition.current.z - WORLD_HOME_POSITION[2],
  );
  const [mounted, setMounted] = useState(() => distanceToHome() < 24);
  const mountedRef = useRef(mounted);
  const frame = useRef(0);
  useFrame(() => {
    frame.current = (frame.current + 1) % 15;
    if (frame.current !== 0) return;
    const next = distanceToHome() < (mountedRef.current ? 36 : 24);
    if (next === mountedRef.current) return;
    mountedRef.current = next;
    setMounted(next);
  });
  return (
    <group name="lived-in-archive-interior">
      {mounted && (
        <>
      <InteractiveFurniture record="bedside" label="bed-and-nightstand" onInspect={onInspect}>
        <FurnitureAsset name="BedTwin" position={[-1.08, 0.06, -1.12]} rotation={[0, Math.PI / 2, 0]} scale={0.48} tint="#8e9b7d" />
        <FurnitureAsset name="NightStand" position={[-1.42, 0.05, -2.32]} rotation={[0, 0.08, 0]} scale={0.72} tint="#8b765a" />
        <PropAsset name="Lantern_Wall" position={[-1.42, 0.67, -2.27]} scale={0.5} />
        <PropAsset name="Bag" position={[-1.54, 0.2, -1.84]} rotation={[0, -0.34, 0]} scale={0.38} />
        <PropAsset name="Scroll_2" position={[-0.82, 0.52, -1.28]} rotation={[0, 0.42, 0.05]} scale={0.76} />
      </InteractiveFurniture>

      <InteractiveFurniture record="bookcase" label="bookcase" onInspect={onInspect}>
        <FurnitureAsset name="Bookcase" position={[1.46, 0.05, -2.56]} rotation={[0, Math.PI, 0]} scale={0.7} tint="#728268" />
        <PropAsset name="Scroll_1" position={[1.28, 1.18, -2.19]} rotation={[0, 0.18, 0]} scale={1.15} />
        <PropAsset name="Scroll_2" position={[1.6, 1.52, -2.18]} rotation={[0, -0.18, 0]} scale={0.82} />
      </InteractiveFurniture>

      <InteractiveFurniture record="desk" label="desk" onInspect={onInspect}>
        <FurnitureAsset name="Desk" position={[0.58, 0.05, -1.55]} rotation={[0, Math.PI, 0]} scale={0.88} tint="#82745b" />
        <FurnitureAsset name="Chair" position={[0.58, 0.04, -0.7]} rotation={[0, Math.PI, 0]} scale={0.92} tint="#7b866d" />
        <PropAsset name="Scroll_1" position={[0.22, 0.88, -1.45]} rotation={[0, -0.34, 0]} scale={1.35} />
        <PropAsset name="Scroll_2" position={[0.86, 0.9, -1.42]} rotation={[0, 0.22, 0]} scale={1.05} />
        <PropAsset name="Bucket_Wooden_1" position={[1.42, 0.05, -1.22]} rotation={[0, -0.26, 0]} scale={0.38} />
      </InteractiveFurniture>

      <InteractiveFurniture record="record-box" label="record-crate" onInspect={onInspect}>
        <MedievalAsset name="Prop_Crate" position={[1.23, 0.05, 1.72]} rotation={[0, -0.26, 0]} scale={0.62} tint="#8d7655" />
        <PropAsset name="Bag" position={[1.02, 0.54, 1.65]} rotation={[0, 0.4, 0]} scale={0.52} />
        <MedievalAsset name="Prop_Crate" position={[1.72, 0.05, 2.12]} rotation={[0, 0.22, 0]} scale={0.46} tint="#7a684f" />
        <PropAsset name="Barrel" position={[1.72, 0.04, 1.08]} rotation={[0, -0.12, 0]} scale={0.42} />
      </InteractiveFurniture>

      <InteractiveFurniture record="letters" label="letters-bench" onInspect={onInspect}>
        <PropAsset name="Bench" position={[-1.42, 0.03, 1.3]} rotation={[0, Math.PI / 2 + 0.08, 0]} scale={0.68} />
        <PropAsset name="Scroll_1" position={[-1.32, 0.54, 1.15]} rotation={[0, 0.52, -0.08]} scale={0.92} />
        <PropAsset name="Rope_2" position={[-1.58, 0.58, 1.58]} rotation={[0, 1.28, 0]} scale={0.26} />
      </InteractiveFurniture>

      <PropAsset name="Bucket_Metal" position={[-1.72, 0.04, 0.72]} rotation={[0, 0.16, 0]} scale={0.34} />
      <HomeDataExhibits exhibits={exhibits} onInspect={onInspect} />
      <PropAsset name="Lantern_Wall" position={[1.82, 1.58, -0.75]} rotation={[0, -Math.PI / 2, 0]} scale={0.72} />
      <pointLight position={[0.6, 1.7, 0.45]} intensity={48} distance={15} decay={1.6} color="#cda867" />
      <pointLight position={[-1.1, 1.15, -1.8]} intensity={22} distance={7} decay={1.5} color="#e0b66d" />
        </>
      )}
    </group>
  );
}
