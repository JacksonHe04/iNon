import { env } from "cloudflare:test";
import { describe, expect, it } from "vitest";
import {
  AccountService,
  USERNAME_CHANGE_INTERVAL_MS,
} from "../../src/auth/account-service";

async function insertUser(id: string, email: string) {
  await env.DB.prepare(
    `INSERT INTO user (
      id, name, email, emailVerified, createdAt, updatedAt, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
  )
    .bind(id, id, email, 1, new Date(0).toISOString(), new Date(0).toISOString(), "active")
    .run();
}

describe("AccountService username policy", () => {
  it("keeps one canonical username and enforces the rolling 30-day interval", async () => {
    const service = new AccountService(env.DB);
    const userId = "account_policy_user";
    const firstChangeAt = new Date("2026-01-01T00:00:00.000Z");
    await insertUser(userId, "account-policy@inon.space");

    const first = await service.setUsername(
      userId,
      "用戶-Name_1",
      firstChangeAt,
    );
    expect(first).toEqual({
      username: "用戶-name_1",
      usernameChangedAt: firstChangeAt,
    });

    await expect(
      service.setUsername(
        userId,
        "second-name",
        new Date(firstChangeAt.getTime() + USERNAME_CHANGE_INTERVAL_MS - 1),
      ),
    ).rejects.toMatchObject({
      code: "USERNAME_CHANGE_TOO_SOON",
    });

    const allowedAt = new Date(
      firstChangeAt.getTime() + USERNAME_CHANGE_INTERVAL_MS,
    );
    const second = await service.setUsername(userId, "Second-Name", allowedAt);
    expect(second).toEqual({
      username: "second-name",
      usernameChangedAt: allowedAt,
    });

    const stored = await env.DB.prepare(
      `SELECT username, displayUsername, usernameChangedAt
       FROM user WHERE id = ?`,
    )
      .bind(userId)
      .first<{
        username: string;
        displayUsername: string;
        usernameChangedAt: string;
      }>();
    expect(stored).toEqual({
      username: "second-name",
      displayUsername: "second-name",
      usernameChangedAt: allowedAt.toISOString(),
    });
  });

  it("uses database constraints to resolve concurrent global-name claims", async () => {
    const service = new AccountService(env.DB);
    await Promise.all([
      insertUser("username_race_1", "username-race-1@inon.space"),
      insertUser("username_race_2", "username-race-2@inon.space"),
    ]);
    const now = new Date("2026-01-01T00:00:00.000Z");

    const results = await Promise.allSettled([
      service.setUsername("username_race_1", "同一个-name", now),
      service.setUsername("username_race_2", "同一个-name", now),
    ]);

    expect(results.filter(({ status }) => status === "fulfilled")).toHaveLength(
      1,
    );
    const rejection = results.find(
      ({ status }) => status === "rejected",
    ) as PromiseRejectedResult;
    expect(rejection.reason).toMatchObject({
      code: "USERNAME_TAKEN",
    });
  });

  it("rejects direct database attempts to bypass username invariants", async () => {
    const service = new AccountService(env.DB);
    const userId = "username_trigger_user";
    const now = new Date("2026-01-01T00:00:00.000Z");
    await insertUser(userId, "username-trigger@inon.space");
    await service.setUsername(userId, "first-name", now);

    await expect(
      env.DB.prepare(
        `UPDATE user
         SET username = ?, displayUsername = ?, usernameChangedAt = ?
         WHERE id = ?`,
      )
        .bind(
          "bypass-name",
          "different-display",
          new Date(now.getTime() + 1).toISOString(),
          userId,
        )
        .run(),
    ).rejects.toThrow();
  });
});
