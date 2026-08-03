'use client';

import { useEffect, useRef } from 'react';
import type { GameTelemetry } from '@/components/world/archiveGameTypes';
import { coastlineXAt, riverCenterAt } from '@/components/world/archiveTerrainMath';
import { isInsideArchiveHome } from '@/components/world/archiveWorldZones';

const FOREST_TRACK = '/archive-world/ambient-audio/forest-ambience-source.ogg';
const WATER_TRACK = '/archive-world/ambient-audio/water-ambience-source.mp3';

function proximity(distance: number, radius: number) {
  return Math.max(0, Math.min(1, 1 - distance / radius));
}

export default function ArchiveSoundscape({
  enabled,
  active,
  telemetry,
}: {
  enabled: boolean;
  active: boolean;
  telemetry: GameTelemetry;
}) {
  const forest = useRef<HTMLAudioElement>(null);
  const water = useRef<HTMLAudioElement>(null);
  const targets = useRef({ forest: 0, water: 0 });
  const shouldPlay = enabled && active;

  useEffect(() => {
    const shoreDistance = Math.abs(telemetry.x - coastlineXAt(telemetry.z));
    const riverDistance = Math.abs(telemetry.x - riverCenterAt(telemetry.z));
    const waterPresence = Math.max(
      proximity(shoreDistance, 54),
      proximity(riverDistance, 20) * 0.72,
    );
    const outdoorMix = isInsideArchiveHome(telemetry.x, telemetry.z) ? 0.3 : 1;
    targets.current = shouldPlay
      ? {
          forest: (0.14 + (1 - waterPresence) * 0.12) * outdoorMix,
          water: Math.min(0.42, waterPresence * 0.34 + (telemetry.inWater ? 0.08 : 0)) * outdoorMix,
        }
      : { forest: 0, water: 0 };
  }, [shouldPlay, telemetry.inWater, telemetry.x, telemetry.z]);

  useEffect(() => {
    if (!shouldPlay) {
      forest.current?.pause();
      water.current?.pause();
      return;
    }
    void forest.current?.play().catch(() => undefined);
    void water.current?.play().catch(() => undefined);
  }, [shouldPlay]);

  useEffect(() => {
    const settle = (audio: HTMLAudioElement | null) => {
      if (!audio) return;
      audio.volume = 0;
      audio.dataset.mix = '0.000';
    };
    if (!shouldPlay) {
      settle(forest.current);
      settle(water.current);
      return;
    }
    let frame = 0;
    const mix = () => {
      if (forest.current) {
        forest.current.volume += (targets.current.forest - forest.current.volume) * 0.035;
        forest.current.dataset.mix = forest.current.volume.toFixed(3);
      }
      if (water.current) {
        water.current.volume += (targets.current.water - water.current.volume) * 0.035;
        water.current.dataset.mix = water.current.volume.toFixed(3);
      }
      frame = window.requestAnimationFrame(mix);
    };
    frame = window.requestAnimationFrame(mix);
    return () => window.cancelAnimationFrame(frame);
  }, [shouldPlay]);

  return (
    <div hidden aria-hidden="true">
      <audio ref={forest} src={FOREST_TRACK} loop preload="none" />
      <audio ref={water} src={WATER_TRACK} loop preload="none" />
    </div>
  );
}
