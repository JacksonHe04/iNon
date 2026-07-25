import { env } from "cloudflare:test";
import { expect, it } from "vitest";
import {
  AUTH_BASE_URL,
  OAUTH_ISSUER,
} from "../../src/auth/constants";
import { createAuth } from "../../src/auth/create-auth";
import {
  PROJECT_CLAIM,
  PROJECT_ROLE_CLAIM,
} from "../../src/oauth/claims";

it("publishes the central OpenID configuration for S256 clients", async () => {
  const auth = createAuth(env, {
    sendVerificationOTP: async () => {},
  });
  const response = await auth.handler(
    new Request(`${AUTH_BASE_URL}/.well-known/openid-configuration`),
  );

  expect(response.status).toBe(200);
  expect(await response.json()).toMatchObject({
    issuer: OAUTH_ISSUER,
    authorization_endpoint: `${AUTH_BASE_URL}/oauth2/authorize`,
    token_endpoint: `${AUTH_BASE_URL}/oauth2/token`,
    jwks_uri: `${AUTH_BASE_URL}/jwks`,
    code_challenge_methods_supported: ["S256"],
    grant_types_supported: ["authorization_code", "refresh_token"],
    scopes_supported: ["openid", "profile", "email", "offline_access"],
    claims_supported: expect.arrayContaining([
      "sub",
      "email",
      "email_verified",
      "preferred_username",
      PROJECT_CLAIM,
      PROJECT_ROLE_CLAIM,
    ]),
  });
});
