import { env } from "cloudflare:test";
import { getMigrations } from "better-auth/db/migration";
import { describe, expect, it } from "vitest";
import { createAuth } from "../../src/auth/create-auth";

describe("Better Auth D1 schema", () => {
  it("matches the schema required by the locked authentication runtime", async () => {
    const auth = createAuth(env, {
      sendVerificationOTP: async () => {},
    });
    const migrations = await getMigrations(auth.options);

    expect(migrations.toBeCreated).toEqual([]);
    expect(migrations.toBeAdded).toEqual([]);
  });

  it("contains the account policy fields and OAuth provider tables", async () => {
    const tables = await env.DB.prepare(
      "SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name",
    ).all<{ name: string }>();

    expect(tables.results.map(({ name }) => name)).toEqual(
      expect.arrayContaining([
        "user",
        "account",
        "session",
        "verification",
        "oauthClient",
        "oauthAccessToken",
        "oauthRefreshToken",
        "oauthConsent",
        "jwks",
      ]),
    );

    const userColumns = await env.DB.prepare("PRAGMA table_info(user)").all<{
      name: string;
    }>();
    expect(userColumns.results.map(({ name }) => name)).toEqual(
      expect.arrayContaining([
        "username",
        "displayUsername",
        "usernameChangedAt",
        "status",
        "migrationSource",
        "migrationSubject",
      ]),
    );

    const sessionColumns = await env.DB.prepare(
      "PRAGMA table_info(session)",
    ).all<{ name: string }>();
    expect(sessionColumns.results.map(({ name }) => name)).toEqual(
      expect.arrayContaining([
        "absoluteExpiresAt",
        "revokedAt",
        "revokeReason",
      ]),
    );
  });
});
