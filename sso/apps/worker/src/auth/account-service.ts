import { normalizeUsername, validateUsername } from "@inon/sso-contracts";

export const USERNAME_CHANGE_INTERVAL_MS = 30 * 24 * 60 * 60 * 1_000;

export type AccountPolicyErrorCode =
  | "INVALID_USERNAME"
  | "USER_NOT_FOUND"
  | "USERNAME_CHANGE_TOO_SOON"
  | "USERNAME_TAKEN";

export class AccountPolicyError extends Error {
  constructor(
    readonly code: AccountPolicyErrorCode,
    message: string,
    readonly retryAt: Date | null = null,
  ) {
    super(message);
    this.name = "AccountPolicyError";
  }
}

interface StoredUsername {
  username: string | null;
  usernameChangedAt: string | null;
}

export interface UsernameChange {
  username: string;
  usernameChangedAt: Date;
}

function isUsernameUniqueViolation(error: unknown): boolean {
  return (
    error instanceof Error &&
    error.message.includes("UNIQUE constraint failed: user.username")
  );
}

export class AccountService {
  constructor(private readonly db: D1Database) {}

  async setUsername(
    userId: string,
    requestedUsername: string,
    now = new Date(),
  ): Promise<UsernameChange> {
    const username = normalizeUsername(requestedUsername);
    if (!validateUsername(username).success) {
      throw new AccountPolicyError(
        "INVALID_USERNAME",
        "The username does not match the iNon username policy.",
      );
    }

    const current = await this.db
      .prepare(
        `SELECT username, usernameChangedAt
         FROM user
         WHERE id = ?`,
      )
      .bind(userId)
      .first<StoredUsername>();
    if (!current) {
      throw new AccountPolicyError("USER_NOT_FOUND", "The user does not exist.");
    }

    if (current.username === username && current.usernameChangedAt) {
      return {
        username,
        usernameChangedAt: new Date(current.usernameChangedAt),
      };
    }

    if (current.usernameChangedAt) {
      const retryAt = new Date(
        new Date(current.usernameChangedAt).getTime() +
          USERNAME_CHANGE_INTERVAL_MS,
      );
      if (now < retryAt) {
        throw new AccountPolicyError(
          "USERNAME_CHANGE_TOO_SOON",
          "The username can only be changed once every 30 days.",
          retryAt,
        );
      }
    }

    const changedAt = now.toISOString();
    try {
      await this.db
        .prepare(
          `UPDATE user
           SET username = ?,
               displayUsername = ?,
               usernameChangedAt = ?,
               updatedAt = ?
           WHERE id = ?`,
        )
        .bind(username, username, changedAt, changedAt, userId)
        .run();
    } catch (error) {
      if (isUsernameUniqueViolation(error)) {
        throw new AccountPolicyError(
          "USERNAME_TAKEN",
          "The username is already in use.",
        );
      }
      throw error;
    }

    return {
      username,
      usernameChangedAt: now,
    };
  }
}
