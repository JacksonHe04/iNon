# Performance optimization — stage 17

Date: 2026-08-04

## Chunk-boundary sampling

- Changed infinite-terrain and streamed-nature-collider chunk checks from every
  frame to every 8 frames.
- Removed repeated division and rounding work from seven of every eight frames.
- Kept physics, camera movement, input, rendered instances, and collision
  response frame-driven.
- At 60 fps the maximum boundary-detection delay is about 133 ms. The 3×3
  terrain grid and multi-ring collider buffers cover much more than the maximum
  player travel during that interval.
- Browser verification teleported from the coastal home to the snow ridge at
  X 105, Z -58, altitude 41 m. Snow terrain, collision camp, tent, fire, props,
  mountain panorama, vegetation, and HUD rebuilt correctly.

Commit: `44e7531 perf(world): throttle chunk boundary checks`

## Instance-visibility sampling

- Capped tree and ground-cover visibility calculations at 30 Hz.
- Halved camera-direction reads, vector normalization, movement and turn tests,
  and the maximum rate of instance-matrix rewrites.
- Kept WebGL rendering and camera motion at the full frame cadence.
- The maximum culling-response delay is about 33 ms at 60 fps.
- Browser verification moved into the home, streamed the interior region, then
  travelled back to the outdoor spawn. Trees, ground cover, fences, garden,
  terrain, animals, and mountains restored without errors.

Commit: `b5c61dc perf(world): cap instance visibility updates`

## Rejected cache-header change

Production response headers were measured directly:

- `/_next/static` uses `public, max-age=31536000, immutable`.
- `public/archive-world` uses `public, max-age=0`, `ETag`, and byte ranges.

The world assets do not yet use content-hashed filenames. Applying a long-lived
immutable header would make updated models and textures remain stale across
future deployments on the same domain. No cache override was added. Three.js
still reuses loaded assets during in-page mode changes, while full reloads can
use conditional ETag requests.

## Validation

- in-app browser movement and waypoint travel
- coastal-home, interior, and snow-ridge region transitions
- direct production response-header inspection
- TypeScript checks
- Next.js production builds
- source-file audit remains at or below 300 lines per file
