import type { ProjectKey } from "@inon/sso-contracts";

export const CANONICAL_ORIGIN = "https://inon.space";
export const AUTH_BASE_PATH = "/api/sso/auth";
export const AUTH_BASE_URL = `${CANONICAL_ORIGIN}${AUTH_BASE_PATH}`;
export const OAUTH_ISSUER = AUTH_BASE_URL;

export const GITHUB_CALLBACK_PATH = "/api/sso/github/callback";
export const GITHUB_CALLBACK_URL = `${CANONICAL_ORIGIN}${GITHUB_CALLBACK_PATH}`;

export const SESSION_SLIDING_TTL_SECONDS = 30 * 24 * 60 * 60;
export const SESSION_ABSOLUTE_TTL_SECONDS = 90 * 24 * 60 * 60;

export const PROJECT_CALLBACK_URLS = {
  inon: `${CANONICAL_ORIGIN}/api/auth/inon/callback`,
  leaf: "https://leaf.inon.space/api/auth/inon/callback",
  pine: "https://pine.inon.space/api/auth/inon/callback",
  sayless: "https://sayless.inon.space/api/auth/inon/callback",
  treez: "https://treez.inon.space/api/auth/inon/callback",
} as const satisfies Record<ProjectKey, string>;
