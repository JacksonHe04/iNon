'use client';

import { useCallback, useEffect, useState, type Dispatch, type SetStateAction } from 'react';
import { useUniversalTopNav } from '@/components/nav/useUniversalTopNav';

interface ArchiveWorldControlsOptions {
  active: boolean;
  flying: boolean;
  setInventoryOpen: Dispatch<SetStateAction<boolean>>;
}

export function useArchiveWorldControls({
  active,
  flying,
  setInventoryOpen,
}: ArchiveWorldControlsOptions) {
  const [soundEnabled, setSoundEnabled] = useState(false);
  const setWorldControls = useUniversalTopNav((state) => state.setWorldControls);

  useEffect(() => {
    const toggleInventory = (event: KeyboardEvent) => {
      if (event.code !== 'KeyB' || !active) return;
      setInventoryOpen((open) => !open);
    };
    window.addEventListener('keydown', toggleInventory);
    return () => window.removeEventListener('keydown', toggleInventory);
  }, [active, setInventoryOpen]);

  useEffect(() => {
    const toggleSound = (event: KeyboardEvent) => {
      if (event.code !== 'KeyM' || event.repeat || !active) return;
      setSoundEnabled((enabled) => !enabled);
    };
    window.addEventListener('keydown', toggleSound);
    return () => window.removeEventListener('keydown', toggleSound);
  }, [active]);

  const releasePointerLock = useCallback(() => {
    if (document.pointerLockElement) document.exitPointerLock();
  }, []);

  const toggleFlight = useCallback(() => {
    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyV' }));
    window.dispatchEvent(new KeyboardEvent('keyup', { code: 'KeyV' }));
  }, []);

  const toggleSound = useCallback(() => setSoundEnabled((enabled) => !enabled), []);

  const openInventory = useCallback(() => {
    releasePointerLock();
    setInventoryOpen(true);
  }, [releasePointerLock, setInventoryOpen]);

  useEffect(() => {
    if (!active) {
      setWorldControls(null);
      return;
    }

    setWorldControls({
      flying,
      soundEnabled,
      onToggleFlight: toggleFlight,
      onToggleSound: toggleSound,
      onOpenInventory: openInventory,
    });
    return () => setWorldControls(null);
  }, [active, flying, openInventory, setWorldControls, soundEnabled, toggleFlight, toggleSound]);

  return { releasePointerLock, soundEnabled };
}
