import { env, SELF } from "cloudflare:test";
import { expect, it } from "vitest";

it("binds the sole role only to an active email-verified account", async () => {
  await env.DB.prepare(
    `INSERT INTO "user" (
      id, name, email, "emailVerified", "createdAt", "updatedAt", status
    ) VALUES (?, ?, ?, 1, ?, ?, 'active')`,
  )
    .bind(
      "user_bootstrap_owner",
      "Owner",
      "owner@example.com",
      new Date(0).toISOString(),
      new Date(0).toISOString(),
    )
    .run();

  const response = await SELF.fetch(
    "https://inon.space/api/sso/internal/super-admin/bootstrap",
    {
      method: "POST",
      headers: {
        authorization: "Bearer test-internal-token",
        "content-type": "application/json",
      },
      body: JSON.stringify({ email: "OWNER@example.com" }),
    },
  );

  expect(response.status).toBe(200);
  expect(await response.json()).toEqual({
    userId: "user_bootstrap_owner",
    globalRole: "super_admin",
  });
  await expect(
    env.DB.prepare(
      `SELECT user_id FROM global_roles WHERE role = 'super_admin'`,
    ).first<{ user_id: string }>(),
  ).resolves.toEqual({ user_id: "user_bootstrap_owner" });
});
