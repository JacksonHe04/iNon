'use client';

import { create } from 'zustand';
import type { ArchiveWorldMode } from '@/components/world/archiveWorldConfig';

interface ExperienceNavigation {
  mode: ArchiveWorldMode;
  onModeChange: (mode: ArchiveWorldMode) => void;
}

export interface WorldTopNavControls {
  flying: boolean;
  soundEnabled: boolean;
  onToggleFlight: () => void;
  onToggleSound: () => void;
  onOpenInventory: () => void;
}

interface UniversalTopNavState {
  experience: ExperienceNavigation | null;
  worldControls: WorldTopNavControls | null;
  setExperience: (experience: ExperienceNavigation | null) => void;
  setWorldControls: (controls: WorldTopNavControls | null) => void;
}

export const useUniversalTopNav = create<UniversalTopNavState>((set) => ({
  experience: null,
  worldControls: null,
  setExperience: (experience) => set({ experience }),
  setWorldControls: (worldControls) => set({ worldControls }),
}));
