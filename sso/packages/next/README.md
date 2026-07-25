# @inon-ai/inon-sso

Shared server-side OAuth and project-session client for applications using the
iNon account system.

The package keeps project credentials on the server, performs Authorization
Code + PKCE exchanges with `https://inon.space/api/sso/auth`, and stores each
project session in an encrypted, HTTP-only cookie.

## Usage

```ts
import { createInonSso } from "@inon-ai/inon-sso";

export const sso = createInonSso({
  project: "sayless",
  clientId: process.env.INON_SSO_CLIENT_ID!,
  clientSecret: process.env.INON_SSO_CLIENT_SECRET!,
  sessionSecret: process.env.INON_SSO_SESSION_SECRET!,
  appOrigin: "https://sayless.inon.space",
});
```

Mount `sso.handler` at `/api/auth/inon/[action]`. The supported actions are
`login`, `callback`, `refresh`, `logout`, and `session`.

No application secret is bundled in this package. Each application receives
its own OAuth client ID and client secret from the iNon SSO deployment.
