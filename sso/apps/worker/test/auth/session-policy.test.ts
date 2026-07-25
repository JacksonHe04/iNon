import { env } from "cloudflare:test";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { VerificationOTPMessage } from "../../src/auth/create-auth";
import { createAuth } from "../../src/auth/create-auth";
import {
  SESSION_ABSOLUTE_TTL_SECONDS,
  SESSION_SLIDING_TTL_SECONDS,
} from "../../src/auth/constants";
import { authRequest, cookieFrom } from "./auth-test-helpers";

const DAY_MS = 24 * 60 * 60 * 1_000;

function getSessionRequest(cookie: string) {
  return new Request("https://inon.space/api/sso/auth/get-session", {
    headers: { cookie },
  });
}

describe("bounded central sessions", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("slides for 30 days but never extends beyond 90 days", async () => {
    vi.useFakeTimers();
    const startedAt = new Date("2026-01-01T00:00:00.000Z");
    vi.setSystemTime(startedAt);
    const deliveries: VerificationOTPMessage[] = [];
    const auth = createAuth(env, {
      sendVerificationOTP: async (message) => {
        deliveries.push(message);
      },
    });
    const email = "bounded-session@inon.space";

    await auth.handler(
      authRequest("/email-otp/send-verification-otp", {
        email,
        type: "sign-in",
      }),
    );
    const signIn = await auth.handler(
      authRequest("/sign-in/email-otp", {
        email,
        otp: deliveries[0]!.otp,
      }),
    );
    const cookie = cookieFrom(signIn);

    const readStoredSession = () =>
      env.DB.prepare(
        `SELECT expiresAt, absoluteExpiresAt
         FROM session
         WHERE userId = (SELECT id FROM user WHERE email = ?)`,
      )
        .bind(email)
        .first<{ expiresAt: string; absoluteExpiresAt: string }>();

    const initial = await readStoredSession();
    expect(initial).toEqual({
      expiresAt: new Date(
        startedAt.getTime() + SESSION_SLIDING_TTL_SECONDS * 1_000,
      ).toISOString(),
      absoluteExpiresAt: new Date(
        startedAt.getTime() + SESSION_ABSOLUTE_TTL_SECONDS * 1_000,
      ).toISOString(),
    });

    for (const day of [29, 58, 87]) {
      vi.setSystemTime(new Date(startedAt.getTime() + day * DAY_MS));
      const response = await auth.handler(getSessionRequest(cookie));
      expect(response.status).toBe(200);
      expect(await response.json()).toMatchObject({
        user: { email },
      });
    }

    const capped = await readStoredSession();
    expect(capped?.expiresAt).toBe(capped?.absoluteExpiresAt);

    vi.setSystemTime(new Date(startedAt.getTime() + 90 * DAY_MS + 1));
    const expired = await auth.handler(getSessionRequest(cookie));
    expect(expired.status).toBe(200);
    expect(await expired.json()).toBeNull();
  });
});
