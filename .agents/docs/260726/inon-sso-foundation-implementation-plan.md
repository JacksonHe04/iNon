# iNon SSO Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 建立一个可在 Cloudflare Workers 运行、使用 D1、拥有共享身份契约和完整本地测试环境的 iNon SSO 基础底座。

**Architecture:** `iNon/sso/` 是独立 pnpm Workspace，包含 Worker、Contracts 和后续共享包。Worker 使用 Hono 组织非 Better Auth 路由，D1 保存项目授权和审计基础表，Workers Vitest Integration 在真实 Worker/D1 语义下执行测试。

**Tech Stack:** TypeScript 6.0.3、pnpm、Cloudflare Workers、D1、Wrangler 4.114.0、Hono 4.12.32、Zod 3.23.8、Vitest 4.1.10、`@cloudflare/vitest-pool-workers` 0.18.8。

## Global Constraints

- 所有新增中央代码必须位于 `iNon/sso/`。
- 不修改现有 iNon Supabase 登录行为；本计划只建立可独立测试的底座。
- 五个项目键固定为 `inon`、`leaf`、`pine`、`sayless`、`treez`。
- 项目角色固定为 `member`、`admin`；全局角色固定为 `super_admin`。
- 只有超级管理员能够修改项目管理员身份。
- D1 时间字段统一保存 Unix 毫秒整数。
- 所有 SQL 使用参数绑定。
- 所有公开 JSON 错误遵循同一 Schema。
- 依赖锁定精确版本并提交 `sso/pnpm-lock.yaml`。
- Secret 不进入 Git；本阶段不需要生产 Secret。
- 每个任务遵循测试先行并形成独立提交。

---

### Task 1: Scaffold the isolated SSO workspace

**Files:**
- Create: `sso/package.json`
- Create: `sso/pnpm-workspace.yaml`
- Create: `sso/tsconfig.base.json`
- Create: `sso/.gitignore`
- Create: `sso/README.md`
- Create: `sso/apps/worker/package.json`
- Create: `sso/packages/contracts/package.json`
- Create: `sso/packages/contracts/tsconfig.json`
- Create: `sso/apps/worker/tsconfig.json`

**Interfaces:**
- Consumes: repository Node.js and pnpm installation.
- Produces: `pnpm install`, `pnpm typecheck`, `pnpm test`, and `pnpm build` commands rooted at `iNon/sso/`.

- [ ] **Step 1: Write the workspace smoke assertion**

Create `sso/tools/verify-workspace.mjs`:

```js
import { readFile } from "node:fs/promises";

const root = JSON.parse(await readFile(new URL("../package.json", import.meta.url), "utf8"));
const worker = JSON.parse(
  await readFile(new URL("../apps/worker/package.json", import.meta.url), "utf8"),
);
const contracts = JSON.parse(
  await readFile(new URL("../packages/contracts/package.json", import.meta.url), "utf8"),
);

if (root.private !== true) throw new Error("SSO workspace must remain private");
if (worker.name !== "@inon-sso/worker") throw new Error("Worker package name mismatch");
if (contracts.name !== "@inon/sso-contracts") {
  throw new Error("Contracts package name mismatch");
}
```

- [ ] **Step 2: Run the smoke assertion and verify it fails**

Run:

```bash
cd /Users/jackson/Codes/iNon/sso
node tools/verify-workspace.mjs
```

Expected: failure because the workspace manifests do not exist yet.

- [ ] **Step 3: Create the workspace manifests**

`sso/package.json`:

```json
{
  "name": "@inon/sso-workspace",
  "private": true,
  "packageManager": "pnpm@10.13.1",
  "scripts": {
    "build": "pnpm -r build",
    "check:workspace": "node tools/verify-workspace.mjs",
    "test": "pnpm -r test",
    "typecheck": "pnpm -r typecheck"
  },
  "devDependencies": {
    "typescript": "6.0.3"
  }
}
```

`sso/pnpm-workspace.yaml`:

```yaml
packages:
  - apps/*
  - packages/*
```

`sso/tsconfig.base.json`:

