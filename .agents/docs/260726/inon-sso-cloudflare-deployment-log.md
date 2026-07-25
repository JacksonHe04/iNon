# iNon SSO Cloudflare deployment log

Date: 2026-07-26

## Completed

- Created the production D1 database `inon-sso` in Cloudflare APAC.
- Created a managed Turnstile widget restricted to `inon.space`.
- Stored the Turnstile credentials only in the ignored local `sso/.secrets/`
  directory with `0600` permissions.
- Exported a pre-migration D1 backup to the same ignored secrets directory.
- Applied D1 migrations `0001` through `0005` to production.
- Configured the Worker production variables for the canonical origin, Resend
  sender identity, and Turnstile hostname.
- Deployed the Worker at
  `https://inon-sso.yingyingdontkill.workers.dev`.
- Bootstrapped exactly five confidential first-party OAuth clients with PKCE,
  skipped consent, and hashed client secrets in D1.
- Configured all seven iNon production SSO variables in Vercel.
- Deployed the iNon main site to Vercel production and aliased it to
  `https://inon.space`.

## D1 migration compatibility fix

The first production attempt applied `0002` and then failed on
`0003_username_policy.sql` with `SQLITE_ERROR: incomplete input`. The same
migration succeeded in a fresh local D1 instance.

The nested `SELECT CASE ... RAISE` trigger expressions were rewritten as
equivalent `SELECT RAISE ... WHERE` expressions. This keeps the username
invariants unchanged while avoiding the production D1 parsing failure.

After the rewrite:

- a fresh local D1 instance applied all five migrations;
- production D1 applied `0003`, `0004`, and `0005`;
- no user or membership data existed during the migration.

## OAuth client bootstrap compatibility fix

Better Auth 1.6.25 requires a user session even for
`adminCreateOAuthClient`. The internal API token intentionally does not create
or impersonate a user session.

The bootstrap flow now:

1. generates and stores all five client IDs and secrets locally before making
   the request;
2. sends the complete registry through the protected internal endpoint;
3. hashes each secret with SHA-256 before an atomic D1 batch insert;
4. validates the same IDs, secret hashes, callbacks, scopes, and policy flags
   on every retry.

This makes the operation idempotent and recoverable if the network fails after
the D1 transaction commits.

## Vercel build and proxy fixes

- Restored TypeScript 6 compatibility for existing JSON response consumers.
- Excluded the standalone `sso` workspace from the Next.js root typecheck; the
  main site consumes the built `@inon-ai/inon-sso` package through its exports.
- Rebuilt proxied Worker responses explicitly in the Next.js route handler.
  Vercel otherwise returned the correct status and headers with an empty body.

The production Vercel build completed compilation, TypeScript checking, page
data collection, and static generation before the `inon.space` alias moved.

## Shared project client package

The reusable Next.js OAuth and encrypted-session client is prepared as the
public npm package `@inon-ai/inon-sso`. Its manifest pins the public npm
registry, public access, MIT license, source repository, and a build-only
prepublish step. The package contains only compiled runtime files, declarations,
source maps, its manifest, and README; application client secrets remain
deployment environment variables.

The local npm client is not currently authenticated, so the first `0.1.0`
publish remains a manual credential boundary. Project integration can continue
against the workspace build and switch to the published version without
changing the package API.

## Production probes

| Probe | Result |
| --- | --- |
| `GET /api/sso/health` | 200, valid 63-byte production JSON |
| OIDC discovery | 200, canonical issuer and endpoints |
| JWKS | 200, non-empty key set |
| `GET /sso/login` | 200, iNon and GitHub options rendered |
| iNon OAuth login start | 303 to the canonical authorize endpoint |
| Direct Worker stateful request | 421, canonical-origin policy enforced |

## Remaining deployment work

- Integrate and deploy Leaf, PINE, SAYLESS, and Treez.
- Complete the first verified owner login and one-time global superadmin
  bootstrap.
- Exercise email OTP, password setup/login, GitHub login, refresh, logout, and
  cross-project SSO in a browser.
- Rotate the GitHub OAuth and Resend credentials that were exposed during
  setup, then update their platform secrets.
