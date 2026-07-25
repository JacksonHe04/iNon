import {
  projectRoleSchema,
  type ProjectKey,
  type ProjectRole,
} from "@inon/sso-contracts";
import { AuditLogRepository } from "../audit/audit-log";
import { AuthorizationError } from "./errors";
import { GlobalRoleRepository } from "./global-roles";

export interface SetProjectRoleInput {
  actorUserId: string;
  targetUserId: string;
  project: ProjectKey;
  role: ProjectRole;
  requestId: string;
  now: number;
}

export interface ProjectMembershipRepositoryContract {
  ensureMember(
    userId: string,
    project: ProjectKey,
    now: number,
  ): Promise<ProjectRole>;
  getRole(userId: string, project: ProjectKey): Promise<ProjectRole | null>;
  setRole(input: SetProjectRoleInput): Promise<void>;
}

export class ProjectMembershipRepository
  implements ProjectMembershipRepositoryContract
{
  private readonly globalRoles: GlobalRoleRepository;
  private readonly auditLogs: AuditLogRepository;

  constructor(private readonly db: D1Database) {
    this.globalRoles = new GlobalRoleRepository(db);
    this.auditLogs = new AuditLogRepository(db);
  }

  async ensureMember(
    userId: string,
    project: ProjectKey,
    now: number,
  ): Promise<ProjectRole> {
    await this.db
      .prepare(
        `INSERT INTO project_memberships (
          id, project_id, user_id, role, created_at, updated_at
        ) VALUES (?, ?, ?, 'member', ?, ?)
        ON CONFLICT(project_id, user_id) DO NOTHING`,
      )
      .bind(
        `membership_${crypto.randomUUID()}`,
        project,
        userId,
        now,
        now,
      )
      .run();

    const role = await this.getRole(userId, project);
    if (role === null) {
      throw new Error("Project membership was not persisted.");
    }

    return role;
  }

  async getRole(
    userId: string,
    project: ProjectKey,
  ): Promise<ProjectRole | null> {
    const row = await this.db
      .prepare(
        `SELECT role
         FROM project_memberships
         WHERE project_id = ? AND user_id = ?
         LIMIT 1`,
      )
      .bind(project, userId)
      .first<{ role: string }>();

    return row === null ? null : projectRoleSchema.parse(row.role);
  }

  async setRole(input: SetProjectRoleInput): Promise<void> {
    if (!(await this.globalRoles.isSuperAdmin(input.actorUserId))) {
      throw new AuthorizationError(
        "FORBIDDEN",
        "Only the global super administrator can change project roles.",
      );
    }

    const upsertMembership = this.db
      .prepare(
        `INSERT INTO project_memberships (
          id, project_id, user_id, role, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?)
        ON CONFLICT(project_id, user_id) DO UPDATE SET
          role = excluded.role,
          updated_at = excluded.updated_at`,
      )
      .bind(
        `membership_${crypto.randomUUID()}`,
        input.project,
        input.targetUserId,
        input.role,
        input.now,
        input.now,
      );

    const appendAuditLog = this.auditLogs.prepareAppend({
      actorUserId: input.actorUserId,
      subjectUserId: input.targetUserId,
      project: input.project,
      action: "project_membership.role_changed",
      requestId: input.requestId,
      metadata: { role: input.role },
      now: input.now,
    });

    await this.db.batch([upsertMembership, appendAuditLog]);
  }
}
