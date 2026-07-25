import {
  projectKeySchema,
  projectRoleSchema,
  type ProjectKey,
} from "@inon/sso-contracts";
import type { JWTPayload } from "jose";
import { PROJECT_CLAIM, PROJECT_ROLE_CLAIM } from "./constants";
import { InonSsoError } from "./errors";
import type { InonIdentity } from "./types";

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
  const project = projectKeySchema.parse(claims[PROJECT_CLAIM]);
  const projectRole = projectRoleSchema.parse(claims[PROJECT_ROLE_CLAIM]);

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
