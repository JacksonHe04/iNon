import { env } from "cloudflare:test";
import { expect, it } from "vitest";
import { GlobalRoleRepository } from "../src/authorization/global-roles";

const repository = new GlobalRoleRepository(env.DB);

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
