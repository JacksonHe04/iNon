import { useCallback, useEffect, useMemo, useState } from 'react';
import type { GameTelemetry } from '@/components/world/archiveGameTypes';
import { nearestWorldRestSite, type WorldRestSite } from '@/components/world/archiveWorldRest';

export interface RestFeedback {
  site: WorldRestSite;
  status: 'rested' | 'missing-ration';
}

export function useArchiveResting({
  owner,
  telemetry,
  enabled,
  onRested,
}: {
  owner: string;
  telemetry: GameTelemetry;
  enabled: boolean;
  onRested?: () => void;
}) {
  const storageKey = useMemo(() => `inon-world-rations-${owner}`, [owner]);
  const [rations, setRations] = useState(3);
  const [ready, setReady] = useState(false);
  const [feedback, setFeedback] = useState<RestFeedback | null>(null);
  const restSite = nearestWorldRestSite(telemetry);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(storageKey);
      const saved = stored === null ? null : Number(stored);
      if (saved !== null && Number.isInteger(saved) && saved >= 0 && saved <= 99) setRations(saved);
    } catch {
      // Resting still works when persistent storage is unavailable.
    }
    setReady(true);
  }, [storageKey]);

  useEffect(() => {
    if (!ready) return;
    try {
      window.localStorage.setItem(storageKey, String(rations));
    } catch {
      // Supply persistence is progressive enhancement.
    }
  }, [rations, ready, storageKey]);

  useEffect(() => {
    if (!feedback) return;
    const timeout = window.setTimeout(() => setFeedback(null), 3200);
    return () => window.clearTimeout(timeout);
  }, [feedback]);

  const restoreStamina = () => window.dispatchEvent(new Event('archive-world:restore-stamina'));
  const rest = useCallback(() => {
    if (!restSite) return;
    if (rations < restSite.rationCost) {
      setFeedback({ site: restSite, status: 'missing-ration' });
      return;
    }
    if (restSite.rationCost) setRations((current) => current - restSite.rationCost);
    restoreStamina();
    onRested?.();
    setFeedback({ site: restSite, status: 'rested' });
  }, [onRested, rations, restSite]);

  const useRation = useCallback(() => {
    if (rations <= 0) return;
    setRations((current) => Math.max(0, current - 1));
    restoreStamina();
  }, [rations]);
  const addRation = useCallback(() => setRations((current) => Math.min(99, current + 1)), []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!enabled || event.code !== 'KeyR' || event.repeat) return;
      rest();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [enabled, rest]);

  return { rations, restSite, feedback, rest, useRation, addRation };
}