```json
{
  "compilerOptions": {
    "allowJs": false,
    "exactOptionalPropertyTypes": true,
    "forceConsistentCasingInFileNames": true,
    "isolatedModules": true,
    "lib": ["ES2024", "WebWorker"],
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "noEmit": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,
    "strict": true,
    "target": "ES2024",
    "verbatimModuleSyntax": true
  }
}
```

`sso/apps/worker/package.json`:

```json
{
  "name": "@inon-sso/worker",
  "private": true,
  "type": "module",
  "scripts": {
    "build": "wrangler deploy --dry-run",
    "test": "vitest run",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@inon/sso-contracts": "workspace:*",
    "hono": "4.12.32",
    "zod": "3.23.8"
  },
  "devDependencies": {
    "@cloudflare/vitest-pool-workers": "0.18.8",
    "@cloudflare/workers-types": "5.20260724.1",
    "typescript": "6.0.3",
    "vitest": "4.1.10",
    "wrangler": "4.114.0"
  }
}
```

`sso/packages/contracts/package.json`:

```json
{
  "name": "@inon/sso-contracts",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "exports": {
    ".": "./src/index.ts"
  },
  "scripts": {
    "build": "tsc --noEmit",
    "test": "vitest run",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "zod": "3.23.8"
  },
  "devDependencies": {
    "typescript": "6.0.3",
    "vitest": "4.1.10"
  }
}
```

Both package `tsconfig.json` files extend `../../tsconfig.base.json` or
`../../tsconfig.base.json` as appropriate and include `src`, `test`, and
configuration files.

- [ ] **Step 4: Install and verify the workspace**

Run:

```bash
cd /Users/jackson/Codes/iNon/sso
pnpm install --save-exact
pnpm check:workspace
pnpm typecheck
```

Expected: install and workspace assertion pass; typecheck has no source errors.

- [ ] **Step 5: Commit**

```bash
git add sso/package.json sso/pnpm-workspace.yaml sso/pnpm-lock.yaml \
  sso/tsconfig.base.json sso/.gitignore sso/README.md sso/tools \
  sso/apps/worker/package.json sso/apps/worker/tsconfig.json \
  sso/packages/contracts/package.json sso/packages/contracts/tsconfig.json
git commit -m "chore(sso): scaffold cloudflare workspace"
```

### Task 2: Define shared identity contracts

**Files:**
- Create: `sso/packages/contracts/src/projects.ts`
- Create: `sso/packages/contracts/src/roles.ts`
- Create: `sso/packages/contracts/src/identity.ts`
- Create: `sso/packages/contracts/src/errors.ts`
- Create: `sso/packages/contracts/src/username.ts`
- Create: `sso/packages/contracts/src/index.ts`
- Test: `sso/packages/contracts/test/projects.test.ts`
- Test: `sso/packages/contracts/test/username.test.ts`
- Test: `sso/packages/contracts/test/errors.test.ts`

**Interfaces:**
- Consumes: Zod 3.23.8.
- Produces: `ProjectKey`, `ProjectRole`, `GlobalRole`, `InonIdentityClaims`, `ApiError`, `normalizeUsername`, and `validateUsername`.

- [ ] **Step 1: Write failing contract tests**

`test/username.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { normalizeUsername, validateUsername } from "../src/index";

describe("username contract", () => {
  it("normalizes width and English case", () => {
    expect(normalizeUsername("Ａlice-树_01")).toBe("alice-树_01");
  });

  it.each(["Alice", "树_01", "iNon-user"])("accepts %s", (value) => {
    expect(validateUsername(value).success).toBe(true);
  });

  it.each(["has space", "dot.name", "emoji😀", ""])("rejects %s", (value) => {
    expect(validateUsername(value).success).toBe(false);
  });
});
```

`test/projects.test.ts`:

```ts
import { expect, it } from "vitest";
import { projectKeySchema, projectKeys } from "../src/index";

it("contains exactly the five SSO projects", () => {
  expect(projectKeys).toEqual(["inon", "leaf", "pine", "sayless", "treez"]);
  expect(projectKeySchema.safeParse("palm").success).toBe(false);
});
```

`test/errors.test.ts`:

