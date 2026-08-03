# Performance optimization stage 3

Date: 2026-08-03

## Scope

Remove the full public-archive fetch that the root layout performed only to
render title, description, and author metadata.

## Change

The content layer now exposes a shared profile resolver with React request-level
memoization:

- profile lookup and fallback behavior live in one reusable function
- `getReadmeData()` reuses the resolver before loading archive source data
- `getSiteMetadata()` reuses the resolver but returns only three profile fields
- `generateMetadata()` calls the lightweight metadata path

The root layout therefore no longer invokes `read_public_profile_source()` for
metadata. Routes that resolve the same default profile during one render can
also reuse the memoized profile result.

## Production measurements

The production server was rebuilt and restarted before measurement.

| Sample | Root TTFB |
| --- | ---: |
| First request after restart | 9.26 s |
| Warm 1 | 2.07 s |
| Warm 2 | 3.63 s |
| Warm 3 | 21.84 s |
| Warm 4 | 5.95 s |
| Warm 5 | 4.81 s |

Compared with the immediately preceding stage:

- cold sample decreased from 18.20 s to 9.26 s
- the five recorded warm samples have a 4.81 s median
- the prior warm reference sample was 6.30 s

The 21.84 s outlier proves that remote database latency still has a severe long
tail. This stage improves the normal path but does not complete the TTFB work.

The first fresh in-app browser reload recorded 13.03 s TTFB and 13.46 s total
navigation duration. That independent sample reinforces the long-tail finding.

## Regression verification

- document title remains `缨缨｜All About Myself`
- root URL remains `http://localhost:3000/`
- the world reports `WebGL live`
- the coastal home scene, controls, map, wildlife, and route overlay render
- HTTP status remains 200

## Engineering checks

- `pnpm exec tsc --noEmit`
- `pnpm build`
- `git diff --check`
- `app/layout.tsx`: 38 lines
- `lib/content/index.ts`: 91 lines

## Next bottleneck

The public root still performs separate remote operations for profile
resolution, full source aggregation, and layout configuration. The next stage
should make one server-side RPC resolve the effective profile and return its
layout and source payload together, while preserving alias and default-profile
fallback semantics.
