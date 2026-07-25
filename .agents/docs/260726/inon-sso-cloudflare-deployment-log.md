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

## Remaining deployment work

- Inject Worker secrets without exposing them in shell output or Git.
- Deploy the Worker and verify health, OpenID configuration, and JWKS.
- Configure the iNon Vercel project with the Worker proxy and relying-party
  credentials.
- Bootstrap the five first-party OAuth clients.
- Complete the first verified owner login and one-time global superadmin
  bootstrap.
