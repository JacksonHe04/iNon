import {
  WORLD_HOME_ENTRY_POSITION,
  WORLD_PLAYER_SPAWN,
} from '@/components/world/archiveWorldConstants';

export interface WorldTrailSegment {
  start: readonly [number, number];
  end: readonly [number, number];
  halfWidth: number;
  grade?: readonly [number, number];
}

const MOUNTAIN_TRAIL_SEGMENTS: readonly WorldTrailSegment[] = [
  { start: [0, 22], end: [24, 4], halfWidth: 1.8, grade: [0.8, 3] },
  { start: [24, 4], end: [54, -34], halfWidth: 1.75, grade: [3, 10] },
  { start: [54, -34], end: [76, -48], halfWidth: 1.65, grade: [10, 18] },
  { start: [76, -48], end: [94, -55], halfWidth: 1.55, grade: [18, 30] },
  { start: [94, -55], end: [105, -58], halfWidth: 1.35, grade: [30, 41] },
];

export const WORLD_TRAIL_SEGMENTS: readonly WorldTrailSegment[] = [
  {
    start: WORLD_HOME_ENTRY_POSITION,
    end: [WORLD_PLAYER_SPAWN[0], WORLD_PLAYER_SPAWN[2]],
    halfWidth: 1.25,
  },
  {
    start: [WORLD_PLAYER_SPAWN[0], WORLD_PLAYER_SPAWN[2]],
    end: [0, 22],
    halfWidth: 1.65,
  },
  { start: [0, 22], end: [-18, 13], halfWidth: 2.15 },
  { start: [-18, 13], end: [18, 0], halfWidth: 1.9 },
  { start: [18, 0], end: [54, -34], halfWidth: 2.15 },
  { start: [54, -34], end: [50, -92], halfWidth: 1.75 },
  { start: [50, -92], end: [43, -160], halfWidth: 1.65 },
  { start: [43, -160], end: [75, -160], halfWidth: 2.05 },
  { start: [75, -160], end: [96, -122], halfWidth: 1.65 },
  { start: [96, -122], end: [146, -176], halfWidth: 1.55 },
  { start: [75, -160], end: [18, -258], halfWidth: 1.45 },
  { start: [-18, 13], end: [-62, -16], halfWidth: 1.75 },
  { start: [-62, -16], end: [-112, -62], halfWidth: 1.55 },
  { start: [-112, -62], end: [-158, -148], halfWidth: 1.45 },
  { start: [-112, -62], end: [-152, 12], halfWidth: 1.35 },
  { start: [-152, 12], end: [-206, 116], halfWidth: 1.3 },
  { start: [54, -34], end: [105, 4], halfWidth: 1.5 },
  ...MOUNTAIN_TRAIL_SEGMENTS,
  { start: [105, 4], end: [162, 72], halfWidth: 1.35 },
  { start: [162, 72], end: [214, 132], halfWidth: 1.25 },
] as const;

function distanceToSegment(
  x: number,
  z: number,
  start: readonly [number, number],
  end: readonly [number, number],
) {
  const segmentX = end[0] - start[0];
  const segmentZ = end[1] - start[1];
  const lengthSquared = segmentX * segmentX + segmentZ * segmentZ;
  if (lengthSquared === 0) return Math.hypot(x - start[0], z - start[1]);
  const amount = Math.max(
    0,
    Math.min(1, ((x - start[0]) * segmentX + (z - start[1]) * segmentZ) / lengthSquared),
  );
  return Math.hypot(x - (start[0] + segmentX * amount), z - (start[1] + segmentZ * amount));
}

function segmentAmount(
  x: number,
  z: number,
  start: readonly [number, number],
  end: readonly [number, number],
) {
  const segmentX = end[0] - start[0];
  const segmentZ = end[1] - start[1];
  const lengthSquared = segmentX * segmentX + segmentZ * segmentZ;
  if (lengthSquared === 0) return 0;
  return Math.max(
    0,
    Math.min(1, ((x - start[0]) * segmentX + (z - start[1]) * segmentZ) / lengthSquared),
  );
}

export function mountainTrailGradeAt(x: number, z: number) {
  let nearest: { distance: number; height: number } | null = null;
  for (const segment of MOUNTAIN_TRAIL_SEGMENTS) {
    if (!segment.grade) continue;
    const distance = distanceToSegment(x, z, segment.start, segment.end);
    const amount = segmentAmount(x, z, segment.start, segment.end);
    const height = segment.grade[0] + (segment.grade[1] - segment.grade[0]) * amount;
    if (!nearest || distance < nearest.distance) nearest = { distance, height };
  }
  return nearest;
}

export function normalizedWorldTrailDistanceAt(x: number, z: number) {
  let distance = Number.POSITIVE_INFINITY;
  for (const segment of WORLD_TRAIL_SEGMENTS) {
    distance = Math.min(
      distance,
      distanceToSegment(x, z, segment.start, segment.end) / segment.halfWidth,
    );
  }
  return distance;
}

export function isInsideWorldTrail(x: number, z: number, padding = 0) {
  return WORLD_TRAIL_SEGMENTS.some(
    (segment) => distanceToSegment(x, z, segment.start, segment.end) < segment.halfWidth + padding,
  );
}
