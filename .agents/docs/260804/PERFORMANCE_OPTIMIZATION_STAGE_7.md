# Performance optimization stage 7

Date: 2026-08-04

## Scope

Reduce unnecessary rendering work, break large editing and style surfaces into
reusable modules, and enforce the repository rule that no runtime source file
exceeds 300 lines.

## Runtime changes

- replaced the decorative WebGL scenes in the creation and product blocks with
  lightweight archival charts and equipment graphics
- retained the music album and film poster presentation instead of flattening
  those collections into generic cards
- split dashboard tabs so inactive content is not eagerly bundled and mounted
- separated login fields, account security sections, library category editing,
  item editing, preview rendering, and editor state into focused modules
- split identity, creation, and media editor schemas by domain
- added a recoverable account error state with retry instead of leaving the
  account page on a permanent loading indicator

## Style architecture

The former global style surfaces were divided into focused CSS files for:

- public archive atmosphere, materials, components, and responsive behavior
- world foundation, navigation, inventory, panels, overlays, and collection
  realms
- dashboard, admin, block ornaments, and the verdant application shell
- SSO shell, form material, account presentation, and verdant overrides

The extraction preserves the faded green, deep forest green, worn paper,
botanical, grain, stamp, and staggered archive composition while reducing the
risk that a local visual change silently alters unrelated pages.

## Repository size audit

The final audit covered TypeScript, TSX, JavaScript, MJS, CSS, and SQL under
`app`, `components`, `hooks`, `lib`, `types`, `scripts`, and `supabase`.

- largest tracked runtime file: `components/world/FirstPersonExplorer.tsx`,
  exactly 300 lines
- initial content migration: reduced from 620 to 243 lines
- initial migration SQL tokens: 17,255 before and after compaction
- all audited files: at most 300 lines

The migration change only removes non-semantic SQL whitespace. Statement order,
quoted values, function bodies, and SQL tokens remain unchanged.

Local ignored maintenance scripts were also divided into reusable import and
cover-discovery helpers and passed `node --check`. They remain local because the
repository intentionally ignores `scripts/`; they were not force-added.

## Browser verification

The in-app browser was used throughout the stage to validate real interactions:

- the dashboard loaded and switched client-side content tabs
- the login page switched between one-time-code and password fields
- music preview retained 15 album entries
- film preview retained the existing film presentation, including `情书`
- library category management worked for `摇滚/独立` and `Hip-Hop`
- creation category selection updated the five-column archive layout
- the default public archive created no WebGL canvas
- the public archive retained faded green, paper, botanical, and staggered card
  composition after the CSS split
- the SSO page retained the deep-forest side panel and worn-paper form surface

World mode was not repeatedly used for the final regression because its active
3D scene remains intentionally heavy and had already been isolated behind an
explicit user action in stage 6.

## Verification commands

- `git diff --check`
- `pnpm exec tsc --noEmit`
- `pnpm build`
- `node --check` for each local maintenance script
- token-normalized comparison of the historical migration before and after
  compaction

The production build completed successfully with Next.js 16.2.10.

## External configuration note

After the local development server was restarted, the account API reported that
`INON_SSO_BACKEND_URL` was not configured in the local environment. The UI now
shows that failure and provides retry, but the missing backend address cannot be
invented or committed. This is an environment handoff, not a frontend build
failure.

## Next performance target

The explicit 3D world remains the largest known runtime cost. Its next safe
optimization boundary is region-based scene streaming and disposal of distant
geometry, textures, and wildlife while preserving collision, navigation, and
the open-world presentation.
