'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import {
  ACESFilmicToneMapping,
  SRGBColorSpace,
  Vector3,
} from 'three';
import type { ReadmeData } from '@/types';
import type { LayoutConfig } from '@/types/layout';
import { DEFAULT_LAYOUT_CONFIG } from '@/lib/content/default-layout';
import ArchiveGameScene, {
  type GameTelemetry,
  type GameTravelRequest,
} from '@/components/world/ArchiveGameScene';
import ArchiveCodexPanel from '@/components/world/ArchiveCodexPanel';
import ArchiveDialoguePanel from '@/components/world/ArchiveDialoguePanel';
import ArchiveHomeRecordPanel from '@/components/world/ArchiveHomeRecordPanel';
import ArchiveSoundscape from '@/components/world/ArchiveSoundscape';
import WorldHud from '@/components/world/WorldHud';
import WorldModeSwitch from '@/components/world/WorldModeSwitch';
import WorldSatchel from '@/components/world/WorldSatchel';
import {
  INITIAL_WORLD_TELEMETRY,
  OUTDOOR_DESTINATIONS,
  type ArchiveWorldMode,
  type WorldWaypoint,
} from '@/components/world/archiveWorldConfig';
import { WORLD_PLAYER_SPAWN } from '@/components/world/archiveWorldConstants';
import type { HomeRecordId } from '@/components/world/archiveHomeRecords';
import { buildArchiveKeepsakes } from '@/components/world/archiveKeepsakes';

interface ArchiveWorldProps {
  data: ReadmeData;
  layoutConfig?: LayoutConfig;
}

