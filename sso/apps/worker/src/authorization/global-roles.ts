export class GlobalRoleRepository {
  constructor(private readonly db: D1Database) {}

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
}
