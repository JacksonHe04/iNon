import { env, SELF } from "cloudflare:test";
import { expect, it } from "vitest";
import { createApp } from "../src/app";

it("does not accept a stateful request on the internal origin", async () => {
  const response = await SELF.fetch("https://inon-sso.internal/api/sso/session", {
    method: "POST",
  });

  expect(response.status).toBe(421);
  expect(await response.json()).toMatchObject({
    error: { code: "INVALID_REQUEST" },
  });
});

it("does not accept a GitHub callback on a noncanonical origin", async () => {
  const response = await SELF.fetch(
    "https://inon-sso.internal/api/sso/github/callback?code=code&state=state",
  );

  expect(response.status).toBe(421);
  expect(await response.json()).toMatchObject({
    error: { code: "INVALID_REQUEST" },
  });
});

it("trusts the client IP only after authenticating the Vercel proxy", async () => {
  const protectedRequests: Array<{
    remoteIp: string | null;
    turnstileAction?: string;
    turnstileToken: string | null;
  }> = [];
  const app = createApp({
    createEmailService: () => ({
      sendVerificationOTP: async () => {},
      sendSecurityNotification: async () => {},
    }),
    createSecurityGuard: () => ({
      protect: async ({
        remoteIp,
        turnstileAction,
        turnstileToken,
      }) => {
        protectedRequests.push({
          remoteIp,
          ...(turnstileAction ? { turnstileAction } : {}),
          turnstileToken,
        });
        return { allowed: true };
      },
    }),
    deferBackgroundTasks: false,
  });

  const response = await app.request(
    "https://inon-sso.internal/api/sso/auth/email-otp/send-verification-otp",
    {
      method: "POST",
      headers: {
        "content-type": "application/json",
        origin: "https://inon.space",
        "x-forwarded-host": "inon.space",
        "x-forwarded-proto": "https",
        "x-inon-client-ip": "203.0.113.42",
        "x-inon-proxy-secret": "test-vercel-proxy-secret",
        "x-turnstile-token": "test-token",
      },
      body: JSON.stringify({
        email: "proxy-ip@inon.space",
        type: "sign-in",
      }),
    },
    env,
  );

  expect(response.status).toBe(200);
  expect(protectedRequests).toEqual([
    {
      remoteIp: "203.0.113.42",
      turnstileAction: "login",
      turnstileToken: "test-token",
    },
  ]);
});
