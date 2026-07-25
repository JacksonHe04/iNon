import {
  INON_PROJECT_CLAIM,
  INON_PROJECT_ROLE_CLAIM,
  type ProjectKey,
  type ProjectRole,
} from "@inon/sso-contracts";
import { ProjectMembershipRepository } from "../authorization/project-memberships";
import { parseFirstPartyClientProject } from "./client-registry";

export const PROJECT_CLAIM = INON_PROJECT_CLAIM;
export const PROJECT_ROLE_CLAIM = INON_PROJECT_ROLE_CLAIM;

export interface OAuthUser {
  id: string;
  username?: unknown;
}

export interface ProjectIdentityClaims {
  preferred_username?: string;
  [PROJECT_CLAIM]: ProjectKey;
  [PROJECT_ROLE_CLAIM]: ProjectRole;
}

export async function resolveProjectIdentityClaims(
  db: D1Database,
  user: OAuthUser,
  clientMetadata: unknown,
): Promise<ProjectIdentityClaims> {
  const project = parseFirstPartyClientProject(clientMetadata);
  const role = await new ProjectMembershipRepository(db).ensureMember(
    user.id,
    project,
    Date.now(),
  );

  return {
    ...(typeof user.username === "string" && user.username.length > 0
      ? { preferred_username: user.username }
      : {}),
    [PROJECT_CLAIM]: project,
    [PROJECT_ROLE_CLAIM]: role,
  };
}

export function projectClaimsFromAccessToken(
  jwt: Record<string, unknown>,
): Partial<ProjectIdentityClaims> {
  return {
    ...(typeof jwt.preferred_username === "string"
      ? { preferred_username: jwt.preferred_username }
      : {}),
    ...(typeof jwt[PROJECT_CLAIM] === "string"
      ? { [PROJECT_CLAIM]: jwt[PROJECT_CLAIM] as ProjectKey }
      : {}),
    ...(typeof jwt[PROJECT_ROLE_CLAIM] === "string"
      ? { [PROJECT_ROLE_CLAIM]: jwt[PROJECT_ROLE_CLAIM] as ProjectRole }
      : {}),
  };
}
