# Performance optimization — stage 16

Date: 2026-08-04

## Scope

This stage targets continuous open-world CPU and React work. Camera motion,
physics, collision, input, water animation, animal movement, and authored
animation remain frame-driven.

## Player telemetry cadence

- Changed HUD and route telemetry publication from every 6 frames to every 10
  frames: approximately 10 Hz to 6 Hz at 60 fps.
- Reduced movement-driven `ArchiveWorld` React updates by 40%.
- Kept camera, rigid-body movement, collision, stamina, swimming, mounting,
  flight, and scene streaming on every animation frame.
- Browser movement verification travelled from Z 32 to Z -2. The camera,
  altitude, home-region streaming, HUD, and final speed all updated correctly.

Commit: `880a9ff perf(world): lower telemetry publish cadence`

## Companion telemetry deduplication

- Retained the existing 750 ms companion publication bound.
- Added an 8 cm position threshold and behavior comparison before sending a new
  parent-state object.
- Eliminated repeated parent renders while the companion is resting.
- Kept companion navigation, obstacle avoidance, catch-up, door use, and
  animation on every frame.
- Browser verification changed from `resting · X -9.7 · Z 35.9` to
  `using-home-door · X -12.1 · Z 13.4` after player movement.

Commit: `6241733 perf(world): suppress idle companion telemetry`

## Production diagnostics removal

- Kept WebGL render-list diagnostics in development.
- Removed production traversal of opaque, transmissive, and transparent render
  lists every 420 frames.
- Removed the corresponding production parent-state update and hidden status
  node.
- A temporary production server was opened in the in-app browser. The complete
  world rendered with its Canvas, cottage, terrain, vegetation, animals, HUD,
  and opt-in audio, while the diagnostics node and `WebGL live` text were absent.
- Production chunks no longer contain the diagnostic strings.

Commit: `0b23d8e perf(world): omit diagnostics from production`

## Ambient light interpolation cadence

- Changed sky, fog, ambient light, hemisphere light, sun, exposure, and
  panorama tint interpolation from 60 Hz to time-based 15 Hz.
- Preserved the original visual time constant. Four 60 Hz lerps at 0.025 compose
  to approximately 0.0963; the new elapsed-time easing produces approximately
  0.0964 for the same duration.
- Kept panorama position tracking on every frame.
- Browser verification retained the deep-night sky, fog, mountain, cottage,
  firelight, and HUD without runtime errors.

Commit: `80808f6 perf(world): throttle ambient light interpolation`

## Validation

- in-app browser world reloads and movement
- companion follow and door behavior
- development diagnostics retained
- production diagnostics absent
- production world screenshot
- TypeScript checks
- Next.js production builds
- source-file audit: maximum remains exactly 300 lines
