# Performance optimization — stage 15

Date: 2026-08-04

## Accepted changes

### Mountain and tea-table surfaces

- Re-encoded two 1K mountain diffuse maps and three 1K tea-table maps as
  quality-95 WebP.
- Measured 42.6–45.9 dB PSNR against the source JPEG files.
- Reduced the five files from 2.78 MB to 1.25 MB.
- Preserved texture dimensions, terrain blending, the walkable snow line, and
  the tea-table glTF assignments.
- In-app browser verification retained the rock and snow surfaces at 128 draw
  calls and about 360k triangles with no texture, WebP, glTF, or 404 errors.

Commit: `7127c66 perf(world): compress the mountain surface maps`

### Dialogue context on demand

- Stopped building world-dialogue metadata on every telemetry render.
- Terrain height, biome, motion, warmth, vitality, inventory, and observation
  context are now derived only when dialogue is actually opened.
- Memoized recovered keepsakes until either the source records or collected IDs
  change.
- Browser verification opened the companion conversation with the correct live
  biome, day, time, position, altitude, heading, vitality, stamina, warmth,
  rations, ingredients, keepsake count, observed-species count, and companion
  proximity.

Commit: `967abec perf(world): build dialogue context on demand`

### Warmth timer deduplication

- Removed a duplicate `worldWarmthState` calculation from every hook render.
- Avoided same-value React state requests when warmth is clamped at 0 or 100.
- Avoided repeated localStorage writes when the persisted warmth value is
  unchanged.
- Kept the one-second simulation interval and original climate rates.
- Browser verification showed warmth progressing from 70 to 72 over 6.2
  seconds with no runtime error.

Commit: `b8e32ed perf(world): dedupe warmth state work`

## Rejected experiments

### Remaining Poly Haven JPEG files

Nine indoor texture JPEG files were tested at quality-95 WebP. Every output was
larger than its source. For example, the Shelf normal map grew from 231 KB to
350 KB. No project files were changed.

### Aquatic FBX to GLB migration

Assimp preserved static node, mesh, animation-channel, and bounding-box counts,
and Meshopt reduced the generated GLB files. The existing source record notes
that this conversion path distorts the authored skinning transforms, however.
Successful loading is not sufficient evidence of visual fidelity, so all
generated GLB files and code changes were removed. Original FBX files remain.

### Distance-gated wildlife shadows

Only wildlife within 36 metres was allowed to cast dynamic shadows in a trial.
Three browser samples still ranged from 129–136 draw calls and 357k–361k
triangles, overlapping the original baseline. The branch added runtime state
without a measurable win and was removed.

## Stage result

The tracked open-world payload changed from 38,001,841 B (36.24 MiB) to
36,468,834 B (34.78 MiB), while the stage also removed repeated main-thread
work during movement and time simulation.

Validation completed:

- in-app browser cold world reloads
- companion-dialogue round trip
- tidal-cove and deep-water travel
- live WebGL diagnostics
- console error inspection
- TypeScript checks
- Next.js production builds
- all edited source files remain below 300 lines