```ts
import { expect, it } from "vitest";
import { apiErrorSchema } from "../src/index";

it("uses one public error envelope", () => {
  expect(
    apiErrorSchema.parse({
      error: { code: "INVALID_REQUEST", message: "请求无效", requestId: "req_1" },
    }),
  ).toEqual({
    error: { code: "INVALID_REQUEST", message: "请求无效", requestId: "req_1" },
  });
});
```

- [ ] **Step 2: Run tests and verify they fail**

Run:

```bash
pnpm --filter @inon/sso-contracts test
```

Expected: module exports are missing.

- [ ] **Step 3: Implement the contracts**

`src/projects.ts`:

```ts
import { z } from "zod";

export const projectKeys = ["inon", "leaf", "pine", "sayless", "treez"] as const;
export const projectKeySchema = z.enum(projectKeys);
export type ProjectKey = z.infer<typeof projectKeySchema>;
```

`src/roles.ts`:

```ts
import { z } from "zod";

export const projectRoleSchema = z.enum(["member", "admin"]);
export type ProjectRole = z.infer<typeof projectRoleSchema>;

export const globalRoleSchema = z.literal("super_admin");
export type GlobalRole = z.infer<typeof globalRoleSchema>;
```

`src/identity.ts`:

```ts
import { z } from "zod";
import { projectKeySchema } from "./projects";
import { projectRoleSchema } from "./roles";

export const inonIdentityClaimsSchema = z.object({
  sub: z.string().min(1),
  email: z.string().email(),
  emailVerified: z.boolean(),
  username: z.string().nullable(),
  project: projectKeySchema,
  projectRole: projectRoleSchema,
});

export type InonIdentityClaims = z.infer<typeof inonIdentityClaimsSchema>;
```

`src/username.ts`:

```ts
import { z } from "zod";

const usernamePattern = /^[\p{Script=Han}A-Za-z0-9_-]+$/u;
export const usernameSchema = z.string().min(1).max(30).regex(usernamePattern);

export function normalizeUsername(value: string): string {
  return value.trim().normalize("NFKC").toLocaleLowerCase("en-US");
}

export function validateUsername(value: string) {
  return usernameSchema.safeParse(value);
}
```

`src/errors.ts`:

```ts
import { z } from "zod";

export const apiErrorCodeSchema = z.enum([
  "INVALID_REQUEST",
  "UNAUTHENTICATED",
  "FORBIDDEN",
  "NOT_FOUND",
  "CONFLICT",
  "RATE_LIMITED",
  "INTERNAL_ERROR",
]);

export const apiErrorSchema = z.object({
  error: z.object({
    code: apiErrorCodeSchema,
    message: z.string(),
    requestId: z.string(),
  }),
});

export type ApiError = z.infer<typeof apiErrorSchema>;
```

`src/index.ts` exports every public symbol from the five focused modules.

- [ ] **Step 4: Run tests and typecheck**

Run:

```bash
pnpm --filter @inon/sso-contracts test
pnpm --filter @inon/sso-contracts typecheck
```

Expected: all tests pass.

- [ ] **Step 5: Commit**

```bash
git add sso/packages/contracts
git commit -m "feat(sso): add shared identity contracts"
```

### Task 3: Add the Worker runtime and canonical response shell

**Files:**
- Create: `sso/apps/worker/src/env.ts`
- Create: `sso/apps/worker/src/http/errors.ts`
- Create: `sso/apps/worker/src/http/request-id.ts`
- Create: `sso/apps/worker/src/http/canonical-origin.ts`
- Create: `sso/apps/worker/src/app.ts`
- Create: `sso/apps/worker/src/index.ts`
- Create: `sso/apps/worker/wrangler.jsonc`
- Create: `sso/apps/worker/vitest.config.ts`
- Create: `sso/apps/worker/test/env.d.ts`
- Test: `sso/apps/worker/test/health.test.ts`
- Test: `sso/apps/worker/test/canonical-origin.test.ts`

**Interfaces:**
- Consumes: `ApiError` and Hono.
- Produces: `createApp(env): Hono`, `Env`, `GET /health`, request IDs, and canonical-origin enforcement.

