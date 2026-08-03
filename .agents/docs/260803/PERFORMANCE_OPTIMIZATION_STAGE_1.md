# Performance Optimization — Stage 1

Date: 2026-08-03

## Scope

This stage targets repeated work while the player is stationary. Measurements were taken in the built-in browser against `pnpm dev` on `http://localhost:3000/`. Development-mode React and Turbopack overhead is included, so these numbers are not production Core Web Vitals.

## Baseline

- WebGL: live
- Draw calls: 303
- Triangles: 1,226,880
- Scene roots: 33
- Five-second frame sample: 20.64 FPS
- Median frame: 16.8 ms
- 95th percentile frame: 133.4 ms
- Frames above 34 ms: 33
- Five-second main-thread task time: 4,869 ms
- Decoded page resources: approximately 65.7 MiB
- Initial JavaScript heap: approximately 265.8 MiB

The CPU profile showed repeated React root work and `performance.clearMeasures` dominating long frames. Inspection found three avoidable update sources:

1. Forest and ground-cover instance matrices were rewritten while the player had not moved.
2. Player telemetry repeatedly updated top-level React state even when every meaningful value was unchanged.
3. Companion telemetry updated top-level React state every twelve rendered frames.

## Changes

- Forest visibility matrices now update only after a 0.35 m player displacement or a streamed-chunk change.
- Ground-cover visibility matrices now update only after a 0.25 m displacement or a streamed-chunk change.
- Instance bounding spheres are recomputed only when streamed chunks change.
- Player telemetry is published only after a meaningful position, heading, motion, state, or terrain change.
- Companion telemetry uses a time-based 750 ms cadence instead of a frame-count cadence.
- `ArchiveGameScene` is memoized against its actual data inputs so HUD telemetry updates do not reconcile the complete 3D scene tree.

## Result

- Five-second frame sample: 39.15 FPS
- Median frame: 16.7 ms
- 95th percentile frame: 99.9 ms
- Frames above 34 ms: 18
- Average FPS improvement: 89.7%
- Long-frame reduction: 45.5%
- Draw calls and visible world content remained effectively unchanged (303–304 calls and approximately 1.23 million triangles).

## Browser Regression

- The built-in browser still reported `WebGL live`.
- The coastal house, pool, vegetation, wildlife, mountain, sea, paper weather, minimap, route card, and HUD remained visible.
- Clicking the forward control moved the player from Z 32 to Z 29 and updated the minimap and route distance.
- Forest and ground-cover streaming remained visually intact after movement.
- Browser error log: empty.

## Next Bottlenecks

- Development cold start is approximately 20.7 seconds and loads every wildlife model eagerly.
- Animal GLBs account for many of the largest decoded resources (roughly 1.7–2.2 MiB each).
- The scene still renders roughly 1.23 million triangles and more than 300 draw calls.
- Periodic world-clock, warmth, and remaining UI state changes still cause long frames in development mode.

The next stage should measure a production build separately, then prioritize distance-based wildlife loading and render-cost reduction without removing visible species or collection-card UI.
