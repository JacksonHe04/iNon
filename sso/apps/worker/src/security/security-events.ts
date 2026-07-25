import { AuditLogRepository } from "../audit/audit-log";
import type { EmailService } from "../email/email-service";
import type { SecurityNotificationEvent } from "../email/templates/security-notification";

export interface SecurityEvent {
  event: SecurityNotificationEvent;
  userId: string;
  requestId: string;
}

export class SecurityEventService {
  private readonly auditLogs: AuditLogRepository;

  constructor(
    private readonly db: D1Database,
    private readonly email: EmailService,
  ) {
    this.auditLogs = new AuditLogRepository(db);
  }

  async record(input: SecurityEvent): Promise<void> {
    const user = await this.db
      .prepare(
        `SELECT "email", "emailVerified"
         FROM "user"
         WHERE "id" = ?
         LIMIT 1`,
      )
      .bind(input.userId)
      .first<{ email: string; emailVerified: number }>();

    await this.auditLogs.append({
      actorUserId: input.userId,
      subjectUserId: input.userId,
      project: null,
      action: `security.${input.event}`,
      requestId: input.requestId,
      now: Date.now(),
    });

    if (user?.emailVerified) {
      await this.email.sendSecurityNotification({
        email: user.email,
        event: input.event,
      });
    }
  }
}
