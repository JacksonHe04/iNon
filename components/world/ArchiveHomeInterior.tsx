'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { FurnitureAsset, MedievalAsset, PropAsset } from '@/components/world/ArchiveAsset';
import type { HomeRecordId } from '@/components/world/archiveHomeRecords';

function InteractiveFurniture({
  record,
  label,
  onInspect,
  children,
}: {
  record: HomeRecordId;
  label: string;
  onInspect: (record: HomeRecordId) => void;
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

export default function ArchiveHomeInterior({ onInspect }: { onInspect: (record: HomeRecordId) => void }) {
  return (
    <group name="lived-in-archive-interior">
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
      <PropAsset name="Lantern_Wall" position={[1.82, 1.58, -0.75]} rotation={[0, -Math.PI / 2, 0]} scale={0.72} />
      <pointLight position={[0.6, 1.7, 0.45]} intensity={48} distance={15} decay={1.6} color="#cda867" />
      <pointLight position={[-1.1, 1.15, -1.8]} intensity={22} distance={7} decay={1.5} color="#e0b66d" />
    </group>
  );
}
