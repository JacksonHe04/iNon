'use client';

import { Suspense, useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Physics } from '@react-three/rapier';
import { Fog } from 'three';
import FirstPersonExplorer from '@/components/world/FirstPersonExplorer';
import QuaterniusForest from '@/components/world/QuaterniusForest';
import QuaterniusGroundCover from '@/components/world/QuaterniusGroundCover';
import ArchiveWildlife from '@/components/world/ArchiveWildlife';
import ArchiveBirdFlock from '@/components/world/ArchiveBirdFlock';
import ArchiveCompanionDog from '@/components/world/ArchiveCompanionDog';
import ArchiveAquaticLife from '@/components/world/ArchiveAquaticLife';
import ArchiveOceanLife from '@/components/world/ArchiveOceanLife';
import ArchiveForestColliders from '@/components/world/ArchiveForestColliders';
import { FallingPaperSnow, WorldKeepsakes } from '@/components/world/ArchiveAtmosphere';
import { InfiniteTerrain, InfiniteWater, MountainPanorama } from '@/components/world/ArchiveTerrain';
import { CoastalArchiveHome, RiverFootbridge } from '@/components/world/ArchiveWorldStructures';
import {
  WATER_LEVEL,
  WORLD_INFRASTRUCTURE_CLEARINGS,
} from '@/components/world/archiveWorldConstants';
import { terrainHeightAt } from '@/components/world/archiveTerrainMath';
import type { ArchiveGameSceneProps } from '@/components/world/archiveGameTypes';

export type {
  ArchiveGameSceneProps,
  GameDestination,
  GameTelemetry,
  GameTravelRequest,
} from '@/components/world/archiveGameTypes';
export {
  RIVER_BRIDGE_POSITION,
  WORLD_HOME_POSITION,
  WORLD_KEEPSAKE_COUNT,
} from '@/components/world/archiveWorldConstants';
export { terrainHeightAt } from '@/components/world/archiveTerrainMath';

function Diagnostics({ onReport }: { onReport: (message: string) => void }) {
  const frames = useRef(0);
  useFrame(({ gl, scene, camera }) => {
    frames.current += 1;
    if (frames.current !== 120 && frames.current % 420 !== 0) return;
    const context = gl.getContext();
    onReport([
      context.isContextLost() ? 'WebGL context lost' : 'WebGL live',
      `${gl.info.render.calls} draw calls`,
      `${gl.info.render.triangles} triangles`,
      `${scene.children.length} scene nodes`,
      `camera ${camera.position.toArray().map((value) => value.toFixed(1)).join('/')}`,
    ].join(' · '));
  });
  return null;
}

export default function ArchiveGameScene({
  entered,
  destinations,
  playerPosition,
  travelRequest,
  onOpen,
  onNearby,
  onTelemetry,
  onDiagnostics,
  onCompanionProximity,
  collectedKeepsakes,
  onCollectKeepsake,
}: ArchiveGameSceneProps) {
  const { scene } = useThree();

  useEffect(() => {
    scene.fog = new Fog('#667565', 24, 215);
    return () => {
      scene.fog = null;
    };
  }, [scene]);

  return (
    <>
      <color attach="background" args={['#919d8b']} />
      <ambientLight intensity={0.85} color="#d8d2b8" />
      <hemisphereLight args={['#cbd0bd', '#24392c', 1.3]} />
      <directionalLight
        castShadow
        position={[-32, 42, 22]}
        intensity={2.6}
        color="#e2d4aa"
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={150}
        shadow-camera-left={-75}
        shadow-camera-right={75}
        shadow-camera-top={75}
        shadow-camera-bottom={-75}
      />
      <Diagnostics onReport={onDiagnostics} />
      <Suspense fallback={null}>
        <MountainPanorama playerPosition={playerPosition} />
        <QuaterniusForest
          playerPosition={playerPosition}
          destinations={destinations}
          clearings={WORLD_INFRASTRUCTURE_CLEARINGS}
          heightAt={terrainHeightAt}
        />
        <QuaterniusGroundCover
          playerPosition={playerPosition}
          destinations={destinations}
          clearings={WORLD_INFRASTRUCTURE_CLEARINGS}
          heightAt={terrainHeightAt}
          waterLevel={WATER_LEVEL}
        />
        <ArchiveWildlife playerPosition={playerPosition} heightAt={terrainHeightAt} animalsEnabled={entered} />
        <ArchiveBirdFlock playerPosition={playerPosition} heightAt={terrainHeightAt} />
        <ArchiveCompanionDog
          enabled={entered}
          playerPosition={playerPosition}
          heightAt={terrainHeightAt}
          onProximity={onCompanionProximity}
        />
        <ArchiveAquaticLife enabled={entered} playerPosition={playerPosition} />
        <ArchiveOceanLife enabled={entered} playerPosition={playerPosition} />
      </Suspense>
      <InfiniteWater playerPosition={playerPosition} />
      <FallingPaperSnow playerPosition={playerPosition} />
      <WorldKeepsakes
        enabled={entered}
        playerPosition={playerPosition}
        collected={collectedKeepsakes}
        onCollect={onCollectKeepsake}
      />
      <Suspense fallback={null}>
        <Physics gravity={[0, -14, 0]} timeStep="vary">
          <InfiniteTerrain playerPosition={playerPosition} />
          <ArchiveForestColliders playerPosition={playerPosition} destinations={destinations} />
          <RiverFootbridge />
          <CoastalArchiveHome />
          <FirstPersonExplorer
            enabled={entered}
            destinations={destinations}
            playerPosition={playerPosition}
            travelRequest={travelRequest}
            heightAt={terrainHeightAt}
            waterLevel={WATER_LEVEL}
            onOpen={onOpen}
            onNearby={onNearby}
            onTelemetry={onTelemetry}
          />
        </Physics>
      </Suspense>
    </>
  );
}