export default function ArchiveWorld({ data, layoutConfig }: ArchiveWorldProps) {
  const [mode, setMode] = useState<ArchiveWorldMode>('world');
  const [diagnostics, setDiagnostics] = useState('WebGL initialising');
  const [inventoryOpen, setInventoryOpen] = useState(false);
  const [travelRequest, setTravelRequest] = useState<GameTravelRequest | null>(null);
  const [telemetry, setTelemetry] = useState<GameTelemetry>(INITIAL_WORLD_TELEMETRY);
  const [rations, setRations] = useState(3);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [collectedKeepsakes, setCollectedKeepsakes] = useState<string[]>([]);
  const [lastKeepsake, setLastKeepsake] = useState<string | null>(null);
  const [companionNearby, setCompanionNearby] = useState(false);
  const [dialoguePersona, setDialoguePersona] = useState<'owner' | 'companion'>('owner');
  const [selectedHomeRecord, setSelectedHomeRecord] = useState<HomeRecordId | null>(null);
  const playerPosition = useRef(new Vector3(...WORLD_PLAYER_SPAWN));
  const config = layoutConfig ?? DEFAULT_LAYOUT_CONFIG;
  const keepsakeStorageKey = `inon-world-keepsakes-${data.basic.name}`;
  const allKeepsakes = useMemo(() => buildArchiveKeepsakes(data), [data]);
  const recoveredKeepsakes = allKeepsakes.filter((record) => collectedKeepsakes.includes(record.id));
  const lastRecoveredKeepsake = allKeepsakes.find((record) => record.id === lastKeepsake);
  const worldEnabled = mode === 'world' && !inventoryOpen && !selectedHomeRecord;

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
    const toggleInventory = (event: KeyboardEvent) => {
      if (event.code !== 'KeyB' || mode !== 'world') return;
      setInventoryOpen((open) => !open);
    };
    window.addEventListener('keydown', toggleInventory);
    return () => window.removeEventListener('keydown', toggleInventory);
  }, [mode]);

  useEffect(() => {
    const toggleSound = (event: KeyboardEvent) => {
      if (event.code !== 'KeyM' || event.repeat || mode !== 'world') return;
      setSoundEnabled((enabled) => !enabled);
    };
    window.addEventListener('keydown', toggleSound);
    return () => window.removeEventListener('keydown', toggleSound);
  }, [mode]);

  const releasePointerLock = () => {
    if (document.pointerLockElement) document.exitPointerLock();
  };

  const changeMode = (nextMode: ArchiveWorldMode, persona: 'owner' | 'companion' = 'owner') => {
    releasePointerLock();
    setInventoryOpen(false);
    setSelectedHomeRecord(null);
    if (nextMode === 'dialogue') setDialoguePersona(persona);
    setMode(nextMode);
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
    <section className={`archive-world is-${mode}`} aria-label="iNon 绿迹开放世界">
      <div className={`archive-world__canvas ${mode === 'world' ? '' : 'is-inactive'}`} aria-hidden={mode !== 'world'}>
        <Canvas
          shadows
          dpr={[1, 1.5]}
          camera={{ position: [WORLD_PLAYER_SPAWN[0], 3, WORLD_PLAYER_SPAWN[2]], fov: 52, near: 0.1, far: 600 }}
          gl={{ antialias: false, powerPreference: 'high-performance', alpha: false }}
          onCreated={({ gl }) => {
            gl.toneMapping = ACESFilmicToneMapping;
            gl.toneMappingExposure = 0.92;
            gl.outputColorSpace = SRGBColorSpace;
          }}
        >
          <ArchiveGameScene
            entered={worldEnabled}
            destinations={OUTDOOR_DESTINATIONS}
            playerPosition={playerPosition}
            travelRequest={travelRequest}
            onOpen={() => changeMode('archive')}
            onNearby={() => undefined}
            onTelemetry={setTelemetry}
            onDiagnostics={setDiagnostics}
            onCompanionProximity={setCompanionNearby}
            collectedKeepsakes={collectedKeepsakes}
            onCollectKeepsake={collectKeepsake}
            onInspectHomeRecord={(record) => {
              releasePointerLock();
              setSelectedHomeRecord(record);
            }}
          />
        </Canvas>
      </div>

      <output className="sr-only" aria-label="3D 运行状态">{diagnostics}</output>
      <div className="archive-world__grain" aria-hidden="true" />
      <div className="archive-world__vignette" aria-hidden="true" />
      <ArchiveSoundscape enabled={soundEnabled} active={mode === 'world'} telemetry={telemetry} />
      <WorldModeSwitch mode={mode} onChange={changeMode} />

      {mode === 'world' && !selectedHomeRecord && (
        <WorldHud
          owner={data.basic.name}
          telemetry={telemetry}
          keepsakes={recoveredKeepsakes.length}
          soundEnabled={soundEnabled}
          companionNearby={companionNearby}
          onToggleSound={() => setSoundEnabled((enabled) => !enabled)}
          onOpenInventory={() => {
            releasePointerLock();
            setInventoryOpen(true);
          }}
          onTravel={travelTo}
          onTalkToCompanion={() => changeMode('dialogue', 'companion')}
        />
      )}

      {mode === 'archive' && <ArchiveCodexPanel data={data} layoutConfig={config} />}
      {mode === 'dialogue' && <ArchiveDialoguePanel data={data} persona={dialoguePersona} />}

      {mode === 'world' && selectedHomeRecord && (
        <ArchiveHomeRecordPanel
          data={data}
          recordId={selectedHomeRecord}
          onClose={() => setSelectedHomeRecord(null)}
        />
      )}

      {inventoryOpen && (
        <WorldSatchel
          rations={rations}
          keepsakes={recoveredKeepsakes}
          onClose={() => setInventoryOpen(false)}
          onUseRation={() => {
            if (rations <= 0) return;
            setRations((current) => Math.max(0, current - 1));
            window.dispatchEvent(new Event('archive-world:restore-stamina'));
          }}
        />
      )}

      {lastKeepsake && mode === 'world' && (
        <div className="archive-world-keepsake-toast" role="status">
          <span>FIELD PAGE RECOVERED</span>
          <strong>{lastRecoveredKeepsake?.text ?? '拾得一卷田野札记'}</strong>
          <small>{lastRecoveredKeepsake?.kind ?? 'FIELD NOTE'} · {collectedKeepsakes.length}</small>
        </div>
      )}
    </section>
  );
}
