import { env } from "cloudflare:test";
import { beforeEach, describe, expect, it } from "vitest";
import type { VerificationOTPMessage } from "../../src/auth/create-auth";
import { createAuth } from "../../src/auth/create-auth";
import { AUTH_BASE_URL, CANONICAL_ORIGIN } from "../../src/auth/constants";

function authRequest(path: string, body: Record<string, unknown>) {
  return new Request(`${AUTH_BASE_URL}${path}`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      origin: CANONICAL_ORIGIN,
    },
    body: JSON.stringify(body),
  });
}

describe("email OTP authentication", () => {
  let deliveries: VerificationOTPMessage[];

  beforeEach(() => {
    deliveries = [];
  });

  it("registers a normalized email once and stores no plaintext OTP", async () => {
    const auth = createAuth(env, {
      sendVerificationOTP: async (message) => {
        deliveries.push(message);
      },
    });
    const submittedEmail = "  Account.Owner@Example.COM  ";

    const sendResponse = await auth.handler(
      authRequest("/email-otp/send-verification-otp", {
        email: submittedEmail,
        type: "sign-in",
      }),
    );

    expect(sendResponse.status).toBe(200);
    expect(deliveries).toHaveLength(1);
    const delivery = deliveries[0]!;
    expect(delivery.email).toBe("account.owner@example.com");

    const stored = await env.DB.prepare(
      "SELECT value FROM verification",
    ).all<{ value: string }>();
    expect(stored.results.some(({ value }) => value.includes(delivery.otp))).toBe(
      false,
    );

    const signInResponse = await auth.handler(
      authRequest("/sign-in/email-otp", {
        email: submittedEmail,
        otp: delivery.otp,
      }),
    );

    expect(signInResponse.status).toBe(200);
    expect(await signInResponse.json()).toMatchObject({
      user: {
        email: "account.owner@example.com",
        emailVerified: true,
      },
    });

    const secondSend = await auth.handler(
      authRequest("/email-otp/send-verification-otp", {
        email: "ACCOUNT.OWNER@example.com",
        type: "sign-in",
      }),
    );
    expect(secondSend.status).toBe(200);
    const secondDelivery = deliveries.at(-1)!;

    const secondSignIn = await auth.handler(
      authRequest("/sign-in/email-otp", {
        email: "account.owner@example.com",
        otp: secondDelivery.otp,
      }),
    );
    expect(secondSignIn.status).toBe(200);

    const users = await env.DB.prepare(
      "SELECT id FROM user WHERE email = ?",
    )
      .bind("account.owner@example.com")
      .all();
    expect(users.results).toHaveLength(1);
  });

  it("allows exactly one concurrent redemption", async () => {
    const auth = createAuth(env, {
      sendVerificationOTP: async (message) => {
        deliveries.push(message);
      },
    });
    const email = "otp-race@inon.space";

    await auth.handler(
      authRequest("/email-otp/send-verification-otp", {
        email,
        type: "sign-in",
      }),
    );
    const { otp } = deliveries[0]!;

    const responses = await Promise.all([
      auth.handler(authRequest("/sign-in/email-otp", { email, otp })),
      auth.handler(authRequest("/sign-in/email-otp", { email, otp })),
    ]);

    expect(responses.map(({ status }) => status).sort()).toEqual([200, 400]);

    const user = await env.DB.prepare("SELECT id FROM user WHERE email = ?")
      .bind(email)
      .first<{ id: string }>();
    const sessions = await env.DB.prepare(
      "SELECT COUNT(*) AS count FROM session WHERE userId = ?",
    )
      .bind(user!.id)
      .first<{ count: number }>();
    expect(sessions?.count).toBe(1);
  });

  it("invalidates an older code when a replacement is sent", async () => {
    const auth = createAuth(env, {
      sendVerificationOTP: async (message) => {
        deliveries.push(message);
      },
    });
    const email = "otp-rotation@inon.space";

    await auth.handler(
      authRequest("/email-otp/send-verification-otp", {
        email,
        type: "sign-in",
      }),
    );
    await auth.handler(
      authRequest("/email-otp/send-verification-otp", {
        email,
        type: "sign-in",
      }),
    );

    const oldResponse = await auth.handler(
      authRequest("/sign-in/email-otp", {
        email,
        otp: deliveries[0]!.otp,
      }),
    );
    expect(oldResponse.status).toBe(400);

    const newResponse = await auth.handler(
      authRequest("/sign-in/email-otp", {
        email,
        otp: deliveries[1]!.otp,
      }),
    );
    expect(newResponse.status).toBe(200);
  });

  it("locks a code after the configured failed-attempt budget", async () => {
    const auth = createAuth(env, {
      sendVerificationOTP: async (message) => {
        deliveries.push(message);
      },
    });
    const email = "otp-attempts@inon.space";

    await auth.handler(
      authRequest("/email-otp/send-verification-otp", {
        email,
        type: "sign-in",
      }),
    );

    for (let attempt = 0; attempt < 5; attempt += 1) {
      const response = await auth.handler(
        authRequest("/sign-in/email-otp", {
          email,
          otp: "000000",
        }),
      );
      expect(response.status).toBe(400);
    }

    const lockedResponse = await auth.handler(
      authRequest("/sign-in/email-otp", {
        email,
        otp: deliveries[0]!.otp,
      }),
    );
    expect(lockedResponse.status).toBe(403);
  });

  it("rejects an expired code", async () => {
    const auth = createAuth(env, {
      sendVerificationOTP: async (message) => {
        deliveries.push(message);
      },
    });
    const email = "otp-expired@inon.space";

    await auth.handler(
      authRequest("/email-otp/send-verification-otp", {
        email,
        type: "sign-in",
      }),
    );
    await env.DB.prepare("UPDATE verification SET expiresAt = 0").run();

    const response = await auth.handler(
      authRequest("/sign-in/email-otp", {
        email,
        otp: deliveries[0]!.otp,
      }),
    );
    expect(response.status).toBe(400);
  });

  it("removes the code when email delivery fails", async () => {
    const auth = createAuth(env, {
      sendVerificationOTP: async () => {
        throw new Error("mail transport failed");
      },
    });
    const before = await env.DB.prepare(
      "SELECT COUNT(*) AS count FROM verification",
    ).first<{ count: number }>();

    const response = await auth.handler(
      authRequest("/email-otp/send-verification-otp", {
        email: "delivery-failure@inon.space",
        type: "sign-in",
      }),
    );

    expect(response.status).toBe(200);
    const after = await env.DB.prepare(
      "SELECT COUNT(*) AS count FROM verification",
    ).first<{ count: number }>();
    expect(after?.count).toBe(before?.count);
  });

  it("does not expose the password registration endpoint", async () => {
    const auth = createAuth(env, {
      sendVerificationOTP: async () => {},
    });

    const response = await auth.handler(
      authRequest("/sign-up/email", {
        email: "forbidden-password-signup@inon.space",
        name: "Forbidden",
        password: "this-password-must-not-register",
      }),
    );

    expect(response.status).toBe(400);
    expect(
      await env.DB.prepare("SELECT id FROM user WHERE email = ?")
        .bind("forbidden-password-signup@inon.space")
        .first(),
    ).toBeNull();
  });
});
