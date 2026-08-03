# Performance optimization stage 5

Date: 2026-08-04

## Scope

Remove unused global client providers from every route without touching the
concurrent navigation, world, archive, or assistant refactor in the worktree.

## Finding

`components/providers.tsx` initialized three global contexts:

- TanStack React Query
- Nuqs
- Next Themes

Repository-wide usage search found no Query, Mutation, QueryClient, query-state,
or Nuqs consumer outside the provider itself. Next Themes is actively consumed
by the top navigation and background, so it must remain.

The unused providers imposed work on every route:

- QueryClient allocation and default option initialization
- QueryClient context hydration
- Nuqs adapter hydration
- client bundle modules for both unused libraries

## Change

The global provider now renders only `NextThemesProvider`. This keeps the public
theme interaction unchanged while removing two unused client dependency trees
and an unnecessary React state allocation.

The dependencies remain in `package.json` because the worktree is concurrently
being changed by another task. Removing packages is deferred until that task is
settled and a fresh usage audit can prove they are still unused.

## Bundle evidence

Before the change, the production client output contained two 34 KB chunks that
matched React Query or Nuqs identifiers:

- 34,594 bytes
- 34,514 bytes

After the change, only the 34,594-byte chunk remains. Inspection showed that its
match comes from the bundled package manifest dependency names, not provider
runtime code. The 34,514-byte client chunk was eliminated.

## Browser regression

A new in-app browser tab recorded after the change:

- HTTP navigation completed successfully
- 275 ms TTFB on the cached development server
- 776 ms navigation duration
- 41.08 MB JavaScript heap at 1.2 seconds
- 33 resources at 1.2 seconds
- archive rendered 18 sections
- music retained 30 albums
- movies retained 1 film
- document title remained `缨缨｜All About Myself`
- theme control changed the document root from `light` to `dark`

The browser also exposed the next major client bottleneck: the archive-first
experience still starts the 3D world during an idle callback. At 7.7 seconds the
resource timing buffer reached 250 entries and heap reached 85.56 MB despite the
user remaining in archive mode. That work belongs to a concurrently created,
currently untracked component and was deliberately not modified in this stage.

## Verification

- `pnpm exec tsc --noEmit`
- `pnpm build`
- `git diff --check`
- production client chunk inspection
- fresh in-app browser navigation
- archive music and movie regression
- interactive theme toggle regression
- `components/providers.tsx`: 11 lines

## Next target

Once the concurrent public-experience component is committed, replace idle
world mounting with idle JavaScript-module prefetch. Full WebGL, model, physics,
and texture initialization should begin only after the user chooses world mode.
