import { Hono } from "hono";
import { z } from "zod";
import { normalizeEmail } from "../auth/email";
import { GlobalRoleRepository } from "../authorization/global-roles";
import type { AppBindings } from "../env";
import { createApiError } from "../http/errors";

const bootstrapBodySchema = z.object({
  email: z.string().email(),
});

export function createSuperAdminRoutes() {
  const routes = new Hono<AppBindings>();

  routes.post("/super-admin/bootstrap", async (context) => {
    const parsed = bootstrapBodySchema.safeParse(
      await context.req.json().catch(() => null),
    );
    if (!parsed.success) {
      return context.json(
        createApiError(
          "INVALID_REQUEST",
          "A valid verified account email is required.",
          context.get("requestId"),
        ),
        400,
      );
    }

    const user = await context.env.DB.prepare(
      `SELECT id
       FROM "user"
       WHERE email = ?
         AND "emailVerified" = 1
         AND status = 'active'
       LIMIT 1`,
    )
      .bind(normalizeEmail(parsed.data.email))
      .first<{ id: string }>();
    if (!user) {
      return context.json(
        createApiError(
          "NOT_FOUND",
          "No active email-verified iNon account matches that email.",
          context.get("requestId"),
        ),
        404,
      );
    }

    try {
      await new GlobalRoleRepository(context.env.DB).bootstrap({
        userId: user.id,
        requestId: context.get("requestId"),
        now: Date.now(),
      });
    } catch {
      return context.json(
        createApiError(
          "CONFLICT",
          "The global super administrator is already bound to another account.",
          context.get("requestId"),
        ),
        409,
      );
    }

    return context.json({
      userId: user.id,
      globalRole: "super_admin",
    });
  });

  return routes;
}
