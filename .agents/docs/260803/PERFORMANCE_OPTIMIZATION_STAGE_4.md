# Performance optimization stage 4

Date: 2026-08-03

## Scope

Collapse the public page's separate profile, source, layout, and analytics ID
reads into one database round trip.

## Database aggregation

`read_public_profile_page(target_identifier, fallback_identifier)` now resolves:

- direct profile slug or username
- alias slug through `profile_slugs`
- configured default profile
- empty-slug profile as the final fallback

The response contains the selected profile fields, its layout configuration,
the complete source payload, the resolution path, and the resolved profile ID.
The function delegates source aggregation to the stage 2 function rather than
duplicating the twenty-plus table mapping.

Security properties:

- `security invoker`
- empty `search_path`
- execution revoked from `public`, `anon`, and `authenticated`
- execution granted only to `service_role`
- Supabase security advisor reports no lint for the new function

The official migration endpoint failed repeatedly at the transport layer. The
same idempotent migration SQL was applied through the SQL endpoint and verified
live; the checked-in migration remains the source of truth for future pushes.

Remote payload verification:

- resolution: `default` for the empty root slug
- 5 projects
- 107 library items
- 20 layout blocks
- 94,790-byte JSON payload

## Application refactor

`getPublicPageData()` is the shared request-memoized page loader for `/` and
`/:slug`. It maps the aggregated source with the same pure mapper used by the
legacy loader and returns the profile ID needed by analytics.

Fallback behavior remains available when the new RPC is missing or malformed:
the application runs the former data, layout, and profile ID reads in parallel.
Named-profile misses retain the former system-default layout behavior.

The source normalizer and readme mapper are now reusable functions instead of
duplicated transformations.

## Production measurements

The server was rebuilt and restarted before measurement.

| Sample | Root TTFB |
| --- | ---: |
| First request after restart | 14.54 s |
| Warm 1 | 7.48 s |
| Warm 2 | 1.32 s |
| Warm 3 | 1.04 s |
| Warm 4 | 2.08 s |
| Warm 5 | 1.37 s |

The five warm samples have a 1.37 s median, down from the stage 3 median of
4.81 s: approximately 72% lower. The cold sample remains high and is the next
server-side target.

The in-app browser recorded 6.08 s TTFB on its first root reload after the new
server started. The named `/JacksonHe04` route returned HTTP 200 with a 6.52 s
first curl sample.

## Browser regression

The in-app browser verified:

- root and `/JacksonHe04` both render the same intended profile
- title remains `缨缨｜All About Myself`
- WebGL world reaches `WebGL live`
- coastal house, map, route, controls, and wildlife render
- archive contains exactly 18 article sections
- music contains 30 albums
- movies contain 1 film, `情书`
- books contain 3 records
- messages contain 2 approved entries

## Engineering checks

- `pnpm exec tsc --noEmit`
- `pnpm build`
- `git diff --check`
- production HTTP 200 for `/` and `/JacksonHe04`
- all touched files remain below 300 lines
- application diff is net smaller despite adding the shared loader

## Next bottleneck

Cold database and connection startup still dominates the first response. The
next stage should introduce explicit application-level caching with mutation
driven invalidation, rather than relying only on per-request memoization or
unbounded time-based staleness.
