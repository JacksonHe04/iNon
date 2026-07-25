export const DEFAULT_ISSUER = "https://inon.space/api/sso/auth";
export const DEFAULT_BASE_PATH = "/api/auth/inon";

export const INON_SESSION_SLIDING_SECONDS = 30 * 24 * 60 * 60;
export const INON_SESSION_ABSOLUTE_SECONDS = 90 * 24 * 60 * 60;
export const OAUTH_TRANSACTION_SECONDS = 10 * 60;

export const PROJECT_CLAIM = "https://inon.space/project";
export const PROJECT_ROLE_CLAIM =
  "https://inon.space/project_role";

export const OAUTH_SCOPES = [
  "openid",
  "profile",
  "email",
  "offline_access",
] as const;
