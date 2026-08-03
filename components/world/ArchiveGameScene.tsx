'use client';

import { lazy, memo, Suspense, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Physics } from '@react-three/rapier';
import { InstancedMesh, Mesh } from 'three';
import FirstPersonExplorer from '@/components/world/FirstPersonExplorer';
import QuaterniusForest from '@/components/world/QuaterniusForest';
import QuaterniusGroundCover from '@/components/world/QuaterniusGroundCover';
import ArchiveWildlife from '@/components/world/ArchiveWildlife';
import ArchiveBirdFlock from '@/components/world/ArchiveBirdFlock';
import ArchiveCompanionDog from '@/components/world/ArchiveCompanionDog';
import ArchiveOceanLife from '@/components/world/ArchiveOceanLife';
import ArchivePollinators from '@/components/world/ArchivePollinators';
import ArchiveCoastalLife from '@/components/world/ArchiveCoastalLife';
import ArchiveForestColliders from '@/components/world/ArchiveForestColliders';
import { FallingPaperSnow, WorldKeepsakes } from '@/components/world/ArchiveAtmosphere';
import { InfiniteTerrain, InfiniteWater, MountainPanorama } from '@/components/world/ArchiveTerrain';
import { CoastalArchiveHome, RiverFootbridge } from '@/components/world/ArchiveWorldStructures';
import ArchiveHomeGrounds from '@/components/world/ArchiveHomeGrounds';
import ArchiveWildernessLandmarks from '@/components/world/ArchiveWildernessLandmarks';
import {
  WATER_LEVEL,
  WORLD_INFRASTRUCTURE_CLEARINGS,
} from '@/components/world/archiveWorldConstants';
import { terrainHeightAt } from '@/components/world/archiveTerrainMath';
import type { ArchiveGameSceneProps } from '@/components/world/archiveGameTypes';
import ArchiveWorldLighting from '@/components/world/ArchiveWorldLighting';
import ArchiveForagePatches from '@/components/world/ArchiveForagePatches';
import { useArchiveWorldRegions } from '@/components/world/useArchiveWorldRegions';

const ArchiveAquaticLife = lazy(() => import('@/components/world/ArchiveAquaticLife'));

export type {
  ArchiveGameSceneProps,
  GameDestination,
  GameTelemetry,
  GameTravelRequest,
} from '@/components/world/archiveGameTypes';
export {
  RIVER_BRIDGE_POSITION,
  WORLD_HOME_POSITION,
  WORLD_MOUNTAIN_SUMMIT_POSITION,
  WORLD_TIDAL_COVE_POSITION,
  WORLD_KEEPSAKE_COUNT,
} from '@/components/world/archiveWorldConstants';
export { terrainHeightAt } from '@/components/world/archiveTerrainMath';

function Diagnostics({ onReport }: { onReport: (message: string) => void }) {
  const frames = useRef(0);
  useFrame(({ gl, scene, camera }) => {
    frames.current += 1;
    if (frames.current !== 120 && frames.current % 420 !== 0) return;
    const context = gl.getContext();
    const renderList = gl.renderLists.get(scene, 0);
    const rootCounts = new Map<string, number>();
    const rootTriangles = new Map<string, number>();
    [...renderList.opaque, ...renderList.transmissive, ...renderList.transparent].forEach(({ object }) => {
      let root = object;
      while (root.parent && root.parent !== scene) root = root.parent;
      const label = root.name || root.type;
      rootCounts.set(label, (rootCounts.get(label) ?? 0) + 1);
      if (object instanceof Mesh) {
        const elements = object.geometry.index?.count ?? object.geometry.attributes.position?.count ?? 0;
        const instances = object instanceof InstancedMesh ? object.count : 1;
        rootTriangles.set(label, (rootTriangles.get(label) ?? 0) + Math.floor(elements / 3) * instances);
      }
    });
    const busiestRoots = [...rootCounts.entries()]
      .sort((left, right) => right[1] - left[1])
      .slice(0, 4)
      .map(([label, count]) => `${label}:${count}`)
      .join(',');
    const heaviestRoots = [...rootTriangles.entries()]
      .sort((left, right) => right[1] - left[1])
      .slice(0, 4)
      .map(([label, triangles]) => `${label}:${Math.round(triangles / 1000)}k`)
      .join(',');
    onReport([
      context.isContextLost() ? 'WebGL context lost' : 'WebGL live',
      `${gl.info.render.calls} draw calls`,
      `${gl.info.render.triangles} triangles`,
      `${scene.children.length} scene nodes`,
      `main ${busiestRoots}`,
      `heavy ${heaviestRoots}`,
      `camera ${camera.position.toArray().map((value) => value.toFixed(1)).join('/')}`,
    ].join(' · '));
  });
  return null;
}

