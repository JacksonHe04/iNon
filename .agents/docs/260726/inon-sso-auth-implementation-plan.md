# iNon SSO Authentication Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. Every behavior change starts with a failing test.

**Goal:** 在 Cloudflare Worker 与 D1 中完成 iNon 中央认证、GitHub 身份绑定、30/90 会话和五个第一方 OAuth/OIDC Client，为中央 Web 与项目接入提供稳定的协议层。

**Architecture:** Better Auth 作为唯一身份与会话内核，挂载在 Worker 的 `/api/sso/auth/*`；固定 GitHub 回调 `/api/sso/github/callback` 通过内部适配器进入 Better Auth。`@better-auth/oauth-provider` 以 PKCE、一次性 Authorization Code 和轮换 Refresh Token 向五个可信项目签发标准 Token，项目身份与角色通过受命名空间保护的 Claims 输出。所有永久数据与权限事实写入 D1，邮件由 Resend 发出，风险入口由 Turnstile 与 D1 限流保护。

**Tech Stack:** TypeScript 6.0.3、Cloudflare Workers、D1、Hono 4.12.32、Better Auth 1.6.25、`@better-auth/oauth-provider` 1.6.25、Resend 6.18.0、Vitest 4.1.10。

## Security invariants

- 唯一公开身份 Origin 是 `https://inon.space`；Worker 自身域名不得成为 Cookie、Issuer 或 Redirect URI。
- 只允许邮箱 OTP 创建账号；Better Auth 邮箱密码注册端点必须关闭。
- OTP 只以哈希形式存储，邮件发送失败不得创建可用验证码。
- 密码只能由已验证会话中的用户设置，或由明确的管理员恢复流程设置。
- GitHub 只有 verified primary email 才可自动创建或按邮箱合并账号。
- 没有 verified primary email 的 GitHub 身份只能在已有 iNon 会话中显式绑定。
- GitHub Access Token、Refresh Token 与 ID Token 不做持久化。
- 每个账号只有一个规范化邮箱；用户名全局唯一且只保留一个可见值。
- Session 滑动窗口为 30 天，绝对期限为创建后 90 天，数据库和应用层共同强制。
- OAuth Client Secret、Refresh Token、OTP、密码和完整 Token 不进入日志、审计、快照或 Git。
- 五个第一方 Client 强制 PKCE，跳过 Consent；未知 Client 不得获得同等待遇。
- 首次为某项目签发 Claims 时幂等创建普通成员关系。
- 项目管理员不能任命或撤销项目管理员；该操作仅全局超级管理员可执行。

## Fixed public surface

| Purpose | Public URL |
|---|---|
| Better Auth API | `https://inon.space/api/sso/auth/*` |
| GitHub callback | `https://inon.space/api/sso/github/callback` |
| OAuth issuer | `https://inon.space/api/sso/auth` |
| iNon callback | `https://inon.space/api/auth/inon/callback` |
| Leaf callback | `https://leaf.inon.space/api/auth/inon/callback` |
| PINE callback | `https://pine.inon.space/api/auth/inon/callback` |
| SAYLESS callback | `https://sayless.inon.space/api/auth/inon/callback` |
| Treez callback | `https://treez.inon.space/api/auth/inon/callback` |

## Locked dependencies and secrets

Pin and commit:

```text
better-auth@1.6.25
@better-auth/oauth-provider@1.6.25
resend@6.18.0
```

Worker secrets:

```text
BETTER_AUTH_SECRET
GITHUB_CLIENT_ID
GITHUB_CLIENT_SECRET
RESEND_API_KEY
TURNSTILE_SECRET_KEY
INTERNAL_API_TOKEN
```

Non-secret Worker variables:

```text
CANONICAL_ORIGIN=https://inon.space
ENVIRONMENT=production
RESEND_FROM=iNon <account@inon.space>
TURNSTILE_SITE_KEY=<public site key>
TURNSTILE_HOSTNAMES=inon.space
```

Generated OAuth Client secrets are written once to an ignored `sso/.secrets/` file before being installed into the corresponding Vercel projects.

---

## Task 1: Lock the authentication runtime

**Files:**

- Modify: `sso/apps/worker/package.json`
- Modify: `sso/pnpm-lock.yaml`
- Modify: `sso/apps/worker/src/env.ts`
- Modify: `sso/.gitignore`
- Create: `sso/apps/worker/src/auth/constants.ts`
- Test: `sso/apps/worker/test/auth/constants.test.ts`

