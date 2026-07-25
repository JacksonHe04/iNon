import { env } from "cloudflare:test";
import { beforeEach, expect, it } from "vitest";
import { ProjectMembershipRepository } from "../src/authorization/project-memberships";

const repository = new ProjectMembershipRepository(env.DB);

beforeEach(async () => {
  await env.DB.batch([
    env.DB.prepare("DELETE FROM project_memberships"),
    env.DB.prepare("DELETE FROM global_roles"),
  ]);
});

async function setSuperAdmin(userId: string): Promise<void> {
  await env.DB.prepare(
    `INSERT INTO global_roles (user_id, role, created_at, created_by)
     VALUES (?, 'super_admin', ?, 'bootstrap')
     ON CONFLICT(role) DO UPDATE SET user_id = excluded.user_id`,
  )
    .bind(userId, Date.now())
    .run();
}

it("creates one ordinary membership under concurrent first access", async () => {
  const roles = await Promise.all(
    Array.from({ length: 10 }, () =>
      repository.ensureMember("user_concurrent", "treez", 1),
    ),
  );

  expect(roles).toEqual(Array.from({ length: 10 }, () => "member"));

  const result = await env.DB.prepare(
    `SELECT COUNT(*) AS count
     FROM project_memberships
     WHERE project_id = ? AND user_id = ?`,
  )
    .bind("treez", "user_concurrent")
    .first<{ count: number }>();

  expect(result?.count).toBe(1);
});

it("returns the existing admin role without downgrading it", async () => {
  await env.DB.prepare(
    `INSERT INTO project_memberships (
      id, project_id, user_id, role, created_at, updated_at
    ) VALUES (?, ?, ?, 'admin', ?, ?)`,
  )
    .bind("membership_existing_admin", "leaf", "user_admin", 1, 1)
    .run();

  await expect(
    repository.ensureMember("user_admin", "leaf", 2),
  ).resolves.toBe("admin");
  await expect(repository.getRole("user_admin", "leaf")).resolves.toBe(
    "admin",
  );
});

it("rejects project-admin role mutation by a non-super-admin actor", async () => {
  await env.DB.prepare(
    `INSERT INTO project_memberships (
      id, project_id, user_id, role, created_at, updated_at
    ) VALUES (?, ?, ?, 'admin', ?, ?)`,
  )
    .bind("membership_project_admin", "pine", "user_project_admin", 1, 1)
    .run();
  await repository.ensureMember("user_target_forbidden", "pine", 1);

  await expect(
    repository.setRole({
      actorUserId: "user_project_admin",
      targetUserId: "user_target_forbidden",
      project: "pine",
      role: "admin",
      requestId: "req_forbidden",
      now: 2,
    }),
  ).rejects.toMatchObject({ code: "FORBIDDEN" });

  await expect(
    repository.getRole("user_target_forbidden", "pine"),
  ).resolves.toBe("member");
});

it("allows the sole super-admin to appoint and revoke project admins", async () => {
  await setSuperAdmin("user_super");

  await repository.setRole({
    actorUserId: "user_super",
    targetUserId: "user_role_target",
    project: "sayless",
    role: "admin",
    requestId: "req_appoint",
    now: 1,
  });
  await expect(
    repository.getRole("user_role_target", "sayless"),
  ).resolves.toBe("admin");

  await repository.setRole({
    actorUserId: "user_super",
    targetUserId: "user_role_target",
    project: "sayless",
    role: "member",
    requestId: "req_revoke",
    now: 2,
  });
  await expect(
    repository.getRole("user_role_target", "sayless"),
  ).resolves.toBe("member");
});

it("writes one audit record for a successful role change", async () => {
  await setSuperAdmin("user_audit_super");

  await repository.setRole({
    actorUserId: "user_audit_super",
    targetUserId: "user_audit_target",
    project: "inon",
    role: "admin",
    requestId: "req_audit_once",
    now: 1,
  });

  const result = await env.DB.prepare(
    `SELECT actor_user_id, subject_user_id, project_id, action, request_id
     FROM audit_logs
     WHERE request_id = ?`,
  )
    .bind("req_audit_once")
    .all();

  expect(result.results).toEqual([
    {
      actor_user_id: "user_audit_super",
      subject_user_id: "user_audit_target",
      project_id: "inon",
      action: "project_membership.role_changed",
      request_id: "req_audit_once",
    },
  ]);
});
