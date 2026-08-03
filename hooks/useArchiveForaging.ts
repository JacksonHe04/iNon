import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { GameTelemetry } from '@/components/world/archiveGameTypes';
import type { WorldRestSite } from '@/components/world/archiveWorldRest';
import {
  FORAGE_RECIPE_COST,
  WORLD_FORAGE_PATCHES,
  nearestForagePatch,
  type WorldForagePatch,
} from '@/components/world/archiveWorldForage';

const FORAGE_PATCH_IDS = new Set(WORLD_FORAGE_PATCHES.map((patch) => patch.id));

interface ForageState { ingredients: number; collectedDay: number; collectedIds: string[] }
export interface ForageFeedback {
  status: 'gathered' | 'cooked' | 'missing-ingredients';
  patch?: WorldForagePatch;
}

export function useArchiveForaging({
  owner, day, clockReady, telemetry, enabled, restSite, onCookRation,
}: {
  owner: string;
  day: number;
  clockReady: boolean;
  telemetry: GameTelemetry;
  enabled: boolean;
  restSite: WorldRestSite | null;
  onCookRation: () => void;
}) {
  const storageKey = useMemo(() => `inon-world-forage-${owner}`, [owner]);
  const [state, setState] = useState<ForageState>({ ingredients: 0, collectedDay: day, collectedIds: [] });
  const stateRef = useRef(state);
  const [feedback, setFeedback] = useState<ForageFeedback | null>(null);

  const save = useCallback((next: ForageState) => {
    stateRef.current = next;
    setState(next);
    try { window.localStorage.setItem(storageKey, JSON.stringify(next)); } catch { /* Keep foraging in memory. */ }
  }, [storageKey]);

  useEffect(() => {
    if (!clockReady) return;
    let next: ForageState = { ingredients: 0, collectedDay: day, collectedIds: [] };
    try {
      const stored = JSON.parse(window.localStorage.getItem(storageKey) ?? 'null') as Partial<ForageState> | null;
      if (stored) {
        const storedIngredients = typeof stored.ingredients === 'number' && Number.isInteger(stored.ingredients)
          ? stored.ingredients
          : 0;
        next = {
          ingredients: Math.max(0, Math.min(99, storedIngredients)),
          collectedDay: day,
          collectedIds: stored.collectedDay === day && Array.isArray(stored.collectedIds)
            ? stored.collectedIds
              .filter((id): id is string => typeof id === 'string' && FORAGE_PATCH_IDS.has(id))
              .slice(0, WORLD_FORAGE_PATCHES.length)
            : [],
        };
      }
    } catch { /* Start with an empty field basket. */ }
    save(next);
  }, [clockReady, day, save, storageKey]);

  useEffect(() => {
    if (!feedback) return;
    const timeout = window.setTimeout(() => setFeedback(null), 3200);
    return () => window.clearTimeout(timeout);
  }, [feedback]);

  const nearbyPatch = clockReady ? nearestForagePatch(telemetry, state.collectedIds) : null;
  const cookSite = restSite?.id === 'home-fire' || restSite?.id === 'summit-fire' ? restSite : null;
  const gather = useCallback(() => {
    if (!nearbyPatch) return;
    save({
      ...stateRef.current,
      ingredients: Math.min(99, stateRef.current.ingredients + 1),
      collectedIds: [...stateRef.current.collectedIds, nearbyPatch.id],
    });
    setFeedback({ status: 'gathered', patch: nearbyPatch });
  }, [nearbyPatch, save]);
  const cook = useCallback(() => {
    if (!cookSite) return;
    if (stateRef.current.ingredients < FORAGE_RECIPE_COST) {
      setFeedback({ status: 'missing-ingredients' });
      return;
    }
    save({ ...stateRef.current, ingredients: stateRef.current.ingredients - FORAGE_RECIPE_COST });
    onCookRation();
    setFeedback({ status: 'cooked' });
  }, [cookSite, onCookRation, save]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!enabled || event.repeat) return;
      if (event.code === 'KeyG') gather();
      if (event.code === 'KeyC') cook();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [cook, enabled, gather]);

  return { ...state, nearbyPatch, cookSite, feedback, gather, cook };
}
