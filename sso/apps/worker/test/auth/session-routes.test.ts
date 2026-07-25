import { env } from "cloudflare:test";
import { describe, expect, it } from "vitest";
import type { VerificationOTPMessage } from "../../src/auth/create-auth";
import { createAuth } from "../../src/auth/create-auth";
import { AUTH_BASE_URL, CANONICAL_ORIGIN } from "../../src/auth/constants";
import { authRequest, cookieFrom } from "./auth-test-helpers";

describe("central device sessions", () => {
  it("lists sessions and revokes one selected device", async () => {
    const deliveries: VerificationOTPMessage[] = [];
    const auth = createAuth(env, {
      sendVerificationOTP: async (message) => {
        deliveries.push(message);
      },
    });
    const email = "session-devices@inon.space";

    const signIn = async () => {
      await auth.handler(
        authRequest("/email-otp/send-verification-otp", {
          email,
          type: "sign-in",
        }),
      );
      return auth.handler(
        authRequest("/sign-in/email-otp", {
          email,
          otp: deliveries.at(-1)!.otp,
        }),
      );
    };

    const first = await signIn();
    const second = await signIn();
    const firstCookie = cookieFrom(first);
    const secondCookie = cookieFrom(second);
    const secondBody = (await second.clone().json()) as { token: string };

    const list = await auth.handler(
      new Request(`${AUTH_BASE_URL}/list-sessions`, {
        headers: { cookie: firstCookie },
      }),
    );
    expect(list.status).toBe(200);
    expect(await list.json()).toHaveLength(2);

    const revoke = await auth.handler(
      new Request(`${AUTH_BASE_URL}/revoke-session`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          cookie: firstCookie,
          origin: CANONICAL_ORIGIN,
        },
        body: JSON.stringify({ token: secondBody.token }),
      }),
    );
    expect(revoke.status).toBe(200);

    const revokedSession = await auth.handler(
      new Request(`${AUTH_BASE_URL}/get-session`, {
        headers: { cookie: secondCookie },
      }),
    );
    expect(await revokedSession.json()).toBeNull();
  });
});
