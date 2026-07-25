import { AuditLogRepository } from "../audit/audit-log";

export interface BootstrapSuperAdminInput {
  userId: string;
  requestId: string;
  now: number;
}

export class GlobalRoleRepository {
  private readonly auditLogs: AuditLogRepository;

  constructor(private readonly db: D1Database) {
    this.auditLogs = new AuditLogRepository(db);
  }

  async getSuperAdminUserId(): Promise<string | null> {
    const row = await this.db
      .prepare(
        "SELECT user_id FROM global_roles WHERE role = 'super_admin' LIMIT 1",
      )
      .first<{ user_id: string }>();

    return row?.user_id ?? null;
  }

  async isSuperAdmin(userId: string): Promise<boolean> {
    const row = await this.db
      .prepare(
        `SELECT 1 AS authorized
         FROM global_roles
         WHERE role = 'super_admin' AND user_id = ?
         LIMIT 1`,
      )
      .bind(userId)
      .first<{ authorized: number }>();

    return row?.authorized === 1;
  }

  async bootstrap(
    input: BootstrapSuperAdminInput,
  ): Promise<boolean> {
    const existingUserId = await this.getSuperAdminUserId();
    if (existingUserId !== null && existingUserId !== input.userId) {
      throw new Error(
        "The global super administrator role is already bound to a different user.",
      );
    }
    if (existingUserId === input.userId) {
      return true;
    }

    const insertRole = this.db
      .prepare(
        `INSERT INTO global_roles (
          role, user_id, created_at, created_by
        ) VALUES ('super_admin', ?, ?, 'internal_bootstrap')`,
      )
      .bind(input.userId, input.now);
    const appendAuditLog = this.auditLogs.prepareAppend({
      actorUserId: input.userId,
      subjectUserId: input.userId,
      project: null,
      action: "global_role.super_admin_bootstrapped",
      requestId: input.requestId,
      metadata: { source: "internal_bootstrap" },
      now: input.now,
    });

    try {
      await this.db.batch([insertRole, appendAuditLog]);
    } catch (error) {
      if ((await this.getSuperAdminUserId()) === input.userId) {
        return true;
      }
      throw error;
    }

    return true;
  }
}
