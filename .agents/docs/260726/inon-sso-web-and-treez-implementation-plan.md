# iNon SSO Central Web, SDK, and Treez Implementation Plan

**Goal:** Put the public account experience on `https://inon.space/sso`,
keep every browser-visible authentication URL on `inon.space`, provide one
reusable Next.js integration package, and cut Treez over as the first relying
party.

## Architecture

1. Vercel serves the iNon website and the central `/sso` pages.
2. `app/api/sso/[...path]/route.ts` is a transparent same-origin proxy to the
   Cloudflare Worker. A shared proxy secret authenticates the Vercel hop; it
   is never exposed to the browser.
3. The Worker canonicalizes only authenticated proxy requests back to
   `https://inon.space`, so Better Auth always constructs the configured
   issuer, callback, and Host-only Cookie semantics.
4. The browser talks only to relative `/api/sso/*` URLs.
5. `sso/packages/next` owns Authorization Code + PKCE, state/nonce,
   encrypted Host-only project cookies, token refresh, claims validation, and
   `requireInonUser` / `requireProjectAdmin`.
6. Treez consumes the package and deletes or disables its old authentication
   entry points only after the central flow is verified.

## Delivery stages

### Stage 1: same-origin proxy

- [x] Add the catch-all Next.js Route Handler.
- [x] Authenticate Vercel-to-Worker traffic with a shared secret.
- [x] Preserve request bodies, query strings, redirects, protocol payloads,
  and all `Set-Cookie` headers.
- [x] Canonicalize authenticated proxy requests in the Worker.
- [ ] Install matching Vercel and Worker secrets and verify production
  forwarding.

### Stage 2: central account web

- [x] Add `/sso`, `/sso/login`, and `/sso/account`.
- [x] Support email OTP registration/login, email password login, username
  password login, and GitHub login.
- [x] Add Turnstile to every protected form with the exact server action.
- [x] Add optional username/password setup, device/session listing, and
  selective session revocation.
- [x] Preserve safe first-party return URLs without open redirects.
- [ ] Verify responsive, keyboard, reduced-motion, loading, and failure states.

### Stage 3: reusable Next.js package

- [ ] Generate PKCE verifier/challenge, state, and nonce on the server.
- [ ] Exchange codes and rotate Refresh Tokens only on the server.
- [ ] Validate issuer, audience, signature, nonce, project, role, and expiry.
- [ ] Store project session material only in a Secure, HttpOnly, Host-only,
  SameSite=Lax cookie.
- [ ] Export stable session and authorization helpers.

### Stage 4: Treez first cutover

- [ ] Inspect Treez's current authentication, users, roles, and environment.
- [ ] Register the production Client ID/Secret in Vercel.
- [ ] Add login, callback, logout, refresh, member creation, and admin guards.
- [ ] Map all first visits to ordinary Treez membership.
- [ ] Remove acceptance of old passwords and sessions.
- [ ] Verify the real deployed flow before proceeding to the other projects.

## Verification

- The browser never contacts a Worker hostname directly.
- Every protocol URL and Cookie is scoped to `inon.space`.
- A noncanonical state-changing request without the proxy secret returns 421.
- A forged forwarded host or proxy secret is rejected.
- Treez can complete login once and reuse the same central iNon session.
- No Client Secret, Refresh Token, central session token, or proxy secret is
  tracked by Git or emitted in logs.
