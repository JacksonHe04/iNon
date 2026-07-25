import { projectKeySchema, type ProjectKey } from "@inon/sso-contracts";
import { z } from "zod";

const projectStatusSchema = z.enum(["active", "disabled"]);

export interface ProjectSummary {
  key: ProjectKey;
  name: string;
  status: z.infer<typeof projectStatusSchema>;
}

export class ProjectService {
  constructor(private readonly db: D1Database) {}

  async list(): Promise<ProjectSummary[]> {
    const result = await this.db
      .prepare(
        `SELECT project_key, name, status
         FROM projects
         ORDER BY project_key`,
      )
      .all<{
        project_key: string;
        name: string;
        status: string;
      }>();

    return result.results.map((row) => ({
      key: projectKeySchema.parse(row.project_key),
      name: row.name,
      status: projectStatusSchema.parse(row.status),
    }));
  }
}
