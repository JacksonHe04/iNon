import { env } from "cloudflare:test";
import { describe, expect, it } from "vitest";
import type { VerificationOTPMessage } from "../../src/auth/create-auth";
import { createAuth } from "../../src/auth/create-auth";
import { AccountService } from "../../src/auth/account-service";
import { authRequest, cookieFrom } from "./auth-test-helpers";

describe("optional account credentials", () => {
  it("allows a verified email-only user to set a password and use both credential logins", async () => {
    const deliveries: VerificationOTPMessage[] = [];
    const auth = createAuth(env, {
      sendVerificationOTP: async (message) => {
        deliveries.push(message);
      },
    });
    const email = "optional-credentials@inon.space";
    const password = "a-long-and-unique-password";

    await auth.handler(
      authRequest("/email-otp/send-verification-otp", {
        email,
        type: "sign-in",
      }),
    );
    const otpSignIn = await auth.handler(
      authRequest("/sign-in/email-otp", {
        email,
        otp: deliveries[0]!.otp,
      }),
    );
    expect(otpSignIn.status).toBe(200);
    const cookie = cookieFrom(otpSignIn);
    const user = await env.DB.prepare("SELECT id FROM user WHERE email = ?")
      .bind(email)
      .first<{ id: string }>();

    await new AccountService(env.DB).setUsername(
      user!.id,
      "凭证-Owner",
      new Date("2026-01-01T00:00:00.000Z"),
    );
    await auth.api.setPassword({
      headers: new Headers({ cookie }),
      body: { newPassword: password },
    });

    const emailSignIn = await auth.handler(
      authRequest("/sign-in/email", { email, password }),
    );
    expect(emailSignIn.status).toBe(200);

    const usernameSignIn = await auth.handler(
      authRequest("/sign-in/username", {
        username: "凭证-owner",
        password,
      }),
    );
    expect(usernameSignIn.status).toBe(200);
  });

  it("refuses password setup without an authenticated verified session", async () => {
    const auth = createAuth(env, {
      sendVerificationOTP: async () => {},
    });

    await expect(
      auth.api.setPassword({
        headers: new Headers(),
        body: { newPassword: "cannot-set-without-session" },
      }),
    ).rejects.toMatchObject({
      status: "UNAUTHORIZED",
    });
  });
});