- [x] Write failing tests for canonical base URL, base path, 30-day sliding duration, 90-day absolute duration, GitHub callback, issuer, and the five callback URLs.
- [x] Add exact Better Auth, OAuth Provider, and Resend versions.
- [x] Extend the typed environment without assigning secrets to Wrangler `vars`.
- [x] Ignore `.secrets/` and retain `.dev.vars` ignore coverage.
- [x] Implement constants from one source of truth and make the tests pass.
- [x] Run Worker tests, typecheck, build, and the secret diff scan.
- [x] Commit as `chore(sso): lock central auth runtime`.

## Task 2: Derive and protect the Better Auth D1 schema

**Files:**

- Create: `sso/apps/worker/src/auth/create-auth.ts`
- Create: `sso/apps/worker/src/auth/schema.ts`
- Create: `sso/apps/worker/migrations/0002_better_auth.sql`
- Test: `sso/apps/worker/test/auth/schema.test.ts`
- Test: `sso/apps/worker/test/auth/migrations.test.ts`

- [x] Build the smallest test auth factory against an empty Miniflare D1 database.
- [x] Use Better Auth `getMigrations(auth.options)` to derive the schema for the locked package versions.
- [x] Commit an explicit D1 migration rather than running implicit production migrations.
- [x] Include Better Auth core, username, email OTP, OAuth Provider, absolute session expiry, username change timestamp, and future migration metadata fields.
- [x] Add uniqueness and foreign-key constraints for normalized email, username, provider account, session token, OAuth refresh token identity, and the framework’s atomic single-use code store.
- [x] Add database triggers preventing an update from extending `expiresAt` beyond `absoluteExpiresAt`.
- [x] Add a compatibility test proving a fully migrated database produces no missing Better Auth table or column migrations.
- [x] Add a clean-database migration test and a replay test.
- [x] Commit as `feat(sso): add central auth schema`.

## Task 3: Implement email OTP registration and login

**Files:**

- Create: `sso/apps/worker/src/auth/email.ts`
- Create: `sso/apps/worker/src/auth/email-otp.ts`
- Create: `sso/apps/worker/src/email/email-service.ts`
- Create: `sso/apps/worker/src/email/resend-email-service.ts`
- Create: `sso/apps/worker/src/email/templates/verification-code.ts`
- Modify: `sso/apps/worker/src/auth/create-auth.ts`
- Test: `sso/apps/worker/test/auth/email-otp.test.ts`
- Test: `sso/apps/worker/test/email/resend-email-service.test.ts`

- [x] Write tests proving email normalization is deterministic and a second differently cased address cannot create another account.
- [x] Write tests proving password sign-up is unavailable.
- [x] Write tests for OTP registration, OTP login, expiry, attempt exhaustion, replay, resend invalidation, and concurrent redemption.
- [x] Configure `emailOTP` with hashed storage, explicit expiry, explicit attempt limit, and delivery-failure cleanup; bind Cloudflare `waitUntil` when the Hono route is mounted in Task 7.
- [x] Introduce an injected email service so tests never call the network.
- [x] Send all authentication mail as `iNon <account@inon.space>` and keep codes out of logs.
- [x] Route detailed outcome/request audit events through Task 10, after Task 7 provides canonical request metadata to authentication hooks.
- [x] Commit as `feat(sso): add email otp authentication`.

## Task 4: Add optional username and password credentials

**Files:**

- Create: `sso/apps/worker/src/auth/account-service.ts`
- Create in Task 7: `sso/apps/worker/src/auth/account-routes.ts`
- Modify: `sso/apps/worker/src/auth/create-auth.ts`
- Modify: `sso/packages/contracts/src/username.ts`
- Test: `sso/apps/worker/test/auth/account-service.test.ts`
- Test: `sso/apps/worker/test/auth/password-login.test.ts`

- [x] Write tests for the shared Han/English/digit/underscore/hyphen username rule and global uniqueness.
- [x] Write tests proving an email-only user can continue without username or password.
- [x] Write tests proving only an authenticated verified user can set a password.
- [x] Write tests for email/password and username/password login.
- [x] Write tests proving username changes are rejected until 30 rolling days have elapsed, including concurrent updates.
- [x] Configure the username plugin so normalized and displayed username are identical.
- [x] Disable public username enumeration; expose only the authenticated account update workflow when Task 7 mounts account routes.
- [x] Update username and `usernameChangedAt` atomically in D1.
- [x] Keep self-service account deletion disabled.
- [x] Commit as `feat(sso): add optional account credentials`.

## Task 5: Enforce 30-day sliding and 90-day absolute sessions

**Files:**

