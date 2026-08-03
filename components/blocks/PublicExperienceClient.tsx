'use client';

import dynamic from 'next/dynamic';
import { useCallback, useEffect, useState, type ReactNode } from 'react';
import type { ReadmeData } from '@/types';
import ArchiveAtmosphere from '@/components/archive/ArchiveAtmosphere';
import type { ArchiveWorldMode } from '@/components/world/archiveWorldConfig';
import type { WorldDialogueContext } from '@/components/world/archiveWorldTelemetry';
import { useUniversalTopNav } from '@/components/nav/useUniversalTopNav';

const loadArchiveWorld = () => import('@/components/world/ArchiveWorld');

const ArchiveWorld = dynamic(loadArchiveWorld, {
  ssr: false,
  loading: () => (
    <div className="archive-world-loading">
      <span />
      <p>正在生成绿迹世界坐标……</p>
    </div>
  ),
});

const ArchiveDialoguePanel = dynamic(() => import('@/components/world/ArchiveDialoguePanel'), {
  ssr: false,
  loading: () => (
    <div className="archive-world-loading">
      <span />
      <p>正在接通林间电台……</p>
    </div>
  ),
});

const INITIAL_DIALOGUE_CONTEXT: WorldDialogueContext = {
  location: '灰绿海岸',
  motion: '驻足',
  x: -13,
  y: 1.5,
  z: 32,
  heading: 0,
  stamina: 100,
  rations: 0,
  day: 1,
  clockLabel: '07:30',
  phaseLabel: '清晨',
  forageIngredients: 0,
  warmth: 84,
  warmthLabel: '温暖',
  vitality: 100,
  vitalityLabel: '安好',
  companionNearby: false,
  collectedKeepsakeIds: [],
  observedSpeciesIds: [],
};

interface PublicExperienceClientProps {
  archive: ReactNode;
  data: ReadmeData;
}

export default function PublicExperienceClient({
  archive,
  data,
}: PublicExperienceClientProps) {
  const [mode, setMode] = useState<ArchiveWorldMode>('archive');
  const [worldRequested, setWorldRequested] = useState(false);
  const [dialoguePersona, setDialoguePersona] = useState<'owner' | 'companion'>('owner');
  const [dialogueContext, setDialogueContext] = useState(INITIAL_DIALOGUE_CONTEXT);
  const setExperience = useUniversalTopNav((state) => state.setExperience);

  const changeMode = useCallback((nextMode: ArchiveWorldMode) => {
    if (nextMode === 'world') setWorldRequested(true);
    if (nextMode === 'dialogue') setDialoguePersona('owner');
    setMode(nextMode);
  }, []);

  useEffect(() => {
    const requestedMode = new URLSearchParams(window.location.search).get('mode');
    if (requestedMode === 'world' || requestedMode === 'archive' || requestedMode === 'dialogue') {
      changeMode(requestedMode);
    }
  }, [changeMode]);

  useEffect(() => {
    setExperience({ mode, onModeChange: changeMode });
    return () => setExperience(null);
  }, [changeMode, mode, setExperience]);

  return (
    <section className="public-experience" aria-label="iNon 个人公开空间">
      {mode === 'archive' ? <ArchiveAtmosphere profile /> : null}
      {worldRequested ? (
        <ArchiveWorld
          active={mode === 'world'}
          data={data}
          onModeChange={(nextMode, context, persona = 'owner') => {
            if (context) setDialogueContext(context);
            setDialoguePersona(persona);
            setMode(nextMode);
          }}
        />
      ) : mode === 'world' ? (
        <div className="archive-world-loading">
          <span />
          <p>正在生成绿迹世界坐标……</p>
        </div>
      ) : null}

      {mode === 'archive' ? archive : null}
      {mode === 'dialogue' ? (
        <ArchiveDialoguePanel data={data} persona={dialoguePersona} worldContext={dialogueContext} />
      ) : null}
    </section>
  );
}