- [ ] **Step 1: Write failing Worker tests**

`test/health.test.ts`:

```ts
import { env, SELF } from "cloudflare:test";
import { expect, it } from "vitest";

it("returns a canonical health response", async () => {
  const response = await SELF.fetch("https://inon.space/sso/api/health");
  expect(response.status).toBe(200);
  expect(await response.json()).toEqual({
    status: "ok",
    service: "inon-sso",
    environment: env.ENVIRONMENT,
  });
  expect(response.headers.get("x-request-id")).toMatch(/^req_/);
});
```

`test/canonical-origin.test.ts`:

```ts
import { SELF } from "cloudflare:test";
import { expect, it } from "vitest";

it("does not accept a stateful request on the internal origin", async () => {
  const response = await SELF.fetch("https://inon-sso.internal/sso/api/session", {
    method: "POST",
  });
  expect(response.status).toBe(421);
  expect(await response.json()).toMatchObject({
    error: { code: "INVALID_REQUEST" },
  });
});
```

- [ ] **Step 2: Run tests and verify they fail**

Run:

```bash
pnpm --filter @inon-sso/worker test
```

Expected: Worker entry and configuration are missing.

- [ ] **Step 3: Implement the runtime shell**

`src/env.ts`:

```ts
export interface Env {
  DB: D1Database;
  ENVIRONMENT: "development" | "preview" | "production";
  CANONICAL_ORIGIN: string;
}
```

`src/http/request-id.ts`:

```ts
export function createRequestId(): string {
  return `req_${crypto.randomUUID()}`;
}
```

`src/http/canonical-origin.ts` must allow safe `GET /health` checks from the
test/internal origin but return `421` for stateful non-canonical requests.
`src/http/errors.ts` must create the `ApiError` envelope from Contracts.

`src/app.ts`:

```ts
import { Hono } from "hono";
import type { Env } from "./env";

type Bindings = { Bindings: Env; Variables: { requestId: string } };

export function createApp() {
  const app = new Hono<Bindings>().basePath("/sso/api");

  app.get("/health", (context) =>
    context.json({
      status: "ok",
      service: "inon-sso",
      environment: context.env.ENVIRONMENT,
    }),
  );

  return app;
}
```

Add request ID and canonical-origin middleware before routes. Export
`createApp().fetch` from `src/index.ts`.

`wrangler.jsonc` defines local development vars and a `DB` D1 binding. The
remote database ID is added only after Wrangler or Cloudflare returns a real
opaque ID; do not invent it.

Configure `vitest.config.ts` with `cloudflareTest`, `wrangler.configPath`, and
test bindings:

```ts
import { cloudflareTest } from "@cloudflare/vitest-pool-workers/config";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [
    cloudflareTest({
      wrangler: { configPath: "./wrangler.jsonc" },
      miniflare: {
        bindings: {
          ENVIRONMENT: "development",
          CANONICAL_ORIGIN: "https://inon.space",
        },
      },
    }),
  ],
});
```

- [ ] **Step 4: Run Worker tests and build**

Run:

```bash
pnpm --filter @inon-sso/worker test
pnpm --filter @inon-sso/worker typecheck
pnpm --filter @inon-sso/worker build
```

Expected: health and origin tests pass; Wrangler dry run succeeds.

- [ ] **Step 5: Commit**

```bash
git add sso/apps/worker
git commit -m "feat(sso): add cloudflare worker foundation"
```

### Task 4: Create the D1 authorization schema

**Files:**
- Create: `sso/apps/worker/migrations/0001_authorization_foundation.sql`
- Create: `sso/apps/worker/test/apply-migrations.ts`
- Modify: `sso/apps/worker/vitest.config.ts`
- Test: `sso/apps/worker/test/migrations.test.ts`

**Interfaces:**
- Consumes: `ProjectKey`, `ProjectRole`, `GlobalRole`.
- Produces: `projects`, `project_memberships`, `global_roles`, and `audit_logs` tables.

- [ ] **Step 1: Write the failing migration test**

