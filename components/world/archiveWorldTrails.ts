export interface WorldTrailSegment {
  start: readonly [number, number];
  end: readonly [number, number];
  halfWidth: number;
}

export const WORLD_TRAIL_SEGMENTS: readonly WorldTrailSegment[] = [
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
