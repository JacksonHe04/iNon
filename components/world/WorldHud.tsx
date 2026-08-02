'use client';

import type { GameTelemetry } from '@/components/world/ArchiveGameScene';
import { WORLD_KEEPSAKE_COUNT } from '@/components/world/ArchiveGameScene';
import { WORLD_WAYPOINTS, type WorldWaypoint } from '@/components/world/archiveWorldConfig';
import WorldMinimap from '@/components/world/WorldMinimap';

function dispatchKey(type: 'keydown' | 'keyup', code: string) {
  window.dispatchEvent(new KeyboardEvent(type, { code }));
}

function terrainLabel(telemetry: GameTelemetry) {
  if (telemetry.terrain === 'river') return '河谷水域';
  if (telemetry.terrain === 'mountain') return '山脊';
  if (telemetry.terrain === 'forest') return '森林';
  return '主屋林隙';
}

function motionLabel(telemetry: GameTelemetry) {
  if (telemetry.mounted) {
    if (telemetry.speed > 24) return '马背奔驰';
    if (telemetry.speed > 0) return '马背行进';
    return '马背驻足';
  }
  if (telemetry.inWater) return '涉水';
  if (telemetry.speed > 16) return '疾跑';
  if (telemetry.speed > 0) return '行进';
  return '驻足';
}

export default function WorldHud({
  owner,
  telemetry,
  keepsakes,
  onOpenInventory,
  onTravel,
}: {
  owner: string;
  telemetry: GameTelemetry;
  keepsakes: number;
  onOpenInventory: () => void;
  onTravel: (waypoint: WorldWaypoint) => void;
}) {
  return (
    <div className="archive-world-overlay">
      <header className="archive-world-gamebar">
        <div className="archive-world-gamebar__brand">
          <span>INON / VERDANT FIELD</span>
          <strong>{owner}</strong>
        </div>
        <div className="archive-world-gamebar__mission">
          <span>当前状态</span>
          <strong>
            {telemetry.canMount
              ? '林径马匹就在身旁 · F 骑乘'
              : telemetry.mounted
                ? '沿海岸与山脊继续探索'
                : `散落纸片 ${keepsakes} / ${WORLD_KEEPSAKE_COUNT}`}
          </strong>
        </div>
        <nav aria-label="世界操作">
          <button onClick={onOpenInventory}>背包 <kbd>B</kbd></button>
        </nav>
      </header>

      <div className="archive-world-hud">
        <div>
          <span>FIELD / LIVE</span>
          <strong>绿迹开放世界</strong>
        </div>
        <p>{telemetry.mounted ? 'WASD 骑行 · Shift 奔驰 · F 下马 · 空格跃起' : 'WASD 移动 · Shift 疾跑 · 拖动镜头 · 空格跳跃'}</p>
      </div>

      <WorldMinimap telemetry={telemetry} waypoints={WORLD_WAYPOINTS} onTravel={onTravel} />

      {telemetry.canMount && (
        <button
          className="archive-world-interact"
          onClick={() => {
            dispatchKey('keydown', 'KeyF');
            dispatchKey('keyup', 'KeyF');
          }}
        >
          <kbd>F</kbd>
          骑乘林径马匹
        </button>
      )}

      <div className="archive-world-mobile-controls" aria-label="移动控制">
        {[
          ['↑', 'KeyW'],
          ['←', 'KeyA'],
          ['↓', 'KeyS'],
          ['→', 'KeyD'],
        ].map(([label, code]) => (
          <button
            key={code}
            onPointerDown={() => dispatchKey('keydown', code)}
            onPointerUp={() => dispatchKey('keyup', code)}
            onPointerCancel={() => dispatchKey('keyup', code)}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="archive-world-status" aria-label="玩家状态">
        <div className="archive-world-status__compass">
          <span>{terrainLabel(telemetry)}</span>
          <strong>{motionLabel(telemetry)}</strong>
        </div>
        <div className="archive-world-status__bar">
          <label><span>体力</span><b>{Math.round(telemetry.stamina)}</b></label>
          <i><em style={{ width: `${telemetry.stamina}%` }} /></i>
        </div>
        <div className="archive-world-status__bar is-health">
          <label><span>状态</span><b>100</b></label>
          <i><em style={{ width: '100%' }} /></i>
        </div>
        <p>ALT {telemetry.y.toFixed(1)} M · SPD {telemetry.speed.toFixed(1)}</p>
      </div>
    </div>
  );
}
