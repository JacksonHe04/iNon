'use client';

import { Backpack, Plane, Volume2, VolumeX } from 'lucide-react';
import type { WorldTopNavControls as WorldTopNavControlsState } from './useUniversalTopNav';

export default function WorldTopNavControls({
  controls,
}: {
  controls: WorldTopNavControlsState;
}) {
  return (
    <div className="archive-topnav-world-controls" aria-label="世界操作">
      <button type="button" onClick={controls.onToggleFlight} aria-label={`飞行${controls.flying ? '开启' : '关闭'}`}>
        <Plane className="h-3.5 w-3.5" />
        <span>飞行</span>
        <small>{controls.flying ? 'ON' : 'OFF'}</small>
      </button>
      <button type="button" onClick={controls.onToggleSound} aria-label={`声景${controls.soundEnabled ? '开启' : '关闭'}`}>
        {controls.soundEnabled ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
        <span>声景</span>
        <small>{controls.soundEnabled ? 'ON' : 'OFF'}</small>
      </button>
      <button type="button" onClick={controls.onOpenInventory} aria-label="打开背包">
        <Backpack className="h-3.5 w-3.5" />
        <span>背包</span>
      </button>
    </div>
  );
}