- Create: `sso/apps/worker/src/auth/session-policy.ts`
- Mount Better Auth session routes in Task 7: `sso/apps/worker/src/auth/auth-routes.ts`
- Modify: `sso/apps/worker/src/auth/create-auth.ts`
- Test: `sso/apps/worker/test/auth/session-policy.test.ts`
- Test: `sso/apps/worker/test/auth/session-routes.test.ts`

- [x] Use a fake clock to test creation, sliding refresh, idle expiry, absolute expiry, and refresh at the boundary.
- [x] Add immutable `absoluteExpiresAt` when the session is created.
- [x] Cap every application update to `min(now + 30 days, absoluteExpiresAt)`.
- [x] Prove the D1 trigger rejects any direct extension beyond the absolute limit.
- [x] Verify authenticated device/session listing and individual revocation for the later central UI; Task 7 mounts the existing Better Auth endpoints.
- [x] Route revocation and expiry audit events through Task 10 without storing session tokens.
- [x] Commit as `feat(sso): enforce bounded sessions`.

## Task 6: Add secure GitHub login and explicit linking

**Files:**

- Create: `sso/apps/worker/src/auth/github.ts`
- Create: `sso/apps/worker/src/auth/github-callback.ts`
- Create: `sso/apps/worker/src/auth/github-routes.ts`
- Modify: `sso/apps/worker/src/auth/create-auth.ts`
- Modify: `sso/apps/worker/src/app.ts`
- Test: `sso/apps/worker/test/auth/github.test.ts`
- Test: `sso/apps/worker/test/auth/github-callback.test.ts`

- [ ] Mock GitHub `/user` and `/user/emails` with Workers fetch interception.
- [ ] Test verified-primary auto-registration and verified-email auto-link.
- [ ] Test that an unverified or missing email cannot create or implicitly merge an account.
- [ ] Test explicit linking from an existing verified iNon session when GitHub has no verified email.
- [ ] Test collision, provider-account uniqueness, unlink safety, and concurrent callback handling.
- [ ] Override GitHub user-info resolution to accept only the verified primary email for implicit flows.
- [ ] Strip GitHub access, refresh, and ID tokens before account persistence.
- [ ] Configure the provider redirect URI as the exact user-configured callback.
- [ ] Add a public callback adapter that internally rewrites to Better Auth’s GitHub callback handler while preserving query parameters and canonical external URL semantics.
- [ ] Commit as `feat(sso): add secure github identity linking`.

## Task 7: Mount the central auth API

**Files:**

- Create: `sso/apps/worker/src/auth/auth-routes.ts`
- Modify: `sso/apps/worker/src/app.ts`
- Modify: `sso/apps/worker/src/index.ts`
- Test: `sso/apps/worker/test/auth/auth-routes.test.ts`
- Test: `sso/apps/worker/test/http/canonical-auth-origin.test.ts`

- [ ] Test all Better Auth methods under `/api/sso/auth/*`.
- [ ] Test that noncanonical stateful requests return 421 before authentication state is mutated.
- [ ] Test secure Cookie attributes, canonical callback construction, CORS denial, and error-envelope boundaries.
- [ ] Preserve raw Better Auth protocol responses where OAuth/OIDC requires standard payloads.
- [ ] Keep internal diagnostic routes protected by constant-time token comparison.
- [ ] Commit as `feat(sso): expose central auth api`.

## Task 8: Add the first-party OAuth/OIDC provider

**Files:**

- Create: `sso/apps/worker/src/oauth/provider.ts`
- Create: `sso/apps/worker/src/oauth/claims.ts`
- Create: `sso/apps/worker/src/oauth/client-registry.ts`
- Modify: `sso/apps/worker/src/auth/create-auth.ts`
- Test: `sso/apps/worker/test/oauth/provider.test.ts`
- Test: `sso/apps/worker/test/oauth/claims.test.ts`

- [ ] Configure OAuth Provider with hashed Client Secret and Token storage, required S256 PKCE, refresh rotation, end-session support, and no dynamic registration.
- [ ] Keep a consent page path configured for protocol completeness, while all five stored first-party clients set `skip_consent=true`.
- [ ] Publish standard subject/email/email-verified/preferred-username Claims plus namespaced project and project-role Claims.
- [ ] Read the project from immutable Client metadata, never from an authorization request parameter.
- [ ] Call `ensureMembership` while producing project Claims so first entry creates only a normal member.
- [ ] Prove a project admin cannot assign another admin through any OAuth or project route.
- [ ] Verify OpenID Configuration, JWKS, issuer, audience, nonce, state, and PKCE error behavior.
- [ ] Commit as `feat(sso): add first party oauth provider`.

