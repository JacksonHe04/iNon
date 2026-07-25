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
