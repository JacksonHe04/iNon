'use client';

import { useMemo } from 'react';
import type { GameTelemetry } from '@/components/world/ArchiveGameScene';
import type { WorldWaypoint } from '@/components/world/archiveWorldConfig';
import { coastlineXAt, riverCenterAt } from '@/components/world/archiveTerrainMath';
import { WORLD_MOUNTAIN_SUMMIT_POSITION } from '@/components/world/archiveWorldConstants';

const MAP_CENTER = 90;
const MAP_RADIUS = 72;
const MAP_WORLD_RADIUS = 150;

function projectRaw(x: number, z: number, centerX: number, centerZ: number) {
  return [
    MAP_CENTER + ((x - centerX) / MAP_WORLD_RADIUS) * MAP_RADIUS,
    MAP_CENTER + ((z - centerZ) / MAP_WORLD_RADIUS) * MAP_RADIUS,
  ] as const;
}

function project(x: number, z: number, centerX: number, centerZ: number) {
  const rawX = ((x - centerX) / MAP_WORLD_RADIUS) * MAP_RADIUS;
  const rawY = ((z - centerZ) / MAP_WORLD_RADIUS) * MAP_RADIUS;
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
  const centerX = telemetry.x;
  const centerZ = telemetry.z;
  const [mountainX, mountainY] = project(
    WORLD_MOUNTAIN_SUMMIT_POSITION[0],
    WORLD_MOUNTAIN_SUMMIT_POSITION[2],
    centerX,
    centerZ,
  );
  const mountainDistance = Math.hypot(
    WORLD_MOUNTAIN_SUMMIT_POSITION[0] - centerX,
    WORLD_MOUNTAIN_SUMMIT_POSITION[2] - centerZ,
  );
  const riverPath = useMemo(() => {
    return Array.from({ length: 49 }, (_, index) => {
      const z = centerZ - MAP_WORLD_RADIUS + (index / 48) * MAP_WORLD_RADIUS * 2;
      const x = riverCenterAt(z);
      const [mapX, mapY] = projectRaw(x, z, centerX, centerZ);
      return `${index === 0 ? 'M' : 'L'}${mapX.toFixed(1)} ${mapY.toFixed(1)}`;
    }).join(' ');
  }, [centerX, centerZ]);
  const coastPath = useMemo(() => {
    const coast = Array.from({ length: 49 }, (_, index) => {
      const z = centerZ - MAP_WORLD_RADIUS + (index / 48) * MAP_WORLD_RADIUS * 2;
      const [mapX, mapY] = projectRaw(coastlineXAt(z), z, centerX, centerZ);
      return `${index === 0 ? 'M' : 'L'}${mapX.toFixed(1)} ${mapY.toFixed(1)}`;
    }).join(' ');
    return `${coast} L-20 200 L-20 -20 Z`;
  }, [centerX, centerZ]);

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
          <clipPath id="archive-map-clip"><circle cx="90" cy="90" r="84" /></clipPath>
        </defs>
        <circle cx="90" cy="90" r="84" fill="url(#archive-map-ground)" stroke="#d5c58f" strokeOpacity=".55" />
        <circle cx="90" cy="90" r="84" fill="url(#archive-map-lines)" />
        <path d={coastPath} fill="#173f3b" fillOpacity=".55" clipPath="url(#archive-map-clip)" />
        <path d={coastPath.split(' L6')[0]} fill="none" stroke="#d6c99f" strokeWidth="1.4" strokeOpacity=".5" />
        <path d={riverPath} fill="none" stroke="#285b53" strokeWidth="8" strokeOpacity=".74" />
        <path d={riverPath} fill="none" stroke="#a9c1a5" strokeWidth="1" strokeOpacity=".42" />
        {mountainDistance <= MAP_WORLD_RADIUS && (
          <g
            transform={`translate(${mountainX} ${mountainY}) rotate(-24)`}
            fill="none"
            stroke="#e6dbc0"
            strokeOpacity=".2"
          >
            <ellipse rx="20" ry="13" />
            <ellipse rx="14" ry="9" />
            <ellipse rx="8" ry="5" />
          </g>
        )}
        {[32, 58].map((radius) => (
          <circle key={radius} cx="90" cy="90" r={radius} fill="none" stroke="#eadfbf" strokeOpacity=".12" strokeDasharray="3 5" />
        ))}
        {waypoints.map((waypoint) => {
          const [x, y] = project(waypoint.position[0], waypoint.position[2], centerX, centerZ);
          return (
            <g key={waypoint.id} transform={`translate(${x} ${y})`}>
              <rect x="-4.5" y="-4.5" width="9" height="9" transform="rotate(45)" fill="#a4b092" stroke="#e7d8a8" />
              <text x="7" y="3" fill="#f0e7cc" fontSize="7">{waypoint.number}</text>
              <title>{waypoint.label}</title>
            </g>
          );
        })}
        <g transform={`translate(${MAP_CENTER} ${MAP_CENTER}) rotate(${telemetry.heading})`}>
          <path d="M0 -10 6 8 0 5 -6 8Z" fill="#f0e5c5" stroke="#24372b" strokeWidth="1.2" />
        </g>
      </svg>
      <div className="archive-world-minimap__targets" aria-label="快速传送地点">
        {waypoints.map((waypoint) => {
          const [x, y] = project(waypoint.position[0], waypoint.position[2], centerX, centerZ);
          const distance = Math.hypot(waypoint.position[0] - centerX, waypoint.position[2] - centerZ);
          return (
            <button
              key={waypoint.id}
              style={{ left: `${(x / 180) * 100}%`, top: `${(y / 180) * 100}%` }}
              aria-label={`传送到${waypoint.label}`}
              title={`${waypoint.label} · ${Math.round(distance)} 米`}
              onClick={() => onTravel(waypoint)}
            />
          );
        })}
      </div>
      <div className="archive-world-minimap__coordinates">
        LOCAL 300 M · X {telemetry.x.toFixed(0)} · Z {telemetry.z.toFixed(0)}
      </div>
    </div>
  );
}
