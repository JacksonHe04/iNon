import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { fallDamageForImpact, worldVitalityLabel } from '@/components/world/archiveWorldVitality';

export interface VitalityFeedback {
  damage: number;
  impactSpeed: number;
}

export function useArchiveVitality(owner: string) {
  const storageKey = useMemo(() => `inon-world-vitality-${owner}`, [owner]);
  const [value, setValue] = useState(100);
  const [feedback, setFeedback] = useState<VitalityFeedback | null>(null);
  const valueRef = useRef(100);

  const update = useCallback((next: number) => {
    const safe = Math.max(1, Math.min(100, Math.round(next)));
    valueRef.current = safe;
    setValue(safe);
    try { window.localStorage.setItem(storageKey, String(safe)); } catch { /* Keep vitality in memory. */ }
  }, [storageKey]);

  useEffect(() => {
    let saved = 100;
    try {
      const stored = window.localStorage.getItem(storageKey);
      const parsed = stored === null ? null : Number(stored);
      if (parsed !== null && Number.isInteger(parsed) && parsed >= 1 && parsed <= 100) saved = parsed;
    } catch { /* Begin uninjured. */ }
    update(saved);
  }, [storageKey, update]);

  useEffect(() => {
    if (!feedback) return;
    const timeout = window.setTimeout(() => setFeedback(null), 3600);
    return () => window.clearTimeout(timeout);
  }, [feedback]);

  const receiveFall = useCallback((impactSpeed: number, mounted: boolean) => {
    const damage = fallDamageForImpact(impactSpeed, mounted);
    if (!damage) return;
    update(valueRef.current - damage);
    setFeedback({ damage, impactSpeed });
  }, [update]);
  const heal = useCallback((amount: number) => update(valueRef.current + amount), [update]);
  const restore = useCallback(() => update(100), [update]);

  return { value, label: worldVitalityLabel(value), feedback, receiveFall, heal, restore };
}
