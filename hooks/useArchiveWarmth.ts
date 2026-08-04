import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { GameTelemetry } from '@/components/world/archiveGameTypes';
import type { WorldTimeSnapshot } from '@/components/world/archiveWorldTime';
import { worldWarmthLabel, worldWarmthState } from '@/components/world/archiveWorldWarmth';

const INITIAL_WARMTH = 84;

export function useArchiveWarmth({
  owner, telemetry, worldTime, enabled,
}: {
  owner: string;
  telemetry: GameTelemetry;
  worldTime: WorldTimeSnapshot;
  enabled: boolean;
}) {
  const storageKey = useMemo(() => `inon-world-warmth-${owner}`, [owner]);
  const [warmth, setWarmth] = useState(INITIAL_WARMTH);
  const [ready, setReady] = useState(false);
  const warmthRef = useRef(INITIAL_WARMTH);
  const climate = worldWarmthState(telemetry, worldTime, warmth);
  const climateRef = useRef(climate);
  const persistTick = useRef(0);
  const persistedWarmth = useRef<number | null>(null);
  climateRef.current = climate;

  const update = useCallback((next: number, persist = false) => {
    const safe = Math.max(0, Math.min(100, Math.round(next * 10) / 10));
    if (safe !== warmthRef.current) {
      warmthRef.current = safe;
      setWarmth(safe);
    }
    if (!persist || persistedWarmth.current === safe) return;
    persistedWarmth.current = safe;
    try { window.localStorage.setItem(storageKey, String(safe)); } catch { /* Keep warmth in memory. */ }
  }, [storageKey]);

  useEffect(() => {
    setReady(false);
    let saved = INITIAL_WARMTH;
    try {
      const stored = window.localStorage.getItem(storageKey);
      const parsed = stored === null ? null : Number(stored);
      if (parsed !== null && Number.isFinite(parsed) && parsed >= 0 && parsed <= 100) saved = parsed;
    } catch { /* Begin comfortably warm. */ }
    update(saved);
    setReady(true);
  }, [storageKey, update]);

  useEffect(() => {
    if (!enabled || !ready) return;
    const interval = window.setInterval(() => {
      persistTick.current += 1;
      update(warmthRef.current + climateRef.current.rate, persistTick.current % 5 === 0);
    }, 1000);
    return () => window.clearInterval(interval);
  }, [enabled, ready, update]);

  const restore = useCallback(() => update(100, true), [update]);
  return { value: warmth, label: worldWarmthLabel(warmth), source: climate.source, rate: climate.rate, restore };
}