## Task 9: Bootstrap five trusted clients safely

**Files:**

- Create: `sso/apps/worker/src/internal/oauth-client-routes.ts`
- Create: `sso/tools/bootstrap-oauth-clients.mjs`
- Create: `sso/packages/contracts/src/oauth.ts`
- Test: `sso/apps/worker/test/internal/oauth-client-routes.test.ts`
- Test: `sso/apps/worker/test/oauth/token-concurrency.test.ts`

- [ ] Add an internal-token-protected, idempotent bootstrap endpoint.
- [ ] Create exactly iNon, Leaf, PINE, SAYLESS, and Treez with one callback URL each, `require_pkce=true`, `skip_consent=true`, and immutable project metadata.
- [ ] Return a newly generated Client Secret only at creation time.
- [ ] Write bootstrap output to a mode-0600 ignored `.secrets/` file without printing it.
- [ ] Add tests proving Authorization Codes are single-use under concurrency.
- [ ] Add tests proving Refresh Tokens rotate and an old token cannot win a concurrent replay.
- [ ] Add tests rejecting unknown Redirect URI, Client, project metadata, and non-S256 PKCE.
- [ ] Commit as `feat(sso): provision trusted project clients`.

## Task 10: Add abuse controls and security notifications

**Files:**

- Create: `sso/apps/worker/src/security/turnstile.ts`
- Create: `sso/apps/worker/src/security/rate-limit.ts`
- Create: `sso/apps/worker/src/security/security-events.ts`
- Create: `sso/apps/worker/migrations/0003_auth_security.sql`
- Create: `sso/apps/worker/src/email/templates/security-notification.ts`
- Test: `sso/apps/worker/test/security/turnstile.test.ts`
- Test: `sso/apps/worker/test/security/rate-limit.test.ts`

- [ ] Verify Turnstile server-side with timeouts, expected action, expected production hostname, and single-use token behavior.
- [ ] Require Turnstile on OTP send and sensitive credential attempts, but retain Cloudflare test keys for deterministic local tests.
- [ ] Implement D1-backed limits by normalized identifier and privacy-preserving IP digest.
- [ ] Rate-limit OTP send, OTP verify, password login, GitHub start, and account mutations separately.
- [ ] Send security notifications for password set/change, username change, GitHub link/unlink, and session revocation.
- [ ] Ensure security failures fail closed without leaking whether an account exists.
- [ ] Commit as `feat(sso): harden authentication entry points`.

## Task 11: Production resources and verification

**Files:**

- Modify: `sso/apps/worker/wrangler.jsonc`
- Modify: `sso/README.md`
- Create: `.agents/docs/260726/inon-sso-auth-verification.md`

- [ ] Confirm the verified Resend domain can send from `account@inon.space`.
- [ ] List existing Turnstile widgets, reuse a matching managed widget or create `iNon SSO` restricted to `inon.space`.
- [ ] Store the Turnstile secret and public site key without exposing the secret in terminal output or Git.
- [ ] Generate and install a strong Better Auth secret and preserve the GitHub secret only in Worker secret storage.
- [ ] Run the full local suite with Node 24.
- [ ] Run D1 migration compatibility checks and inspect pending remote migrations.
- [ ] Apply migrations to the remote `inon-sso` D1 database after Cloudflare’s automatic backup.
- [ ] Deploy the Worker only after all required secrets exist.
- [ ] Probe health, OpenID Configuration, JWKS, canonical-origin rejection, and the exact GitHub callback route without completing a user login.
- [ ] Bootstrap the five OAuth Clients and securely retain their one-time secrets for Plan C and Plan D.
- [ ] Scan tracked files and Git diff for all supplied/generated secrets and representative token patterns.
- [ ] Record exact commands, commit SHA, resource state, probe results, limitations, and rollback steps in the verification document.
- [ ] Commit as `docs(sso): verify central authentication`.

## Completion gate

Plan B is complete only when all of the following are true:

- `pnpm test`, `pnpm typecheck`, and `pnpm build` pass on Node 24.
- A clean local D1 database migrates from zero and matches Better Auth’s locked schema.
- Password sign-up is impossible; OTP registration and all four requested login methods are covered.
- GitHub cannot create or merge an account from an unverified email.
- Session sliding and absolute limits survive application and direct-database tests.
- OAuth discovery and JWKS are valid; PKCE, one-time code consumption, and Refresh Token rotation pass concurrency tests.
- Exactly five trusted Clients exist and none displays Consent.
- Resend and Turnstile production resources are verified.
- No credential, OTP, Client Secret, GitHub Token, Refresh Token, or session token is tracked or logged.
