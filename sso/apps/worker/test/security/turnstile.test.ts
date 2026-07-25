import { describe, expect, it, vi } from "vitest";
import { CloudflareTurnstileVerifier } from "../../src/security/turnstile";

describe("Turnstile server verification", () => {
  it("accepts only a successful response with the expected action and hostname", async () => {
    const fetcher = vi.fn(
      async (
        _input: string | URL | Request,
        _init?: RequestInit,
      ) =>
        Response.json({
          success: true,
          action: "otp_send",
          hostname: "inon.space",
        }),
    );
    const verifier = new CloudflareTurnstileVerifier(
      "test-secret",
      ["inon.space"],
      fetcher,
    );

    await expect(
      verifier.verify({
        token: "single-use-token",
        action: "otp_send",
        remoteIp: "203.0.113.1",
      }),
    ).resolves.toBe(true);
    await expect(
      verifier.verify({
        token: "single-use-token",
        action: "password_login",
        remoteIp: "203.0.113.1",
      }),
    ).resolves.toBe(false);

    const submitted = fetcher.mock.calls[0]![1]!.body as URLSearchParams;
    expect(submitted.get("secret")).toBe("test-secret");
    expect(submitted.get("response")).toBe("single-use-token");
    expect(submitted.get("remoteip")).toBe("203.0.113.1");
    expect(submitted.get("idempotency_key")).toMatch(
      /^[0-9a-f-]{36}$/i,
    );
  });
});
