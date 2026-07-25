import { env } from "cloudflare:test";
import { expect, it } from "vitest";

it("seeds exactly the five projects", async () => {
  const result = await env.DB.prepare(
    "SELECT project_key FROM projects ORDER BY project_key",
  ).all<{ project_key: string }>();

  expect(result.results.map((row) => row.project_key)).toEqual([
    "inon",
    "leaf",
    "pine",
    "sayless",
    "treez",
  ]);
});

it("allows only one active super administrator", async () => {
  await env.DB.prepare(
    "INSERT INTO global_roles (user_id, role, created_at, created_by) VALUES (?, ?, ?, ?)",
  )
    .bind("user_1", "super_admin", 1, "bootstrap")
    .run();

  await expect(
    env.DB.prepare(
      "INSERT INTO global_roles (user_id, role, created_at, created_by) VALUES (?, ?, ?, ?)",
    )
      .bind("user_2", "super_admin", 2, "bootstrap")
      .run(),
  ).rejects.toThrow();
});

it("rejects invalid project membership roles", async () => {
  await expect(
    env.DB.prepare(
      `INSERT INTO project_memberships (
        id, project_id, user_id, role, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?)`,
    )
      .bind("membership_1", "inon", "user_1", "owner", 1, 1)
      .run(),
  ).rejects.toThrow();
});

it("allows only one membership per user and project", async () => {
  const insert = `INSERT INTO project_memberships (
    id, project_id, user_id, role, created_at, updated_at
  ) VALUES (?, ?, ?, ?, ?, ?)`;

  await env.DB.prepare(insert)
    .bind("membership_1", "treez", "user_1", "member", 1, 1)
    .run();

  await expect(
    env.DB.prepare(insert)
      .bind("membership_2", "treez", "user_1", "member", 2, 2)
      .run(),
  ).rejects.toThrow();
});

it("keeps audit logs append-only", async () => {
  await env.DB.prepare(
    `INSERT INTO audit_logs (
      id, actor_user_id, subject_user_id, project_id, action,
      request_id, metadata_json, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
  )
    .bind(
      "audit_1",
      "user_1",
      "user_2",
      "leaf",
      "membership.role_changed",
      "req_1",
      "{}",
      1,
    )
    .run();

  await expect(
    env.DB.prepare("UPDATE audit_logs SET action = ? WHERE id = ?")
      .bind("tampered", "audit_1")
      .run(),
  ).rejects.toThrow("audit_logs are append-only");

  await expect(
    env.DB.prepare("DELETE FROM audit_logs WHERE id = ?")
      .bind("audit_1")
      .run(),
  ).rejects.toThrow("audit_logs are append-only");
});
