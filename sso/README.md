# iNon SSO

The central iNon identity platform for iNon, Leaf, PINE, SAYLESS, and Treez.

The public identity origin is `https://inon.space`. Cloudflare Workers and D1
host the authentication backend, identity data, sessions, authorization, and
audit records.

## Workspace

- `apps/worker`: Cloudflare Worker and D1 migrations.
- `packages/contracts`: shared identity, project, role, and error contracts.
- `packages/next`: shared Next.js integration SDK.
- `packages/ui`: central and project-facing identity components.

Run workspace commands from this directory:

```bash
pnpm install --frozen-lockfile
pnpm typecheck
pnpm test
pnpm build
```

## One-time control-plane bootstrap

The global super administrator is never inferred from an email during a user
request. After the owner has completed email verification once, bind that
verified D1 user through the internal API:

```bash
INON_SSO_WORKER_URL=https://inon.space \
INON_SSO_INTERNAL_TOKEN=... \
INON_SSO_SUPER_ADMIN_EMAIL=... \
pnpm bootstrap:super-admin
```

The command is idempotent for the same user and fails closed if the sole role
is already bound to another user. The email and internal token are runtime
inputs only and must not be committed.

The same internal token provisions the five first-party OAuth clients:

```bash
INON_SSO_WORKER_URL=https://inon.space \
INON_SSO_INTERNAL_TOKEN=... \
pnpm bootstrap:oauth-clients
```

New client secrets are written only to the ignored, mode-0600
`.secrets/oauth-clients.json`.
