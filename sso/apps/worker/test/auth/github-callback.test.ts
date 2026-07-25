import { describe, expect, it, vi } from "vitest";
import { env } from "cloudflare:test";
import { createAuth } from "../../src/auth/create-auth";
import {
  handleGitHubCallback,
  rewriteGitHubCallbackRequest,
} from "../../src/auth/github-callback";
import {
  GITHUB_CALLBACK_URL,
  AUTH_BASE_URL,
} from "../../src/auth/constants";

describe("GitHub callback adapter", () => {
  it("uses the configured public callback in GitHub authorization requests", async () => {
    const auth = createAuth(env, {
      sendVerificationOTP: async () => {},
    });
    const context = await auth.$context;
    const github = context.socialProviders.find(({ id }) => id === "github");

    const authorizationURL = await github!.createAuthorizationURL({
      state: "signed-state",
      codeVerifier: "pkce-verifier",
      redirectURI: `${AUTH_BASE_URL}/callback/github`,
    });

    expect(authorizationURL.searchParams.get("redirect_uri")).toBe(
      GITHUB_CALLBACK_URL,
    );
  });

  it("preserves the callback request while routing it to Better Auth", async () => {
    const original = new Request(
      `${GITHUB_CALLBACK_URL}?code=github-code&state=signed-state`,
      {
        headers: {
          cookie: "oauth_state=state-cookie",
          "user-agent": "callback-test",
        },
      },
    );
    const rewritten = rewriteGitHubCallbackRequest(original);

    expect(rewritten.url).toBe(
      `${AUTH_BASE_URL}/callback/github?code=github-code&state=signed-state`,
    );
    expect(rewritten.method).toBe("GET");
    expect(rewritten.headers.get("cookie")).toBe(
      "oauth_state=state-cookie",
    );

    const handler = vi.fn(
      async (_request: Request) => new Response(null, { status: 302 }),
    );
    const response = await handleGitHubCallback({ handler }, original);

    expect(response.status).toBe(302);
    expect(handler).toHaveBeenCalledOnce();
    expect(handler.mock.calls[0]![0].url).toBe(rewritten.url);
  });
});
