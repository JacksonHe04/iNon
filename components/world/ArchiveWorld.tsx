'use client';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { ACESFilmicToneMapping, SRGBColorSpace, Vector3 } from 'three';
import type { ReadmeData } from '@/types';
import ArchiveGameScene, { type GameTelemetry, type GameTravelRequest } from '@/components/world/ArchiveGameScene';
import ArchiveSoundscape from '@/components/world/ArchiveSoundscape';
import WorldHud from '@/components/world/WorldHud';
import WorldSatchel from '@/components/world/WorldSatchel';
import {
  INITIAL_WORLD_TELEMETRY,
  OUTDOOR_DESTINATIONS,
  type ArchiveWorldMode,
  type WorldWaypoint,
} from '@/components/world/archiveWorldConfig';
import { WORLD_PLAYER_SPAWN } from '@/components/world/archiveWorldConstants';
import {
  buildHomeExhibits,
  exhibitIdFromInspection,
  type HomeInspectionId,
  type HomeRecordId,
} from '@/components/world/archiveHomeRecords';
import { buildArchiveKeepsakes } from '@/components/world/archiveKeepsakes';
import { buildWorldDialogueContext, type WorldDialogueContext } from '@/components/world/archiveWorldTelemetry';
import { useArchiveFieldRoute } from '@/hooks/useArchiveFieldRoute';
import type { CompanionTelemetry } from '@/components/world/ArchiveCompanionDog';
import { useArchiveResting } from '@/hooks/useArchiveResting';
import { useArchiveWorldClock } from '@/hooks/useArchiveWorldClock';
import { useArchiveForaging } from '@/hooks/useArchiveForaging';
import WorldFieldFeedback from '@/components/world/WorldFieldFeedback';
import { useArchiveWarmth } from '@/hooks/useArchiveWarmth';
import { useArchiveVitality } from '@/hooks/useArchiveVitality';
import { useArchiveSpeciesJournal } from '@/hooks/useArchiveSpeciesJournal';
import ArchiveHomeRecordPanel from '@/components/world/ArchiveHomeRecordPanel';
import ArchiveHomeExhibitPanel from '@/components/world/ArchiveHomeExhibitPanel';
import { useArchiveWorldControls } from '@/hooks/useArchiveWorldControls';

