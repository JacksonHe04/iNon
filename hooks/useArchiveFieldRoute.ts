import { useEffect, useMemo, useRef, useState } from 'react';
import type { GameTelemetry } from '@/components/world/archiveGameTypes';
import {
  FIELD_ROUTE_STAGES,
  isFieldRouteStageComplete,
  type FieldRouteStage,
} from '@/components/world/archiveFieldRoute';

export function useArchiveFieldRoute({
  owner,
  telemetry,
  keepsakeCount,
}: {
  owner: string;
  telemetry: GameTelemetry;
  keepsakeCount: number;
}) {
  const storageKey = useMemo(() => `inon-world-field-route-${owner}`, [owner]);
  const [stageIndex, setStageIndex] = useState(0);
  const [ready, setReady] = useState(false);
  const [recentStage, setRecentStage] = useState<FieldRouteStage | null>(null);
  const previousPosition = useRef<[number, number] | null>(null);
  const travelledThisStage = useRef(0);

  useEffect(() => {
    try {
      const saved = Number(window.localStorage.getItem(storageKey));
      if (Number.isInteger(saved)) {
        setStageIndex(Math.min(FIELD_ROUTE_STAGES.length, Math.max(0, saved)));
      }
    } catch {
      // The field route remains playable without persistent storage.
    }
    setReady(true);
  }, [storageKey]);

  useEffect(() => {
    if (!ready) return;
    try {
      window.localStorage.setItem(storageKey, String(stageIndex));
    } catch {
      // Progress persistence is progressive enhancement.
    }
  }, [ready, stageIndex, storageKey]);

  useEffect(() => {
    if (!ready || stageIndex >= FIELD_ROUTE_STAGES.length) return;
    const previous = previousPosition.current;
    const movement = previous
      ? Math.hypot(telemetry.x - previous[0], telemetry.z - previous[1])
      : 0;
    previousPosition.current = [telemetry.x, telemetry.z];
    if (movement > 0.04 && movement < 12) travelledThisStage.current += movement;
    if (travelledThisStage.current < 5) return;
    if (!isFieldRouteStageComplete(stageIndex, telemetry, keepsakeCount)) return;
    setRecentStage(FIELD_ROUTE_STAGES[stageIndex]);
    travelledThisStage.current = 0;
    setStageIndex((current) => current === stageIndex ? current + 1 : current);
  }, [keepsakeCount, ready, stageIndex, telemetry]);

  useEffect(() => {
    if (!recentStage) return;
    const timeout = window.setTimeout(() => setRecentStage(null), 4200);
    return () => window.clearTimeout(timeout);
  }, [recentStage]);

  const restart = () => {
    travelledThisStage.current = 0;
    previousPosition.current = [telemetry.x, telemetry.z];
    setRecentStage(null);
    setStageIndex(0);
  };

  return {
    stageIndex,
    stage: FIELD_ROUTE_STAGES[stageIndex] ?? null,
    recentStage,
    complete: stageIndex >= FIELD_ROUTE_STAGES.length,
    restart,
  };
}
