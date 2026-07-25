import { env } from "cloudflare:test";
import { describe, expect, it, vi } from "vitest";
import { createAuth } from "../../src/auth/create-auth";
import { createGitHubUserInfoResolver } from "../../src/auth/github";

interface GitHubFixture {
  profileEmail: string | null;
  emails: Array<{ email: string; primary: boolean; verified: boolean }>;
}

function githubFetch(fixture: GitHubFixture) {
  return vi.fn(async (input: string | URL) => {
    const url = String(input);
    if (url.endsWith("/user/emails")) {
      return Response.json(fixture.emails);
    }
    if (url.endsWith("/user")) {
      return Response.json({
        id: 4242,
        login: "octocat",
        name: "Octo Cat",
        avatar_url: "https://avatars.githubusercontent.com/u/4242",
        email: fixture.profileEmail,
      });
    }
    return new Response(null, { status: 404 });
  });
}

describe("secure GitHub identity resolution", () => {
  it("uses only the verified primary GitHub email", async () => {
    const fetcher = githubFetch({
      profileEmail: "public-but-unverified@example.com",
      emails: [
        {
          email: "secondary-verified@example.com",
          primary: false,
          verified: true,
        },
        {
          email: "PRIMARY@Example.com",
          primary: true,
          verified: true,
        },
      ],
    });
    const resolve = createGitHubUserInfoResolver(env.DB, fetcher);

    const result = await resolve({ accessToken: "test-token" });

    expect(result).toMatchObject({
      user: {
        id: "4242",
        email: "primary@example.com",
        emailVerified: true,
      },
    });
    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  it("returns no email for an unlinked identity without a verified primary email", async () => {
    const resolve = createGitHubUserInfoResolver(
      env.DB,
      githubFetch({
        profileEmail: "unverified@example.com",
        emails: [
          {
            email: "unverified@example.com",
            primary: true,
            verified: false,
          },
        ],
      }),
    );

    const result = await resolve({ accessToken: "test-token" });

    expect(result).toMatchObject({
      user: {
        id: "4242",
        email: null,
        emailVerified: false,
      },
    });
  });

  it("lets an already linked identity use the verified local iNon email", async () => {
    await env.DB.prepare(
      `INSERT INTO user (
        id, name, email, emailVerified, createdAt, updatedAt, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    )
      .bind(
        "github_linked_user",
        "Linked",
        "linked@inon.space",
        1,
        new Date(0).toISOString(),
        new Date(0).toISOString(),
        "active",
      )
      .run();
    await env.DB.prepare(
      `INSERT INTO account (
        id, accountId, providerId, userId, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?)`,
    )
      .bind(
        "github_linked_account",
        "4242",
        "github",
        "github_linked_user",
        new Date(0).toISOString(),
        new Date(0).toISOString(),
      )
      .run();
    const resolve = createGitHubUserInfoResolver(
      env.DB,
      githubFetch({
        profileEmail: null,
        emails: [],
      }),
    );

    const result = await resolve({ accessToken: "test-token" });

    expect(result).toMatchObject({
      user: {
        email: "linked@inon.space",
        emailVerified: true,
      },
    });
  });

  it("never persists upstream provider tokens on an account", async () => {
    const auth = createAuth(env, {
      sendVerificationOTP: async () => {},
    });
    const context = await auth.$context;
    const user = await context.internalAdapter.createUser({
      email: "github-token-storage@inon.space",
      emailVerified: true,
      name: "Token Storage",
    });

    await context.internalAdapter.createAccount({
      id: "github_token_account",
      accountId: "token-subject",
      providerId: "github",
      userId: user.id,
      accessToken: "upstream-access-token",
      refreshToken: "upstream-refresh-token",
      idToken: "upstream-id-token",
    });

    const stored = await env.DB.prepare(
      `SELECT accessToken, refreshToken, idToken
       FROM account
       WHERE id = ?`,
    )
      .bind("github_token_account")
      .first<{
        accessToken: string | null;
        refreshToken: string | null;
        idToken: string | null;
      }>();
    expect(stored).toEqual({
      accessToken: null,
      refreshToken: null,
      idToken: null,
    });
  });
});
