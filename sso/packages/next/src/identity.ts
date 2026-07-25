import type { JWTPayload } from "jose";
import { PROJECT_CLAIM, PROJECT_ROLE_CLAIM } from "./constants.js";
import { InonSsoError } from "./errors.js";
import type {
  InonIdentity,
  ProjectKey,
  ProjectRole,
} from "./types.js";

const projectKeys = new Set<ProjectKey>([
  "inon",
  "leaf",
  "pine",
  "sayless",
  "treez",
]);

function parseProjectKey(value: unknown): ProjectKey {
  if (typeof value !== "string" || !projectKeys.has(value as ProjectKey)) {
    throw new InonSsoError(
      "OAUTH_ERROR",
      "The iNon identity contains an invalid project.",
    );
  }

  return value as ProjectKey;
}

function parseProjectRole(value: unknown): ProjectRole {
  if (value !== "member" && value !== "admin") {
    throw new InonSsoError(
      "OAUTH_ERROR",
      "The iNon identity contains an invalid project role.",
    );
  }

  return value;
}

function requiredString(
  value: unknown,
  field: string,
): string {
  if (typeof value !== "string" || value.length === 0) {
    throw new InonSsoError(
      "OAUTH_ERROR",
      `The iNon identity response is missing ${field}.`,
    );
  }

  return value;
}

export function identityFromClaims(
  claims: JWTPayload | Record<string, unknown>,
  expectedProject: ProjectKey,
): InonIdentity {
  const project = parseProjectKey(claims[PROJECT_CLAIM]);
  const projectRole = parseProjectRole(claims[PROJECT_ROLE_CLAIM]);

  if (project !== expectedProject) {
    throw new InonSsoError(
      "OAUTH_ERROR",
      "The iNon identity was issued for a different project.",
    );
  }

  if (claims.email_verified !== true) {
    throw new InonSsoError(
      "OAUTH_ERROR",
      "An email-verified iNon identity is required.",
    );
  }

  const preferredUsername = claims.preferred_username;

  return {
    id: requiredString(claims.sub, "sub"),
    email: requiredString(claims.email, "email"),
    emailVerified: true,
    username:
      typeof preferredUsername === "string" &&
      preferredUsername.length > 0
        ? preferredUsername
        : null,
    project,
    projectRole,
  };
}
