# iNon Project Cutover to Central SSO

## Outcome

iNon is now implemented as a first-party relying party of the central
`https://inon.space/api/sso/auth` issuer. The application no longer accepts
Supabase Auth sessions, password registration, password login, password
reset, or the legacy `admin_users` whitelist as identity or authorization.

## Request flow

1. `/login` redirects to `/api/auth/inon/login`.
2. `@inon/sso-next` creates state, nonce, and an S256 PKCE transaction on the
   server and redirects to the central issuer.
3. `/api/auth/inon/callback` validates the authorization response and stores
   only an encrypted, Secure, HttpOnly, Host-only project session.
4. ordinary iNon pages read the local project session; admin pages and APIs
   call central `userinfo` to resolve the current D1 project role.
5. expired admin access redirects through the server-side refresh route,
   which rotates the Refresh Token and preserves the original 90-day
   absolute deadline.

OAuth access and Refresh Tokens are never returned from the project-session
endpoint and are never written to browser storage.

## Project data migration

Identity remains exclusively in Cloudflare D1. Supabase continues to hold
iNon-specific profile/content/storage data and now has one opaque
`profiles.inon_user_id` association.

The additive migration `20260725200605_link_inon_sso_profiles.sql` was applied
to the healthy production iNon Supabase project and is present in its remote
migration registry.

On the first verified SSO visit:

- an already-linked profile is reused;
- otherwise, a legacy Supabase Auth profile with the same email is linked;
- otherwise, a minimal project profile is created for the new ordinary
  member.

The legacy Supabase password is never checked. Local project username edits
were removed; the one global username is managed only at `/sso/account`,
while iNon-specific path aliases remain project data.

## Required runtime values

The iNon Vercel project needs:

```text
INON_SSO_CLIENT_ID
INON_SSO_CLIENT_SECRET
INON_SSO_SESSION_SECRET
INON_SSO_PUBLIC_ORIGIN=https://inon.space
```

The first two values come from the one-time trusted-client bootstrap. The
session secret must be unique to iNon and at least 32 characters.

## Verification evidence

- `@inon/sso-next` typecheck, focused protocol tests, and emitted-package
  import passed on Node 24.
- The complete SSO workspace typecheck and Worker dry-run build passed.
- The changed iNon integration files have zero TypeScript errors.
- Root TypeScript still reports unrelated pre-existing strict-JSON typing
  errors outside the changed integration files.
- The production Next build reaches compilation and currently stops only
  because the local environment cannot fetch Google-hosted Geist font CSS.

The real callback, cookie, refresh, and cross-project SSO flow remains gated
on Worker deployment and trusted-client/Vercel secret installation.
