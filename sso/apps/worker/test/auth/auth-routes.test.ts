import { env } from "cloudflare:test";
import { describe, expect, it } from "vitest";
import { createApp } from "../../src/app";
import type { VerificationOTPMessage } from "../../src/auth/create-auth";
import { cookieFrom } from "./auth-test-helpers";

describe("central authentication routes", () => {
  it("exposes email registration and optional credentials through the public API", async () => {
    const deliveries: VerificationOTPMessage[] = [];
    const protectedActions: string[] = [];
    const securityNotifications: string[] = [];
    const app = createApp({
      createEmailService: () => ({
        sendVerificationOTP: async (message) => {
          deliveries.push(message);
        },
        sendSecurityNotification: async ({ event }) => {
          securityNotifications.push(event);
        },
      }),
      createSecurityGuard: () => ({
        protect: async ({ action }) => {
          protectedActions.push(action);
          return { allowed: true };
        },
      }),
      deferBackgroundTasks: false,
    });
    const email = "central-route-user@inon.space";
    const password = "central-route-password";

    const sendResponse = await app.request(
      "https://inon.space/api/sso/auth/email-otp/send-verification-otp",
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
          origin: "https://inon.space",
        },
        body: JSON.stringify({ email, type: "sign-in" }),
      },
      env,
    );
    expect(sendResponse.status).toBe(200);
    expect(deliveries).toHaveLength(1);

    const signInResponse = await app.request(
      "https://inon.space/api/sso/auth/sign-in/email-otp",
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
          origin: "https://inon.space",
        },
        body: JSON.stringify({ email, otp: deliveries[0]!.otp }),
      },
      env,
    );
    expect(signInResponse.status).toBe(200);
    const setCookie = signInResponse.headers.get("set-cookie");
    expect(setCookie).toContain("HttpOnly");
    expect(setCookie).toContain("Secure");
    expect(setCookie).toContain("SameSite=Lax");
    const cookie = cookieFrom(signInResponse);

    const usernameResponse = await app.request(
      "https://inon.space/api/sso/account/username",
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
          cookie,
          origin: "https://inon.space",
        },
        body: JSON.stringify({ username: "中央-User" }),
      },
      env,
    );
    expect(usernameResponse.status).toBe(200);

    const passwordResponse = await app.request(
      "https://inon.space/api/sso/account/password",
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
          cookie,
          origin: "https://inon.space",
        },
        body: JSON.stringify({ password }),
      },
      env,
    );
    expect(passwordResponse.status).toBe(200);

    const profileResponse = await app.request(
      "https://inon.space/api/sso/account/profile",
      {
        headers: { cookie },
      },
      env,
    );
    expect(profileResponse.status).toBe(200);
    expect(await profileResponse.json()).toMatchObject({
      user: {
        email,
        username: "中央-user",
      },
      hasPassword: true,
      githubLinked: false,
    });

    const sessionsResponse = await app.request(
      "https://inon.space/api/sso/account/sessions",
      {
        headers: { cookie },
      },
      env,
    );
    expect(sessionsResponse.status).toBe(200);
    const sessions = await sessionsResponse.json<{
      sessions: Array<Record<string, unknown>>;
    }>();
    expect(sessions.sessions).toHaveLength(1);
    expect(sessions.sessions[0]).not.toHaveProperty("token");
    expect(sessions.sessions[0]).toMatchObject({ current: true });

    const usernameSignIn = await app.request(
      "https://inon.space/api/sso/auth/sign-in/username",
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
          origin: "https://inon.space",
        },
        body: JSON.stringify({
          username: "中央-user",
          password,
        }),
      },
      env,
    );
    expect(usernameSignIn.status).toBe(200);
    expect(protectedActions).toEqual([
      "otp_send",
      "otp_verify",
      "account_mutation",
      "account_mutation",
      "password_login",
    ]);
    expect(securityNotifications).toEqual([
      "username_updated",
      "password_updated",
    ]);
  });
});
