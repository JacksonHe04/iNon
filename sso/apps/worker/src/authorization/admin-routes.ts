import {
  projectKeySchema,
  projectRoleSchema,
  type ProjectKey,
  type ProjectRole,
} from "@inon/sso-contracts";
import { Hono, type Context } from "hono";
import { z } from "zod";
import type { CentralAuthFactory } from "../auth/account-routes";
import { requireVerifiedSession } from "../auth/account-routes";
import type { SecurityNotificationEvent } from "../email/templates/security-notification";
import type { AppBindings } from "../env";
import { createApiError } from "../http/errors";
import type { AuthEntryPointGuard } from "../security/auth-entry-points";
import { enforceAuthEntryPoint } from "../security/http-enforcement";
import { GlobalRoleRepository } from "./global-roles";
import { ProjectMembershipRepository } from "./project-memberships";

const roleBodySchema = z.object({
  role: projectRoleSchema,
});

interface UserRow {
  id: string;
  email: string;
  username: string | null;
  status: "active" | "disabled";
}

interface MembershipRow {
  user_id: string;
  project_id: ProjectKey;
  role: ProjectRole;
}

async function requireSuperAdmin(
  context: Context<AppBindings>,
  createCentralAuth: CentralAuthFactory,
) {
  const authenticated = await requireVerifiedSession(
    context,
    createCentralAuth(context),
  );
  if ("response" in authenticated) {
    return {
      allowed: false,
      response: authenticated.response,
    } as const;
  }

  const globalRoles = new GlobalRoleRepository(context.env.DB);
  if (!(await globalRoles.isSuperAdmin(authenticated.session.user.id))) {
    return {
      allowed: false,
      response: context.json(
        createApiError(
          "FORBIDDEN",
          "Global super administrator access is required.",
          context.get("requestId"),
        ),
        403,
      ),
    } as const;
  }

  return {
    allowed: true,
    session: authenticated.session,
    globalRoles,
  } as const;
}

export function createAdminRoutes(
  createCentralAuth: CentralAuthFactory,
  createSecurityGuard: (
    context: Context<AppBindings>,
  ) => AuthEntryPointGuard,
  recordSecurityEvent: (
    context: Context<AppBindings>,
    input: {
      event: SecurityNotificationEvent;
      userId: string;
    },
  ) => Promise<void>,
) {
  const routes = new Hono<AppBindings>();

  routes.get("/users", async (context) => {
    const authenticated = await requireSuperAdmin(
      context,
      createCentralAuth,
    );
    if (!authenticated.allowed) {
      return authenticated.response;
    }

    const query = (context.req.query("query") ?? "").trim();
    if (query.length > 100) {
      return context.json(
        createApiError(
          "INVALID_REQUEST",
          "The user search query is too long.",
          context.get("requestId"),
        ),
        400,
      );
    }

    const users = await context.env.DB.prepare(
      `SELECT id, email, username, status
       FROM "user"
       WHERE ? = ''
          OR instr(lower(email), lower(?)) > 0
          OR instr(lower(COALESCE(username, '')), lower(?)) > 0
       ORDER BY
         CASE WHEN id = ? THEN 0 ELSE 1 END,
         lower(COALESCE(username, email))
       LIMIT 50`,
    )
      .bind(
        query,
        query,
        query,
        authenticated.session.user.id,
      )
      .all<UserRow>();

    const userIds = users.results.map(({ id }) => id);
    const memberships =
      userIds.length === 0
        ? { results: [] as MembershipRow[] }
        : await context.env.DB.prepare(
            `SELECT user_id, project_id, role
             FROM project_memberships
             WHERE user_id IN (${userIds.map(() => "?").join(", ")})
             ORDER BY project_id`,
          )
            .bind(...userIds)
            .all<MembershipRow>();
    const rolesByUser = new Map<
      string,
      Partial<Record<ProjectKey, ProjectRole>>
    >();
    for (const membership of memberships.results) {
      const project = projectKeySchema.parse(membership.project_id);
      const role = projectRoleSchema.parse(membership.role);
      const roles = rolesByUser.get(membership.user_id) ?? {};
      roles[project] = role;
      rolesByUser.set(membership.user_id, roles);
    }

    return context.json({
      users: users.results.map((user) => ({
        ...user,
        globalRole:
          user.id === authenticated.session.user.id
            ? "super_admin"
            : null,
        projectRoles: rolesByUser.get(user.id) ?? {},
      })),
    });
  });

  routes.post(
    "/projects/:project/users/:userId/role",
    async (context) => {
      const authenticated = await requireSuperAdmin(
        context,
        createCentralAuth,
      );
      if (!authenticated.allowed) {
        return authenticated.response;
      }
      const securityResponse = await enforceAuthEntryPoint(
        context,
        createSecurityGuard(context),
        {
          action: "account_mutation",
          userId: authenticated.session.user.id,
        },
      );
      if (securityResponse) {
        return securityResponse;
      }

      const project = projectKeySchema.safeParse(
        context.req.param("project"),
      );
      const body = roleBodySchema.safeParse(
        await context.req.json().catch(() => null),
      );
      if (!project.success || !body.success) {
        return context.json(
          createApiError(
            "INVALID_REQUEST",
            "A valid project and role are required.",
            context.get("requestId"),
          ),
          400,
        );
      }

      const targetUserId = context.req.param("userId");
      const targetUser = await context.env.DB.prepare(
        `SELECT id FROM "user" WHERE id = ? LIMIT 1`,
      )
        .bind(targetUserId)
        .first<{ id: string }>();
      if (!targetUser) {
        return context.json(
          createApiError(
            "NOT_FOUND",
            "The target user was not found.",
            context.get("requestId"),
          ),
          404,
        );
      }
      if (
        targetUserId ===
        (await authenticated.globalRoles.getSuperAdminUserId())
      ) {
        return context.json(
          createApiError(
            "INVALID_REQUEST",
            "The global super administrator has effective access to every project.",
            context.get("requestId"),
          ),
          400,
        );
      }

      await new ProjectMembershipRepository(context.env.DB).setRole({
        actorUserId: authenticated.session.user.id,
        targetUserId,
        project: project.data,
        role: body.data.role,
        requestId: context.get("requestId"),
        now: Date.now(),
      });
      await recordSecurityEvent(context, {
        event: "project_role_updated",
        userId: targetUserId,
      });

      return context.json({
        userId: targetUserId,
        project: project.data,
        role: body.data.role,
      });
    },
  );

  return routes;
}
