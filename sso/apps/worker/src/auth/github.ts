import type { OAuth2Tokens } from "better-auth";
import { normalizeEmail } from "./email";

export type GitHubFetch = (
  input: string | URL,
  init?: RequestInit,
) => Promise<Response>;

interface GitHubProfile {
  id: string | number;
  login: string;
  name: string | null;
  avatar_url: string;
  email: string | null;
}

interface GitHubEmail {
  email: string;
  primary: boolean;
  verified: boolean;
}

interface LinkedIdentity {
  email: string;
  emailVerified: number | boolean;
  name: string;
  image: string | null;
}

function githubHeaders(accessToken: string): HeadersInit {
  return {
    accept: "application/vnd.github+json",
    authorization: `Bearer ${accessToken}`,
    "user-agent": "iNon-SSO",
    "x-github-api-version": "2022-11-28",
  };
}

export function createGitHubUserInfoResolver(
  db: D1Database,
  fetcher: GitHubFetch = fetch,
) {
  return async (tokens: OAuth2Tokens) => {
    if (!tokens.accessToken) {
      return null;
    }

    const headers = githubHeaders(tokens.accessToken);
    const [profileResponse, emailsResponse] = await Promise.all([
      fetcher("https://api.github.com/user", { headers }),
      fetcher("https://api.github.com/user/emails", { headers }),
    ]);
    if (!profileResponse.ok) {
      return null;
    }

    const profile = await profileResponse.json<GitHubProfile>();
    const emails = emailsResponse.ok
      ? await emailsResponse.json<GitHubEmail[]>()
      : [];
    const verifiedPrimary = emails.find(
      ({ primary, verified }) => primary && verified,
    );

    if (verifiedPrimary) {
      return {
        user: {
          id: String(profile.id),
          name: profile.name || profile.login,
          email: normalizeEmail(verifiedPrimary.email),
          image: profile.avatar_url,
          emailVerified: true,
        },
        data: profile,
      };
    }

    const linked = await db
      .prepare(
        `SELECT
           u.email,
           u.emailVerified,
           u.name,
           u.image
         FROM account AS a
         JOIN user AS u ON u.id = a.userId
         WHERE a.providerId = 'github'
           AND a.accountId = ?`,
      )
      .bind(String(profile.id))
      .first<LinkedIdentity>();

    return {
      user: {
        id: String(profile.id),
        name: linked?.name || profile.name || profile.login,
        email:
          linked && Boolean(linked.emailVerified)
            ? normalizeEmail(linked.email)
            : null,
        image: linked?.image || profile.avatar_url,
        emailVerified: Boolean(linked?.emailVerified),
      },
      data: profile,
    };
  };
}

export function stripUpstreamProviderTokens<T extends Record<string, unknown>>(
  account: T,
): T {
  return {
    ...account,
    accessToken: null,
    refreshToken: null,
    idToken: null,
    accessTokenExpiresAt: null,
    refreshTokenExpiresAt: null,
    scope: null,
  };
}