interface ArchiveWorldProps {
  active: boolean;
  data: ReadmeData;
  onModeChange: (
    mode: ArchiveWorldMode,
    context?: WorldDialogueContext,
    persona?: 'owner' | 'companion',
  ) => void;
}
export default function ArchiveWorld({ active, data, onModeChange }: ArchiveWorldProps) {
  const [diagnostics, setDiagnostics] = useState('WebGL initialising');
  const [inventoryOpen, setInventoryOpen] = useState(false);
  const [travelRequest, setTravelRequest] = useState<GameTravelRequest | null>(null);
  const [telemetry, setTelemetry] = useState<GameTelemetry>(INITIAL_WORLD_TELEMETRY);
  const [collectedKeepsakes, setCollectedKeepsakes] = useState<string[]>([]);
  const [lastKeepsake, setLastKeepsake] = useState<string | null>(null);
  const [companionNearby, setCompanionNearby] = useState(false);
  const [companionTelemetry, setCompanionTelemetry] = useState<CompanionTelemetry>({
    x: WORLD_PLAYER_SPAWN[0] + 4,
    y: WORLD_PLAYER_SPAWN[1],
    z: WORLD_PLAYER_SPAWN[2] + 3,
    behavior: 'resting',
  });
  const [selectedHomeRecord, setSelectedHomeRecord] = useState<HomeInspectionId | null>(null);
  const { releasePointerLock, soundEnabled } = useArchiveWorldControls({
    active,
    flying: telemetry.flying,
    setInventoryOpen,
  });
  const playerPosition = useRef(new Vector3(...WORLD_PLAYER_SPAWN));
  const keepsakeStorageKey = `inon-world-keepsakes-${data.basic.name}`;
  const allKeepsakes = useMemo(() => buildArchiveKeepsakes(data), [data]);
  const homeExhibits = useMemo(() => buildHomeExhibits(data), [data]);
  const recoveredKeepsakes = allKeepsakes.filter((record) => collectedKeepsakes.includes(record.id));
  const fieldRoute = useArchiveFieldRoute({
    owner: data.basic.name,
    telemetry,
    keepsakeCount: recoveredKeepsakes.length,
  });
  const lastRecoveredKeepsake = allKeepsakes.find((record) => record.id === lastKeepsake);
  const worldEnabled = active && !inventoryOpen && !selectedHomeRecord;
  const worldClock = useArchiveWorldClock({ owner: data.basic.name, running: worldEnabled });
  const warmth = useArchiveWarmth({ owner: data.basic.name, telemetry, worldTime: worldClock, enabled: worldEnabled });
  const vitality = useArchiveVitality(data.basic.name);
  const speciesJournal = useArchiveSpeciesJournal(data.basic.name);
  const advanceAfterRest = useCallback(() => {
    worldClock.advance(360);
    warmth.restore();
    vitality.restore();
  }, [vitality.restore, warmth.restore, worldClock.advance]);
  const resting = useArchiveResting({
    owner: data.basic.name,
    telemetry,
    enabled: worldEnabled,
    onRested: advanceAfterRest,
    onRationUsed: () => vitality.heal(18),
  });
  const foraging = useArchiveForaging({
    owner: data.basic.name,
    day: worldClock.day,
    clockReady: worldClock.ready,
    telemetry,
    enabled: worldEnabled,
    restSite: resting.restSite,
    onCookRation: resting.addRation,
  });
  const worldDialogueContext = buildWorldDialogueContext({
    telemetry,
    rations: resting.rations,
    companionNearby,
    collectedKeepsakeIds: collectedKeepsakes,
    worldTime: worldClock,
    forageIngredients: foraging.ingredients,
    warmth: warmth.value,
    vitality: vitality.value,
    observedSpeciesIds: speciesJournal.observedIds,
  });

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(keepsakeStorageKey);
      if (saved) setCollectedKeepsakes(JSON.parse(saved) as string[]);
    } catch {
      // Exploration remains available when storage is blocked.
    }
  }, [keepsakeStorageKey]);

  useEffect(() => {
    try {
      window.localStorage.setItem(keepsakeStorageKey, JSON.stringify(collectedKeepsakes));
    } catch {
      // Persistence is progressive enhancement.
    }
  }, [collectedKeepsakes, keepsakeStorageKey]);

  useEffect(() => {
    if (!lastKeepsake) return;
    const timeout = window.setTimeout(() => setLastKeepsake(null), 2400);
    return () => window.clearTimeout(timeout);
  }, [lastKeepsake]);

  useEffect(() => {
    if (telemetry.canMount || telemetry.mounted) speciesJournal.observe('horse');
  }, [speciesJournal.observe, telemetry.canMount, telemetry.mounted]);

  const changeMode = (nextMode: ArchiveWorldMode, persona: 'owner' | 'companion' = 'owner') => {
    releasePointerLock();
    setInventoryOpen(false);
    setSelectedHomeRecord(null);
    onModeChange(nextMode, nextMode === 'dialogue' ? worldDialogueContext : undefined, persona);
  };

  const travelTo = (waypoint: WorldWaypoint) => {
    const request: GameTravelRequest = {
      id: Date.now(),
      position: [...waypoint.arrival],
      yaw: waypoint.yaw,
    };
    setTravelRequest(request);
    window.dispatchEvent(new CustomEvent('archive-world:travel', { detail: request }));
  };

  const collectKeepsake = (id: string) => {
    setCollectedKeepsakes((current) => current.includes(id) ? current : [...current, id]);
    setLastKeepsake(id);
  };

  return (
    <section
      className={`archive-world is-world ${active ? 'is-active' : 'is-background'}`}
      aria-label="iNon 绿迹开放世界"
      aria-hidden={!active}
    >
      <div className="archive-world__canvas">
        <Canvas
          shadows
          frameloop={active ? 'always' : 'never'}
          dpr={[1, 1.35]}
          camera={{ position: [WORLD_PLAYER_SPAWN[0], 3, WORLD_PLAYER_SPAWN[2]], fov: 52, near: 0.1, far: 600 }}
          gl={{ antialias: false, powerPreference: 'high-performance', alpha: false }}
          onCreated={({ gl }) => {
            Object.assign(gl, { toneMapping: ACESFilmicToneMapping, toneMappingExposure: 0.92, outputColorSpace: SRGBColorSpace });
          }}
        >
          <ArchiveGameScene
            entered={worldEnabled}
            worldTime={worldClock}
            warmth={warmth.value}
            vitality={vitality.value}
            destinations={OUTDOOR_DESTINATIONS}
            playerPosition={playerPosition}
            travelRequest={travelRequest}
            onOpen={() => changeMode('archive')}
            onNearby={() => undefined}
            onTelemetry={setTelemetry}
            onDiagnostics={setDiagnostics}
            onCompanionProximity={setCompanionNearby}
            onCompanionTelemetry={setCompanionTelemetry}
            collectedKeepsakes={collectedKeepsakes}
            onCollectKeepsake={collectKeepsake}
            onInspectHomeRecord={(record) => {
              releasePointerLock();
              setSelectedHomeRecord(record);
            }}
            homeExhibits={homeExhibits}
            forageCollectedIds={foraging.collectedIds}
            onFallImpact={vitality.receiveFall}
            onObserveSpecies={speciesJournal.observe}
          />
        </Canvas>
      </div>

      <output className="sr-only" aria-label="3D 运行状态">{diagnostics}</output>
      <output className="sr-only" aria-label="苔苔伙伴状态">
        {companionTelemetry.behavior} · X {companionTelemetry.x.toFixed(1)} · Y {companionTelemetry.y.toFixed(1)} · Z {companionTelemetry.z.toFixed(1)}
      </output>
      <div className="archive-world__grain" aria-hidden="true" />
      <div className="archive-world__vignette" aria-hidden="true" />
      <ArchiveSoundscape enabled={soundEnabled} active={active} telemetry={telemetry} />

      {active && !selectedHomeRecord && (
        <WorldHud
          telemetry={telemetry}
          companionNearby={companionNearby}
          companionTelemetry={companionTelemetry}
          fieldRouteStage={fieldRoute.stage}
          fieldRouteStageIndex={fieldRoute.stageIndex}
          recentFieldRouteStage={fieldRoute.recentStage}
          restSite={resting.restSite}
          worldTime={worldClock}
          warmth={warmth.value}
          warmthLabel={warmth.label}
          warmthSource={warmth.source}
          vitality={vitality.value}
          vitalityLabel={vitality.label}
          observedSpeciesCount={speciesJournal.observedIds.length}
          foragePatch={foraging.nearbyPatch}
          forageIngredients={foraging.ingredients}
          cookSite={foraging.cookSite}
          onRest={resting.rest}
          onGather={foraging.gather}
          onCook={foraging.cook}
          onTravel={travelTo}
          onTalkToCompanion={() => changeMode('dialogue', 'companion')}
        />
      )}

      {active && selectedHomeRecord && (() => {
        const exhibitId = exhibitIdFromInspection(selectedHomeRecord);
        const exhibit = exhibitId ? homeExhibits.find((item) => item.id === exhibitId) : null;
        if (exhibit) {
          return <ArchiveHomeExhibitPanel exhibit={exhibit} onClose={() => setSelectedHomeRecord(null)} />;
        }
        if (!exhibitId) {
          return (
            <ArchiveHomeRecordPanel
              data={data}
              recordId={selectedHomeRecord as HomeRecordId}
              onClose={() => setSelectedHomeRecord(null)}
            />
          );
        }
        return null;
      })()}

      {inventoryOpen && (
        <WorldSatchel
          rations={resting.rations}
          keepsakes={recoveredKeepsakes}
          fieldRouteStageIndex={fieldRoute.stageIndex}
          forageIngredients={foraging.ingredients}
          vitality={vitality.value}
          observedSpeciesIds={speciesJournal.observedIds}
          onClose={() => setInventoryOpen(false)}
          onRestartRoute={fieldRoute.restart}
          onUseRation={resting.useRation}
        />
      )}

      <WorldFieldFeedback
        active={active}
        lastKeepsake={lastRecoveredKeepsake}
        keepsakeCount={collectedKeepsakes.length}
        restFeedback={resting.feedback}
        forageFeedback={foraging.feedback}
        forageIngredients={foraging.ingredients}
        vitalityFeedback={vitality.feedback}
        lastObservedSpecies={speciesJournal.lastObserved}
      />
    </section>
  );
}