```ts
import { env } from "cloudflare:test";
import { expect, it } from "vitest";

it("seeds exactly the five projects", async () => {
  const result = await env.DB.prepare(
    "SELECT project_key FROM projects ORDER BY project_key",
  ).all<{ project_key: string }>();

  expect(result.results.map((row) => row.project_key)).toEqual([
    "inon",
    "leaf",
    "pine",
    "sayless",
    "treez",
  ]);
});

it("allows only one active super administrator", async () => {
  await env.DB.prepare(
    "INSERT INTO global_roles (user_id, role, created_at, created_by) VALUES (?, ?, ?, ?)",
  ).bind("user_1", "super_admin", 1, "bootstrap").run();

  await expect(
    env.DB.prepare(
      "INSERT INTO global_roles (user_id, role, created_at, created_by) VALUES (?, ?, ?, ?)",
    ).bind("user_2", "super_admin", 2, "bootstrap").run(),
  ).rejects.toThrow();
});
```

- [ ] **Step 2: Run tests and verify they fail**

Run:

```bash
pnpm --filter @inon-sso/worker test -- migrations.test.ts
```

Expected: tables do not exist.

- [ ] **Step 3: Implement the migration**

The migration must:

- Use `TEXT` IDs and `INTEGER` Unix millisecond timestamps.
- Constrain project keys to the five allowed values.
- Constrain membership roles to `member` or `admin`.
- Add `UNIQUE(project_id, user_id)`.
- Make `global_roles.role` the primary key so only one `super_admin` row exists.
- Add indexes for membership lookup by user and project.
- Seed all five project rows with stable IDs equal to their project keys.
- Create append-only `audit_logs` with actor, subject, project, action,
  request ID, metadata JSON, and timestamp.

Load migrations in Vitest with `readD1Migrations()` and apply them in
`test/apply-migrations.ts` using `applyD1Migrations`.

- [ ] **Step 4: Run migration tests**

Run:

```bash
pnpm --filter @inon-sso/worker test -- migrations.test.ts
pnpm --filter @inon-sso/worker test
```

Expected: seed, constraints, and full test suite pass.

- [ ] **Step 5: Commit**

```bash
git add sso/apps/worker/migrations sso/apps/worker/test \
  sso/apps/worker/vitest.config.ts
git commit -m "feat(sso): add d1 authorization schema"
```

### Task 5: Implement idempotent membership repositories

**Files:**
- Create: `sso/apps/worker/src/authorization/project-memberships.ts`
- Create: `sso/apps/worker/src/authorization/global-roles.ts`
- Create: `sso/apps/worker/src/audit/audit-log.ts`
- Test: `sso/apps/worker/test/project-memberships.test.ts`
- Test: `sso/apps/worker/test/global-roles.test.ts`

**Interfaces:**
- Consumes: D1 binding and shared role contracts.
- Produces:

```ts
export interface ProjectMembershipRepository {
  ensureMember(userId: string, project: ProjectKey, now: number): Promise<ProjectRole>;
  getRole(userId: string, project: ProjectKey): Promise<ProjectRole | null>;
  setRole(input: {
    actorUserId: string;
    targetUserId: string;
    project: ProjectKey;
    role: ProjectRole;
    requestId: string;
    now: number;
  }): Promise<void>;
}
```

- [ ] **Step 1: Write failing repository tests**

Test these exact behaviors:

```ts
it("creates one ordinary membership under concurrent first access");
it("returns the existing admin role without downgrading it");
it("rejects project-admin role mutation by a non-super-admin actor");
it("allows the sole super-admin to appoint and revoke project admins");
it("writes one audit record for a successful role change");
```

The concurrent test calls `ensureMember()` at least 10 times with
`Promise.all` and then asserts one row exists.

- [ ] **Step 2: Run repository tests and verify they fail**

Run:

```bash
pnpm --filter @inon-sso/worker test -- project-memberships.test.ts global-roles.test.ts
```

Expected: repository modules are missing.

- [ ] **Step 3: Implement repositories**

`ensureMember()` uses:

```sql
INSERT INTO project_memberships (
  id, project_id, user_id, role, created_at, updated_at
) VALUES (?, ?, ?, 'member', ?, ?)
ON CONFLICT(project_id, user_id) DO NOTHING
```

