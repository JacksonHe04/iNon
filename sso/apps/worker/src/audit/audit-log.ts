import type { ProjectKey } from "@inon/sso-contracts";

export interface AppendAuditLogInput {
  actorUserId: string | null;
  subjectUserId: string | null;
  project: ProjectKey | null;
  action: string;
  requestId: string;
  metadata?: Record<string, unknown>;
  now: number;
}

export class AuditLogRepository {
  constructor(private readonly db: D1Database) {}

  prepareAppend(input: AppendAuditLogInput): D1PreparedStatement {
    return this.db
      .prepare(
        `INSERT INTO audit_logs (
          id, actor_user_id, subject_user_id, project_id, action,
          request_id, metadata_json, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .bind(
        `audit_${crypto.randomUUID()}`,
        input.actorUserId,
        input.subjectUserId,
        input.project,
        input.action,
        input.requestId,
        JSON.stringify(input.metadata ?? {}),
        input.now,
      );
  }

  async append(input: AppendAuditLogInput): Promise<void> {
    await this.prepareAppend(input).run();
  }
}
