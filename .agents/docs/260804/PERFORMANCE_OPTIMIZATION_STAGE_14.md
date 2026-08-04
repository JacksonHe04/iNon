# Performance optimization — stage 14

Date: 2026-08-04

## Scope

This stage reduces the delivery cost of the open-world experience while keeping
the existing world, cottage, wildlife, authored animation, materials, and sound
design intact. Every accepted change was tested in the in-app browser at
`http://localhost:3000/?perf=codex-fix&mode=world`.

## Accepted changes

### Ambient soundscape

- Replaced the 222 kbps forest OGG and 320 kbps water MP3 with approximately
  64 kbps AAC M4A derivatives.
- Preserved the full 123.43-second forest recording and 300.04-second water
  recording.
- Reduced the two runtime tracks from about 14.4 MB to 3.55 MB.
- Kept both audio elements at `preload="none"`; cold world entry reports
  `readyState = 0` for both tracks.
- With sound enabled, both tracks reached `readyState = 4`, played, buffered,
  and mixed without media errors.

Commit: `77e20f4 perf(world): compress the ambient soundscape`

### Cottage texture set

- Converted sixteen 1024px PNG textures to WebP.
- Kept normal maps lossless.
- Encoded color, roughness, ORM, and foliage textures at quality 90 with
  lossless alpha.
- Preserved texture dimensions, geometry, materials, and glTF assignments.
- Reduced the shared texture set from 13,936,948 B to 4,765,084 B: a
  9,171,864 B or 65.8% reduction.
- Browser inspection confirmed intact plaster, timber, roof, brick, foliage,
  pool, and cottage-ground materials with no texture or 404 errors.

Commit: `9046a5e perf(world): compress the cottage texture set`

### Animated wildlife

- Applied medium Meshopt compression to all 26 animal GLB files.
- Applied no mesh simplification.
- Preserved materials, skins, and every authored animation clip.
- Reduced the wildlife pack from 25,004,548 B to 11,562,544 B: a
  13,442,004 B or 53.8% reduction.
- Cold browser reload retained the bird flock, companion, wildlife, and horse.
- Consecutive screenshots showed the horse changing position and pose; no
  Meshopt, glTF, failed-request, or 404 errors appeared.

Commit: `f72f205 perf(world): meshopt the animated animal pack`

### Field-prop atlases

- Converted thirteen 512px PNG atlases to WebP.
- Kept normal maps lossless and encoded surface maps at quality 90 with
  lossless alpha.
- Preserved atlas dimensions, geometry, materials, and glTF assignments.
- Reduced the shared prop textures from 3,390,010 B to 1,196,812 B: a
  2,193,198 B or 64.7% reduction.
- Browser inspection retained the cottage and field scene without WebP,
  texture, glTF, failed-request, or 404 errors.

Commit: `d81bb8b perf(world): compress the field prop atlases`

## Rejected experiment: Meshopt tree geometry

Three common-tree models were tested with the same medium Meshopt pipeline.
Their geometry buffers fell from 1,222,196 B to 405,536 B, but the browser
timing was worse:

| Variant | Time to at least 100 draw calls |
| --- | --- |
| Meshopt trees | 4.50–6.75 s |
| Original trees | 4.35–5.45 s |

The maximum measured regression was about 1.3 seconds for only about 0.82 MB
of transfer savings. The experiment was fully reverted and was not committed.
The remaining nature models stay uncompressed until a strategy can improve
both transfer and readiness time.

## Stage result

The tracked `public/archive-world` payload changed from 74,731,290 B
(71.27 MiB) to 38,001,841 B (36.24 MiB):

- 36,729,449 B removed
- 49.1% smaller
- no world content removed
- no shorter audio loops
- no mesh simplification
- no texture-resolution reduction

The final browser state retained the WebGL canvas, world HUD, minimap, cottage,
pool, mountains, vegetation, bird flock, companion, and wildlife. Sound remains
opt-in. TypeScript and the Next.js production build passed after each accepted
asset phase.
