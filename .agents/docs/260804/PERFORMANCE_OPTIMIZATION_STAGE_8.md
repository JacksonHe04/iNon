# Performance optimization stage 8

Date: 2026-08-04

## Scope

Reduce the cost of explicitly entering the 3D open world without flattening it
into a decorative scene. The world retains movement, collisions, fast travel,
the coastal home and interior, mountain and river regions, wildlife, forage,
sound, and the infinite terrain loop.

## Browser baseline

The baseline was captured in the in-app browser after entering world mode and
waiting 12 seconds for the initial scene to settle.

| Metric | Stage 8 baseline |
| --- | ---: |
| JS heap before world entry | 23.4 MB |
| JS heap after world entry | 90.3 MB |
| Entry heap increase | 66.9 MB |
| Draw calls | 320 |
| Triangles | 1,247,813 |
| Scene roots | 33 |
| Observable page assets | 205 |

The asset inventory proved that the coastal spawn requested distant river
fish, bridge, mountain-camp, and tidal-cove resources before the player could
see them.

## Changes

### Region streaming

- added a four-times-per-second region window derived from the live player
  position
- deferred river ecology, bridge, mountain expedition, and tidal cove until
  their proximity windows become active
- kept coastal life and the coastal home available at the initial spawn
- converted the river, mountain, and tidal-cove React modules to lazy chunks
- limited fixed wildlife homes to a 105 metre stream radius, recalculated only
  after 32 metres of movement or a biome transition

Fast travel was tested in the browser. `archive-world-river-fish` appeared only
after travelling to the old bridge, and `archive-wilderness-landmarks` appeared
only after travelling to the snow-line ridge.

The first streaming pass reduced the measured world-entry heap increase from
66.9 MB to about 59.1 MB. `Deer.glb`, approximately 1.9 MB, was absent at the
coastal spawn while nearby coastal animals still loaded.

### Home and yard batching

- repeated walls, windows, floors, and roof fronts now use instanced draws
- the instancing helper accepts an archival tint so batching does not wash out
  the grey-green material treatment
- the complete interactive interior mounts inside 24 metres and remains warm
  until the player leaves 36 metres, avoiding threshold churn
- three flower scenes and their buckets were replaced with two batches
- benches, bags, buckets, and log piles shared across yard sections were moved
  into reusable instance batches
- nested terrain, rotation, scale, and child offsets are preserved through
  shared matrix helpers

Measured browser effects:

- home-shell optimization reduced the spawn from 294 to 264 draw calls
- deferring the unseen interior reduced it again from 264 to 193
- the home root dropped from 92 to 21 draw calls while the player was outside
- the yard root dropped from 93 to 75, then to 68 draw calls

The browser then walked from the 29 metre spawn into the home. Bed, desk,
bookcase, record and letter props, database album/film/book exhibits, and the
interior interaction hint all appeared correctly.

### Ecology and world density

- fourteen static bee scene clones were converted to instanced mesh parts;
  animated wasps remain independent
- tree coverage remains three chunks deep, but density is graded by distance:
  11 trees per near chunk, 8 in the middle ring, and 3 in the outer silhouette
  ring
- ground-cover coverage remains two chunks deep, graded from 42 items in the
  player chunk to 32 and 16 in the outer rings
- tree and rock colliders call the same deterministic placement functions as
  their visible instances
- the animated river school was reduced from 18 to 10 fish while retaining all
  three species, route lanes, speed variation, and observation behavior

The tree pass reduced the coastal spawn from about 1.19 million to 872,050
triangles. Ground-cover grading reduced it again to 767,168 triangles. Final
settled samples ranged from roughly 758,000 to 767,000 triangles, depending on
animated animals and the diagnostic frame.

The river-school root dropped from 33 to 15 draw calls; the measured bridge
scene dropped from 91 to 73 draw calls.

### Inactive lifecycle work

The soundscape previously ran a permanent animation-frame mixer even while its
default state was off or the world was in the background. It now schedules the
mixer only while sound is playing and settles both audio elements to zero when
disabled.

Browser verification recorded:

- sound off: both tracks paused, mix `0.000`
- sound on: both tracks playing, mixes approximately `0.155` and `0.266`
- sound off again: both tracks paused, mix `0.000`

## Final coastal-spawn range

Animated timing and wildlife visibility produce small frame-to-frame changes.
The settled browser samples after all stage 8 changes were:

| Metric | Baseline | Final range | Reduction |
| --- | ---: | ---: | ---: |
| Draw calls | 320 | 159–173 | 46–50% |
| Triangles | 1,247,813 | 758k–767k | 38–39% |
| Canvas count | 1 | 1 | world retained |

Screenshots were inspected after the home, yard, bees, forest, ground-cover,
river, and mountain changes. The coastal house, pool, garden, stepping stones,
forest silhouette, wildlife, river bridge, mountain camp, snow, HUD, and open
terrain remained present.

## Production evidence

`pnpm build` completed successfully with Next.js 16.2.10:

- optimized compilation: 15.3 seconds
- TypeScript: 12.2 seconds
- page-data collection: 1.283 seconds
- 12 static pages generated in 236 milliseconds

The production chunks contain separate lazy region payloads:

- river ecology: approximately 4 KB
- mountain expedition: approximately 4 KB
- tidal cove: approximately 8 KB

The exact development-server script count was not used as byte evidence because
Turbopack combines development modules differently from the production build.

## Architecture checks

- `pnpm exec tsc --noEmit`
- `pnpm build`
- `git diff --check` before every commit
- TypeScript, TSX, JavaScript, MJS, CSS, and SQL line audit
- largest audited source: `FirstPersonExplorer.tsx`, exactly 300 lines
- all audited source files: at most 300 lines

## Next targets

The remaining high-cost cases are biome-dependent rather than global. The old
bridge still reaches roughly 1.14 million triangles because forest variants and
animated FBX ecology differ from the coastal spawn. The next pass should add
per-root triangle diagnostics and evaluate mesh LOD or animation-distance
tiers without reducing nearby forest density or removing region-specific life.
