'use client';

import { useMemo } from 'react';
import type { GameTelemetry } from '@/components/world/ArchiveGameScene';
import type { WorldWaypoint } from '@/components/world/archiveWorldConfig';

const MAP_CENTER = 90;
const MAP_RADIUS = 72;
const WORLD_EXTENT = 285;

function project(x: number, z: number) {
  const rawX = (x / WORLD_EXTENT) * MAP_RADIUS;
  const rawY = (z / WORLD_EXTENT) * MAP_RADIUS;
  const distance = Math.hypot(rawX, rawY);
  const clamp = distance > MAP_RADIUS ? MAP_RADIUS / distance : 1;
  return [MAP_CENTER + rawX * clamp, MAP_CENTER + rawY * clamp] as const;
}

export default function WorldMinimap({
  telemetry,
  waypoints,
  onTravel,
}: {
  telemetry: GameTelemetry;
  waypoints: WorldWaypoint[];
  onTravel: (waypoint: WorldWaypoint) => void;
}) {
  const [playerX, playerY] = project(telemetry.x, telemetry.z);
  const riverPath = useMemo(() => {
    return Array.from({ length: 49 }, (_, index) => {
      const z = -WORLD_EXTENT + (index / 48) * WORLD_EXTENT * 2;
      const x = 78 + Math.sin(z * 0.018) * 38 + Math.sin(z * 0.004) * 16;
      const [mapX, mapY] = project(x, z);
      return `${index === 0 ? 'M' : 'L'}${mapX.toFixed(1)} ${mapY.toFixed(1)}`;
    }).join(' ');
  }, []);

  return (
    <div className="archive-world-minimap" aria-label="世界小地图，点击地点可传送">
      <div className="archive-world-minimap__heading">
        <span>FIELD MAP / LIVE</span>
        <strong>{Math.round(telemetry.heading).toString().padStart(3, '0')}°</strong>
      </div>
      <svg viewBox="0 0 180 180" role="img" aria-label="玩家、河流与真实世界地点">
        <defs>
          <radialGradient id="archive-map-ground">
            <stop offset="0" stopColor="#89917a" />
            <stop offset="1" stopColor="#263a2d" />
          </radialGradient>
          <pattern id="archive-map-lines" width="12" height="12" patternUnits="userSpaceOnUse">
            <path d="M0 12 12 0" stroke="#e1d5ae" strokeOpacity=".08" strokeWidth=".6" />
          </pattern>
        </defs>
        <circle cx="90" cy="90" r="84" fill="url(#archive-map-ground)" stroke="#d5c58f" strokeOpacity=".55" />
        <circle cx="90" cy="90" r="84" fill="url(#archive-map-lines)" />
        <path d={riverPath} fill="none" stroke="#285b53" strokeWidth="8" strokeOpacity=".74" />
        <path d={riverPath} fill="none" stroke="#a9c1a5" strokeWidth="1" strokeOpacity=".42" />
        {[32, 58].map((radius) => (
          <circle key={radius} cx="90" cy="90" r={radius} fill="none" stroke="#eadfbf" strokeOpacity=".12" strokeDasharray="3 5" />
        ))}
        {waypoints.map((waypoint) => {
          const [x, y] = project(waypoint.position[0], waypoint.position[2]);
          return (
            <g key={waypoint.id} transform={`translate(${x} ${y})`}>
              <rect x="-4.5" y="-4.5" width="9" height="9" transform="rotate(45)" fill="#a4b092" stroke="#e7d8a8" />
              <text x="7" y="3" fill="#f0e7cc" fontSize="7">{waypoint.number}</text>
              <title>{waypoint.label}</title>
            </g>
          );
        })}
        <g transform={`translate(${playerX} ${playerY}) rotate(${telemetry.heading})`}>
          <path d="M0 -10 6 8 0 5 -6 8Z" fill="#f0e5c5" stroke="#24372b" strokeWidth="1.2" />
        </g>
      </svg>
      <div className="archive-world-minimap__targets" aria-label="快速传送地点">
        {waypoints.map((waypoint) => {
          const [x, y] = project(waypoint.position[0], waypoint.position[2]);
          return (
            <button
              key={waypoint.id}
              style={{ left: `${(x / 180) * 100}%`, top: `${(y / 180) * 100}%` }}
              aria-label={`传送到${waypoint.label}`}
              title={`传送到${waypoint.label}`}
              onClick={() => onTravel(waypoint)}
            />
          );
        })}
      </div>
      <div className="archive-world-minimap__coordinates">
        X {telemetry.x.toFixed(0)} · Z {telemetry.z.toFixed(0)}
      </div>
    </div>
  );
}
