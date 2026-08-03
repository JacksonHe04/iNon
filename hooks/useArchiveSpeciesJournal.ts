'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ARCHIVE_SPECIES,
  archiveSpeciesById,
  isArchiveSpeciesId,
  type ArchiveSpeciesId,
} from '@/components/world/archiveSpeciesCatalog';

export function useArchiveSpeciesJournal(owner: string) {
  const storageKey = `inon-world-species-${owner}`;
  const [ready, setReady] = useState(false);
  const [observedIds, setObservedIds] = useState<ArchiveSpeciesId[]>([]);
  const [lastObservedId, setLastObservedId] = useState<ArchiveSpeciesId | null>(null);
  const observedRef = useRef(new Set<ArchiveSpeciesId>());
  const readyRef = useRef(false);

  useEffect(() => {
    let savedIds: ArchiveSpeciesId[] = [];
    try {
      const saved = JSON.parse(window.localStorage.getItem(storageKey) ?? '[]') as unknown;
      if (Array.isArray(saved)) {
        const savedSet = new Set(saved.filter(isArchiveSpeciesId));
        savedIds = ARCHIVE_SPECIES.filter((species) => savedSet.has(species.id)).map((species) => species.id);
      }
    } catch {
      // Observation remains available when storage is blocked or damaged.
    }
    observedRef.current = new Set(savedIds);
    setObservedIds(savedIds);
    readyRef.current = true;
    setReady(true);
  }, [storageKey]);

  useEffect(() => {
    if (!ready) return;
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(observedIds));
    } catch {
      // Persistence is progressive enhancement.
    }
  }, [observedIds, ready, storageKey]);

  useEffect(() => {
    if (!lastObservedId) return;
    const timeout = window.setTimeout(() => setLastObservedId(null), 3200);
    return () => window.clearTimeout(timeout);
  }, [lastObservedId]);

  const observe = useCallback((id: ArchiveSpeciesId) => {
    if (!readyRef.current || observedRef.current.has(id)) return;
    observedRef.current.add(id);
    setObservedIds(ARCHIVE_SPECIES.filter((species) => observedRef.current.has(species.id)).map((species) => species.id));
    setLastObservedId(id);
  }, []);

  const lastObserved = useMemo(
    () => lastObservedId ? archiveSpeciesById(lastObservedId) : undefined,
    [lastObservedId],
  );

  return { ready, observedIds, lastObserved, observe };
}
