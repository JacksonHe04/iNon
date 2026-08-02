'use client';

import type { GameTelemetry } from '@/components/world/ArchiveGameScene';
import { WORLD_KEEPSAKE_COUNT } from '@/components/world/ArchiveGameScene';
import { WORLD_WAYPOINTS, type WorldWaypoint } from '@/components/world/archiveWorldConfig';
import WorldMinimap from '@/components/world/WorldMinimap';
import { ARCHIVE_SPECIES_COUNT } from '@/components/world/archiveSpeciesCatalog';
import { isInsideArchiveHome } from '@/components/world/archiveWorldZones';
import { worldLocationLabel, worldMotionLabel } from '@/components/world/archiveWorldTelemetry';
import WorldFieldRoute from '@/components/world/WorldFieldRoute';
import type { FieldRouteStage } from '@/components/world/archiveFieldRoute';
import type { CompanionBehavior, CompanionTelemetry } from '@/components/world/ArchiveCompanionDog';
import type { WorldRestSite } from '@/components/world/archiveWorldRest';
import type { WorldTimeSnapshot } from '@/components/world/archiveWorldTime';

const COMPANION_BEHAVIOR_LABELS: Record<CompanionBehavior, string> = {
  resting: '在身边休息',
  following: '沿地形跟随',
  'catching-up': '循着气味赶来',
  'waiting-for-safe-ground': '在岸边等待',
  'using-home-door': '正从主屋门口绕行',
};

function dispatchKey(type: 'keydown' | 'keyup', code: string) {
  window.dispatchEvent(new KeyboardEvent(type, { code }));
}

export default function WorldHud({
  owner,
  telemetry,
  keepsakes,
  soundEnabled,
  companionNearby,
  companionTelemetry,
  fieldRouteStage,
  fieldRouteStageIndex,
  recentFieldRouteStage,
  restSite,
  worldTime,
  onOpenInventory,
  onToggleSound,
  onTalkToCompanion,
  onRest,
  onTravel,
}: {
  owner: string;
  telemetry: GameTelemetry;
  keepsakes: number;
  soundEnabled: boolean;
  companionNearby: boolean;
  companionTelemetry: CompanionTelemetry;
  fieldRouteStage: FieldRouteStage | null;
  fieldRouteStageIndex: number;
  recentFieldRouteStage: FieldRouteStage | null;
  restSite: WorldRestSite | null;
  worldTime: WorldTimeSnapshot;
  onOpenInventory: () => void;
  onToggleSound: () => void;
  onTalkToCompanion: () => void;
  onRest: () => void;
  onTravel: (waypoint: WorldWaypoint) => void;
}) {
  const insideHome = isInsideArchiveHome(telemetry.x, telemetry.z);
  const companionDistance = Math.round(Math.hypot(
    telemetry.x - companionTelemetry.x,
    telemetry.z - companionTelemetry.z,
  ));
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
            {companionNearby
              ? '苔苔在等你说话'
              : telemetry.flying
              ? '飞行模式 · 空格上升 · Ctrl 下降'
              : telemetry.canMount
              ? '林径马匹就在身旁 · F 骑乘'
              : telemetry.mounted
                ? '沿海岸与山脊继续探索'
                : `散落纸片 ${keepsakes} / ${WORLD_KEEPSAKE_COUNT}`}
          </strong>
        </div>
        <nav aria-label="世界操作">
          <button onClick={() => {
            dispatchKey('keydown', 'KeyV');
            dispatchKey('keyup', 'KeyV');
          }}>飞行 {telemetry.flying ? 'ON' : 'OFF'} <kbd>V</kbd></button>
          <button onClick={onToggleSound}>声景 {soundEnabled ? 'ON' : 'OFF'} <kbd>M</kbd></button>
          <button onClick={onOpenInventory}>背包 <kbd>B</kbd></button>
        </nav>
      </header>

      <div className="archive-world-hud">
        <div>
          <span>FIELD / LIVE</span>
          <strong>绿迹开放世界</strong>
        </div>
        <p>{telemetry.flying
          ? 'WASD 飞行 · Shift 加速 · Space 上升 · Ctrl / C 下降 · V 落地'
          : telemetry.mounted
            ? 'WASD 骑行 · Shift 奔驰 · F 下马 · 空格跃起'
            : 'WASD 移动 · Shift 疾跑 · 拖动镜头 · 空格跳跃'}</p>
      </div>

      <WorldMinimap telemetry={telemetry} waypoints={WORLD_WAYPOINTS} onTravel={onTravel} />
      <WorldFieldRoute
        telemetry={telemetry}
        stage={fieldRouteStage}
        stageIndex={fieldRouteStageIndex}
        recentStage={recentFieldRouteStage}
      />

      {insideHome && (
        <div className="archive-world-home-hint">
          <span>LIVED-IN ARCHIVE</span>
          <strong>点击床、书桌、书柜与旧木箱读取记录</strong>
        </div>
      )}

      {(companionNearby || telemetry.canMount || restSite) && (
        <div className="archive-world-interactions" aria-label="附近交互">
          {companionNearby && (
            <button className="archive-world-interact" onClick={onTalkToCompanion}>
              <kbd>E</kbd>
              蹲下与苔苔交谈
            </button>
          )}
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
          {restSite && (
            <button className="archive-world-interact" onClick={onRest}>
              <kbd>R</kbd>
              {restSite.prompt}
            </button>
          )}
        </div>
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

      {telemetry.flying && (
        <div className="archive-world-flight-controls" aria-label="飞行高度控制">
          <button
            aria-label="上升"
            onPointerDown={() => dispatchKey('keydown', 'Space')}
            onPointerUp={() => dispatchKey('keyup', 'Space')}
            onPointerCancel={() => dispatchKey('keyup', 'Space')}
          >↑</button>
          <button
            aria-label="下降"
            onPointerDown={() => dispatchKey('keydown', 'ControlLeft')}
            onPointerUp={() => dispatchKey('keyup', 'ControlLeft')}
            onPointerCancel={() => dispatchKey('keyup', 'ControlLeft')}
          >↓</button>
        </div>
      )}

      <div className="archive-world-status" aria-label="玩家状态">
        <div className="archive-world-status__compass">
          <span>{worldLocationLabel(telemetry)} · {worldTime.phaseLabel} {worldTime.clockLabel}</span>
          <strong>{worldMotionLabel(telemetry)}</strong>
        </div>
        <div className="archive-world-status__bar">
          <label><span>体力</span><b>{Math.round(telemetry.stamina)}</b></label>
          <i><em style={{ width: `${telemetry.stamina}%` }} /></i>
        </div>
        <div className="archive-world-status__bar is-health">
          <label><span>状态</span><b>100</b></label>
          <i><em style={{ width: '100%' }} /></i>
        </div>
        <p>DAY {worldTime.day} · 生态 {ARCHIVE_SPECIES_COUNT} 种 · ALT {telemetry.y.toFixed(1)} M · SPD {telemetry.speed.toFixed(1)}</p>
        <p>苔苔 · {COMPANION_BEHAVIOR_LABELS[companionTelemetry.behavior]} · {companionDistance} M</p>
      </div>
    </div>
  );
}
