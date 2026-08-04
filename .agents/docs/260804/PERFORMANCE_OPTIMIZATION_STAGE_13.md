# Performance Optimization — Stage 13

Date: 2026-08-04

## Scope

This stage focused on the public archive's cold-load cost without changing its information architecture, collection-card design, or the interactive world's visual content.

## Results

| Metric | Before stage | After stage | Change |
| --- | ---: | ---: | ---: |
| Cold archive DOM nodes | 2,011 | 1,075 | -936 (-46.5%) |
| Cold collection images mounted / loaded | 34 / 30 | 0 / 0 | 30 early requests avoided |
| Public entry client references | 336,376 B | 320,380 B | -15,996 B (-4.8%) |
| Public entry CSS | about 195 KiB | 174,949 B | world-only CSS deferred |
| Continuous archive atmosphere animations | 5 | 0 | eliminated |
| Promoted floating relic layers | 12 | 0 | eliminated |
| Backdrop-filter nodes | 1 | 0 | eliminated |
| Visible filtered nodes | 41 observed initially | 25 | -16 |
| Visible atmosphere stacks | 2 | 1 | occluded stack suppressed |

The production world stylesheet is now an asynchronous 35,448 B chunk. Entering the world still produced a live Canvas, minimap, status HUD, main house, mountain, pool, vegetation, wildlife, and field effects.

## Changes

1. Froze the full-screen material, dust, grain, landscape, and relic animations while preserving their static composition.
2. Replaced always-visible Framer Motion wrappers with native transitions and lazy-mounted navigation overlays.
3. Removed the public sidebar that CSS already hid, while retaining a reusable observer-based sidebar implementation for routes that display it.
4. Isolated the one-second clock update to one text component; year progress now updates at the next day boundary.
5. Moved public-data deduplication into the shared one-hour cache fill instead of repeating deep clones per request.
6. Withheld collection image sources until their block approaches the viewport.
7. Collapsed twelve relic filters into one parent filter and replaced the fixed navigation backdrop blur with an opaque forest wash.
8. Suppressed the root atmosphere when the opaque public profile atmosphere is active.
9. Deferred the 53-button tag wall, collection card grids, product desk, and creation chart until near the viewport.
10. Split world-only navigation, HUD, inventory, realm, and interior CSS from the archive entry path.
11. Extracted the shared Codex/dossier shell into `archive-codex-panels.css` after browser evidence showed that it must remain on the archive path.

## Evidence and rejected direction

- A fresh in-app browser tab confirmed `scrollTop = 0`, the bio hero visible, 1,075 DOM nodes, zero images, zero CSS animations, zero backdrop filters, one visible atmosphere, and 25 visible filter nodes.
- Scrolling to music mounted the full album grid and all covers; scrolling to movies showed the existing `情书` card and book covers unchanged.
- Scrolling to tags mounted all 53 buttons; clicking `#01 开发` changed the counter from `0 / 53` to `1 / 53`.
- Product and creation panels mounted near the viewport and retained their selectors and interactions.
- Notification overlay lazy loading, SSO login atmosphere, archive hero stacking, and world entry were visually checked with screenshots.
- A proposed trimmed world-data object was rejected and fully reverted because measured development HTML grew from about 291,406 B to 292,219 B. React Flight was already reusing the original object reference.
- The first CSS split briefly moved shared Codex rules with the HUD. Cold-browser evidence showed the bio hero occluded; the rules were extracted into a shared 84-line file and the regression was reverified before commit.

## Verification

- `pnpm exec tsc --noEmit`
- `pnpm build` with Next.js 16.2.10
- Production build: compile 4.2 s, TypeScript 4.7 s, 12 static pages in 74 ms
- Public entry JS: 320,380 B across seven referenced chunks
- Public entry CSS: 174,949 B
- World browser diagnostics after the corrected CSS split: 127 draw calls, 357,917 triangles, 31 scene nodes
- Runtime source audit: largest app/component/hook/style file is exactly 300 lines; no file in the audited runtime scope exceeds the limit

## Commits

`da4eb9e`, `e76bef7`, `14f8406`, `371e173`, `f805c94`, `cf68744`, `5ef3640`, `f2fd855`, `d560131`, `cd399ab`, `4751aa5`, `6cdeea4`, `9ab2c95`.
