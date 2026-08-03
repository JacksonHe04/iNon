# Performance optimization stage 2

Date: 2026-08-03

## Scope

This stage reduces two independent sources of unnecessary work on the public
experience:

1. Public profile rendering no longer opens more than twenty concurrent REST
   reads for one page.
2. The 3D world no longer mounts every land-animal model in every biome.

The existing archive structure and the music and movie collection cards remain
unchanged.

## Server data aggregation

`read_public_profile_source(uuid)` aggregates all public profile source tables,
relationship tables, and approved messages into one JSON response. The server
uses the service-role client to invoke it and retains the former multi-query
loader as a compatibility fallback when the function is unavailable.

Security properties:

- `security invoker`
- empty `search_path`
- execution revoked from `public`, `anon`, and `authenticated`
- execution granted only to `service_role`
- Supabase security advisor reports no lint for the new function

This removes the browser-independent connection burst that previously caused
parallel Supabase requests to fail with `SSL_ERROR_SYSCALL` locally.

## Biome-scoped wildlife

`ArchiveWildlife` now derives the active biome from the player position and
mounts only species that can appear in that habitat. The current biome is held
in component state, while a ref prevents frame-by-frame React updates when the
biome does not change.

Direct browser evidence:

- the coastal home loaded only coastal-compatible land-animal resources
- after travel to the alpine ridge, CDP recorded exactly the newly required
  `Stag.glb` and `Wolf.glb` model requests
- the alpine camp remained visually intact after the transition

## Production measurements

All measurements were taken against `pnpm start` on `localhost:3000`.

| Measurement | Before | After |
| --- | ---: | ---: |
| Cold root TTFB | 28.29 s | 18.20 s |
| Warm root TTFB | not recorded | 6.30 s |
| Fresh in-app browser root TTFB | not recorded | 12.81 s |

Five-second in-app browser frame sample after the data change:

- 48.73 average FPS
- 20.52 ms average frame time
- 16.70 ms p50 frame time
- 33.80 ms p95 frame time
- 35.30 ms p99 frame time
- 9 frames longer than 34 ms
- 91.02 MB JavaScript heap

The page still has a material server-rendering TTFB bottleneck. This stage does
not claim that initial response performance is complete.

## Data-preservation regression

The in-app browser verified the complete archive after the aggregation change:

- 18 archive sections
- 5 projects
- 30 album cards and 40 single records
- 1 movie card: `情书`
- 3 book cards
- 2 approved messages

Screenshots confirmed that the existing music and movie card compositions are
still rendered rather than replaced by generic placeholders.

## Verification

- `pnpm exec tsc --noEmit`
- `pnpm build`
- `git diff --check`
- all touched source files remain below 300 lines
- production HTTP response: 200
- in-app browser: WebGL live at the coastal home and alpine ridge
- CDP network trace: biome-specific model requests
- DOM and visual regression: music and movie cards preserved

## Next bottleneck

The next server stage should remove duplicated or overly broad metadata reads.
The root layout currently obtains the entire public profile payload to produce a
small metadata object, which competes with the page render for the same remote
data and keeps warm TTFB above the target range.
