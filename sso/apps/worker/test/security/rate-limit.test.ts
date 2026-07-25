import { env } from "cloudflare:test";
import { expect, it } from "vitest";
import { D1RateLimiter } from "../../src/security/rate-limit";

it("atomically limits an OTP identifier without storing the email", async () => {
  const limiter = new D1RateLimiter(env.DB, "rate-limit-test-secret");
  const email = "rate-limited-user@inon.space";
  const decisions = [];

  for (let attempt = 0; attempt < 6; attempt += 1) {
    decisions.push(
      await limiter.consume(
        "otp_send",
        [{ kind: "identifier", value: email }],
        1_000,
      ),
    );
  }

  expect(decisions.slice(0, 5).every(({ allowed }) => allowed)).toBe(
    true,
  );
  expect(decisions[5]).toMatchObject({
    allowed: false,
    retryAfterSeconds: 800,
  });

  const stored = await env.DB.prepare(
    `SELECT "bucket_key", "subject_digest"
     FROM "auth_rate_limit_buckets"
     WHERE "action" = 'otp_send'`,
  ).first<{ bucket_key: string; subject_digest: string }>();
  expect(stored?.bucket_key).not.toContain(email);
  expect(stored?.subject_digest).not.toContain(email);
});