It then reads and returns the actual role so an existing administrator is
never downgraded.

`setRole()` must:

1. Verify the actor is the single `super_admin`.
2. Use a conditional insert/update for the target membership.
3. Append an audit row in the same D1 batch.
4. Return `FORBIDDEN` without changing data when the actor is not superadmin.

- [ ] **Step 4: Run repository and full tests**

Run:

```bash
pnpm --filter @inon-sso/worker test
pnpm --filter @inon-sso/worker typecheck
```

Expected: concurrency, authorization, and audit tests pass.

- [ ] **Step 5: Commit**

```bash
git add sso/apps/worker/src/authorization sso/apps/worker/src/audit \
  sso/apps/worker/test
git commit -m "feat(sso): add project authorization repositories"
```

### Task 6: Expose read-only project diagnostics and verify the foundation

**Files:**
- Create: `sso/apps/worker/src/projects/project-service.ts`
- Create: `sso/apps/worker/src/projects/project-routes.ts`
- Modify: `sso/apps/worker/src/app.ts`
- Test: `sso/apps/worker/test/projects-route.test.ts`
- Create: `.agents/docs/260726/inon-sso-foundation-verification.md`

**Interfaces:**
- Consumes: D1 `projects` table.
- Produces: authenticated-internal `GET /sso/api/internal/projects` and final foundation verification evidence.

- [ ] **Step 1: Write the failing route test**

```ts
import { SELF } from "cloudflare:test";
import { expect, it } from "vitest";

it("does not expose project diagnostics without the internal token", async () => {
  const response = await SELF.fetch(
    "https://inon.space/sso/api/internal/projects",
  );
  expect(response.status).toBe(401);
});

it("returns the seeded project registry to an internal caller", async () => {
  const response = await SELF.fetch(
    "https://inon.space/sso/api/internal/projects",
    { headers: { authorization: "Bearer test-internal-token" } },
  );
  expect(response.status).toBe(200);
  expect(await response.json()).toMatchObject({
    projects: [
      { key: "inon" },
      { key: "leaf" },
      { key: "pine" },
      { key: "sayless" },
      { key: "treez" },
    ],
  });
});
```

Add `INTERNAL_API_TOKEN` to the typed test environment. Compare tokens with a
constant-time byte comparison helper rather than a plain early-return string
loop.

- [ ] **Step 2: Run route test and verify it fails**

Run:

```bash
pnpm --filter @inon-sso/worker test -- projects-route.test.ts
```

Expected: route is missing.

- [ ] **Step 3: Implement the route and verification document**

The route:

- Requires `Authorization: Bearer`.
- Never returns Client Secrets.
- Returns project key, name, and status only.
- Uses the shared `ProjectKey` parser before serialization.

Create the verification document with the exact commands and outputs from:

```bash
cd /Users/jackson/Codes/iNon/sso
pnpm check:workspace
pnpm typecheck
pnpm test
pnpm build
git diff --check
```

Also record:

- Dependency versions from `pnpm list --depth 0`.
- D1 migration filenames.
- Tests proving single superadmin and idempotent membership.
- Confirmation that no `.env` or Secret file is tracked.

- [ ] **Step 4: Run the complete foundation verification**

Run:

```bash
cd /Users/jackson/Codes/iNon/sso
pnpm check:workspace
pnpm typecheck
pnpm test
pnpm build
cd /Users/jackson/Codes/iNon
git diff --check
git status --short
```

Expected: every command passes and only intended SSO files plus ignored
`.agents` documents are changed.

- [ ] **Step 5: Commit**

Use the `git-commit` Skill, then commit the route and force-add the two approved
design documents, self-review, program plan, foundation plan, and verification
document because `.agents/` is ignored:

```bash
git add sso
git add -f .agents/docs/260726/inon-sso-design.md \
  .agents/docs/260726/inon-sso-design-review.md \
  .agents/docs/260726/inon-sso-program-implementation-plan.md \
  .agents/docs/260726/inon-sso-foundation-implementation-plan.md \
  .agents/docs/260726/inon-sso-foundation-verification.md
git commit -m "feat(sso): complete cloudflare foundation"
```
