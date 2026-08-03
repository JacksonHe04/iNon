# Performance optimization stage 6

Date: 2026-08-04

## Scope

Make the archive the genuinely lightweight default experience while retaining
the full 3D world as an explicit, persistent mode.

## Root cause

The archive-first client rendered the two-dimensional archive immediately but
also mounted `ArchiveWorld` from an idle callback. Mounting the hidden world
created a WebGL context, initialized physics and scene state, and requested 3D
models even when the visitor never selected world mode.

Two module-level `useGLTF.preload()` calls added another hidden side effect:
prefetching the world JavaScript module immediately requested the bird and dog
models.

## Change

- the idle callback now imports only the world JavaScript module
- the world React tree is mounted only after `世界 行走` is selected
- module-level bird and dog model preloads were removed
- direct `?mode=world` navigation still requests the world immediately
- after first world entry, the mounted scene remains available with
  `frameloop="never"` while inactive, preserving the quick return path
- world keyboard, sound, flight, inventory, and top-navigation synchronization
  moved into `useArchiveWorldControls`
- the public archive uses a server-rendered read-only grid rather than mounting
  the editable canvas engine
- decorative PNG sources were replaced with 202 KB and 443 KB WebP assets

## Default archive measurements

Measurements were taken in new in-app browser tabs after waiting long enough
for the idle callback.

| Metric | Before | Final |
| --- | ---: | ---: |
| Resource Timing entries | at least 250 | 43 |
| JavaScript heap | 85.56 MB | 42.24 MB |
| 3D model requests | many / buffer saturated | 0 |
| WebGL state in DOM | initialising | absent |

The final archive-mode heap is approximately 51% lower. Resource entries are at
least 83% lower; the original value was capped by the browser's 250-entry
Resource Timing buffer, so the true reduction may be larger.

The intermediate JavaScript-only prefetch still requested two models and used
59.86 MB. Removing module evaluation preloads eliminated both requests and a
further 17.62 MB of heap.

## Explicit world regression

After the archive-only measurement, the browser clicked `世界 行走`:

- archive content left the active view
- world heading and controls appeared
- WebGL reached `WebGL live`
- model requests began only after the click
- coastal home, terrain, wildlife, route, map, player status, and top controls
  rendered in the screenshot
- the loaded world reported 131.31 MB JavaScript heap after 12 seconds

The high active-world heap is now isolated to visitors who explicitly request
the game and remains a target for later geometry and scene-streaming work.

## Asset evidence

The two new archive atmosphere assets total about 645 KB as WebP. Their prior
PNG forms totalled about 4.2 MB, so the optimized public payload is roughly 85%
smaller while preserving the intended wood-fiber and relic overlays.

## Architecture and size checks

- `ArchiveWorld.tsx`: 289 lines
- `useArchiveWorldControls.ts`: 71 lines
- `PublicExperienceClient.tsx`: 135 lines
- `ArchiveReadonlyGrid.tsx`: 40 lines
- `pnpm exec tsc --noEmit`
- `pnpm build`
- `git diff --check`

## Next target

The active world still loads enough scene assets to fill the Resource Timing
buffer and reaches 131 MB heap. The next world stage should partition static
forest, ground-cover, and location assets by player region, then dispose or
suspend distant biome resources rather than retaining the entire map scene.
