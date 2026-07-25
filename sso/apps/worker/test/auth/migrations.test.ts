import { applyD1Migrations, env } from "cloudflare:test";
import { describe, expect, it } from "vitest";

describe("authentication migration invariants", () => {
  it("applies cleanly and is a no-op when replayed", async () => {
    const before = await env.DB.prepare(
      "SELECT name FROM d1_migrations ORDER BY name",
    ).all<{ name: string }>();

    await applyD1Migrations(env.DB, env.TEST_MIGRATIONS);

    const after = await env.DB.prepare(
      "SELECT name FROM d1_migrations ORDER BY name",
    ).all<{ name: string }>();

    expect(before.results.map(({ name }) => name)).toEqual([
      "0001_authorization_foundation.sql",
      "0002_better_auth.sql",
      "0003_username_policy.sql",
    ]);
    expect(after.results).toEqual(before.results);
  });

  it("prevents extending a session past its absolute expiry", async () => {
    await env.DB.prepare(
      `INSERT INTO user (
        id, name, email, emailVerified, createdAt, updatedAt, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    )
      .bind("user_session_cap", "Test", "cap@inon.space", 1, 1, 1, "active")
      .run();

    await env.DB.prepare(
      `INSERT INTO session (
        id, expiresAt, token, createdAt, updatedAt, userId,
        absoluteExpiresAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    )
      .bind("session_cap", 100, "session-token-cap", 1, 1, "user_session_cap", 200)
      .run();

    await expect(
      env.DB.prepare("UPDATE session SET expiresAt = ? WHERE id = ?")
        .bind(201, "session_cap")
        .run(),
    ).rejects.toThrow("session exceeds absolute expiry");

    await expect(
      env.DB.prepare(
        "UPDATE session SET absoluteExpiresAt = ? WHERE id = ?",
      )
        .bind(300, "session_cap")
        .run(),
    ).rejects.toThrow("session absolute expiry is immutable");
  });

  it("keeps provider identities and usernames globally unique", async () => {
    await env.DB.prepare(
      `INSERT INTO user (
        id, name, email, emailVerified, createdAt, updatedAt, username, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    )
      .bind(
        "user_unique_1",
        "One",
        "one@inon.space",
        1,
        1,
        1,
        "唯一-user",
        "active",
      )
      .run();

    await expect(
      env.DB.prepare(
        `INSERT INTO user (
          id, name, email, emailVerified, createdAt, updatedAt, username, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      )
        .bind(
          "user_unique_2",
          "Two",
          "two@inon.space",
          1,
          1,
          1,
          "唯一-user",
          "active",
        )
        .run(),
    ).rejects.toThrow();

    await env.DB.prepare(
      `INSERT INTO account (
        id, accountId, providerId, userId, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?)`,
    )
      .bind(
        "account_unique_1",
        "github-subject",
        "github",
        "user_unique_1",
        1,
        1,
      )
      .run();

    await expect(
      env.DB.prepare(
        `INSERT INTO account (
          id, accountId, providerId, userId, createdAt, updatedAt
        ) VALUES (?, ?, ?, ?, ?, ?)`,
      )
        .bind(
          "account_unique_2",
          "github-subject",
          "github",
          "user_unique_1",
          1,
          1,
        )
        .run(),
    ).rejects.toThrow();
  });
});
