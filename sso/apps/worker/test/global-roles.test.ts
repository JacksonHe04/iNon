import { env } from "cloudflare:test";
import { beforeEach, expect, it } from "vitest";
import { GlobalRoleRepository } from "../src/authorization/global-roles";

const repository = new GlobalRoleRepository(env.DB);

beforeEach(async () => {
  await env.DB.prepare("DELETE FROM global_roles").run();
});

it("finds the sole global super administrator", async () => {
  await expect(repository.getSuperAdminUserId()).resolves.toBeNull();

  await env.DB.prepare(
    `INSERT INTO global_roles (user_id, role, created_at, created_by)
     VALUES (?, 'super_admin', ?, ?)`,
  )
    .bind("user_super", 1, "bootstrap")
    .run();

  await expect(repository.getSuperAdminUserId()).resolves.toBe("user_super");
  await expect(repository.isSuperAdmin("user_super")).resolves.toBe(true);
  await expect(repository.isSuperAdmin("user_other")).resolves.toBe(false);
});

it("binds the bootstrap once and rejects a different user", async () => {
  await expect(
    repository.bootstrap({
      userId: "user_owner",
      requestId: "req_owner",
      now: 1,
    }),
  ).resolves.toBe(true);
  await expect(repository.getSuperAdminUserId()).resolves.toBe(
    "user_owner",
  );

  await expect(
    repository.bootstrap({
      userId: "user_conflict",
      requestId: "req_conflict",
      now: 2,
    }),
  ).rejects.toThrow("different user");
});
