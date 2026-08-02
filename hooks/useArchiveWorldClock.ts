import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { WORLD_TIME_START, worldTimeSnapshot } from '@/components/world/archiveWorldTime';

export function useArchiveWorldClock({ owner, running }: { owner: string; running: boolean }) {
  const storageKey = useMemo(() => `inon-world-time-${owner}`, [owner]);
  const [totalMinutes, setTotalMinutes] = useState(WORLD_TIME_START);
  const totalMinutesRef = useRef(WORLD_TIME_START);

  useEffect(() => {
    let saved = WORLD_TIME_START;
    try {
      const stored = window.localStorage.getItem(storageKey);
      const parsed = stored === null ? null : Number(stored);
      if (parsed !== null && Number.isInteger(parsed) && parsed >= 0) saved = parsed;
    } catch {
      // Start at dawn when persistent storage is unavailable.
    }
    totalMinutesRef.current = saved;
    setTotalMinutes(saved);
  }, [storageKey]);

  const addMinutes = useCallback((minutes: number, forcePersist = false) => {
    const next = totalMinutesRef.current + Math.max(0, Math.floor(minutes));
    totalMinutesRef.current = next;
    setTotalMinutes(next);
    if (!forcePersist && next % 5 !== 0) return;
    try {
      window.localStorage.setItem(storageKey, String(next));
    } catch {
      // The world clock still runs when persistence is unavailable.
    }
  }, [storageKey]);

  useEffect(() => {
    if (!running) return;
    const interval = window.setInterval(() => addMinutes(1, false), 1000);
    return () => window.clearInterval(interval);
  }, [addMinutes, running]);

  const advance = useCallback((minutes: number) => addMinutes(minutes, true), [addMinutes]);
  return { ...worldTimeSnapshot(totalMinutes), advance };
}