function ArchiveGameScene({
  entered,
  worldTime,
  warmth,
  vitality,
  destinations,
  playerPosition,
  travelRequest,
  onOpen,
  onNearby,
  onTelemetry,
  onDiagnostics,
  onCompanionProximity,
  onCompanionTelemetry,
  collectedKeepsakes,
  onCollectKeepsake,
  onInspectHomeRecord,
  homeExhibits,
  forageCollectedIds,
  onFallImpact,
  onObserveSpecies,
}: ArchiveGameSceneProps) {
  const regions = useArchiveWorldRegions(playerPosition);
  return (
    <>
      <ArchiveWorldLighting worldTime={worldTime} />
      <Diagnostics onReport={onDiagnostics} />
      <Suspense fallback={null}>
        <MountainPanorama playerPosition={playerPosition} worldTime={worldTime} />
      </Suspense>
      <Suspense fallback={null}>
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
        <ArchiveForagePatches collectedIds={forageCollectedIds} />
      </Suspense>
      <Suspense fallback={null}>
        <ArchiveWildlife
          playerPosition={playerPosition}
          heightAt={terrainHeightAt}
          animalsEnabled={entered}
          onObserveSpecies={onObserveSpecies}
        />
        <ArchiveBirdFlock
          enabled={entered}
          playerPosition={playerPosition}
          heightAt={terrainHeightAt}
          onObserveSpecies={onObserveSpecies}
        />
        <ArchivePollinators
          enabled={entered}
          playerPosition={playerPosition}
          heightAt={terrainHeightAt}
          onObserveSpecies={onObserveSpecies}
        />
        <ArchiveCompanionDog
          enabled={entered}
          playerPosition={playerPosition}
          heightAt={terrainHeightAt}
          onProximity={onCompanionProximity}
          onTelemetry={onCompanionTelemetry}
        />
      </Suspense>
      <Suspense fallback={null}>
        {regions.river && (
          <ArchiveAquaticLife enabled={entered} playerPosition={playerPosition} onObserveSpecies={onObserveSpecies} />
        )}
        {regions.coast && (
          <>
            <ArchiveOceanLife enabled={entered} playerPosition={playerPosition} onObserveSpecies={onObserveSpecies} />
            <ArchiveCoastalLife enabled={entered} playerPosition={playerPosition} onObserveSpecies={onObserveSpecies} />
          </>
        )}
      </Suspense>
      <InfiniteWater playerPosition={playerPosition} />
      <Suspense fallback={null}>
        <FallingPaperSnow playerPosition={playerPosition} />
      </Suspense>
      <Suspense fallback={null}>
        <WorldKeepsakes
          enabled={entered}
          playerPosition={playerPosition}
          collected={collectedKeepsakes}
          onCollect={onCollectKeepsake}
        />
      </Suspense>
      <Suspense fallback={null}>
        <Physics gravity={[0, -14, 0]} timeStep="vary">
          <Suspense fallback={null}>
            <InfiniteTerrain playerPosition={playerPosition} />
          </Suspense>
          <ArchiveForestColliders playerPosition={playerPosition} destinations={destinations} />
          <Suspense fallback={null}>
            {regions.bridge && <RiverFootbridge />}
            {regions.home && <ArchiveHomeGrounds />}
            <ArchiveWildernessLandmarks mountain={regions.mountain} tidalCove={regions.tidalCove} />
            {regions.home && (
              <CoastalArchiveHome
                playerPosition={playerPosition}
                onInspect={onInspectHomeRecord}
                exhibits={homeExhibits}
              />
            )}
          </Suspense>
          <FirstPersonExplorer
            enabled={entered}
            warmth={warmth}
            vitality={vitality}
            destinations={destinations}
            playerPosition={playerPosition}
            travelRequest={travelRequest}
            heightAt={terrainHeightAt}
            waterLevel={WATER_LEVEL}
            onOpen={onOpen}
            onNearby={onNearby}
            onTelemetry={onTelemetry}
            onFallImpact={onFallImpact}
          />
        </Physics>
      </Suspense>
    </>
  );
}

function sceneInputsAreEqual(previous: ArchiveGameSceneProps, next: ArchiveGameSceneProps) {
  return previous.entered === next.entered
    && previous.worldTime.totalMinutes === next.worldTime.totalMinutes
    && previous.warmth === next.warmth
    && previous.vitality === next.vitality
    && previous.destinations === next.destinations
    && previous.playerPosition === next.playerPosition
    && previous.travelRequest === next.travelRequest
    && previous.collectedKeepsakes === next.collectedKeepsakes
    && previous.homeExhibits === next.homeExhibits
    && previous.forageCollectedIds === next.forageCollectedIds;
}

export default memo(ArchiveGameScene, sceneInputsAreEqual);
