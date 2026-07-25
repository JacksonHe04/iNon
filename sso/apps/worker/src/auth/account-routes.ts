import { Hono, type Context } from "hono";
import { z } from "zod";
import type { AppBindings } from "../env";
import type { SecurityNotificationEvent } from "../email/templates/security-notification";
import { GlobalRoleRepository } from "../authorization/global-roles";
import { createApiError } from "../http/errors";
import type { AuthEntryPointGuard } from "../security/auth-entry-points";
import { enforceAuthEntryPoint } from "../security/http-enforcement";
import {
  AccountPolicyError,
  AccountService,
} from "./account-service";
import type { createAuth } from "./create-auth";

export type CentralAuth = ReturnType<typeof createAuth>;
export type CentralAuthFactory = (
  context: Context<AppBindings>,
) => CentralAuth;

const usernameBodySchema = z.object({
  username: z.string(),
});

const passwordBodySchema = z.object({
  currentPassword: z.string().min(8).max(128).optional(),
  password: z.string().min(8).max(128),
});

export async function requireVerifiedSession(
  context: Context<AppBindings>,
  auth: CentralAuth,
) {
  const session = await auth.api.getSession({
    headers: context.req.raw.headers,
  });
  if (!session) {
    return {
      response: context.json(
        createApiError(
          "UNAUTHENTICATED",
          "An authenticated iNon session is required.",
          context.get("requestId"),
        ),
        401,
      ),
    } as const;
  }
  if (!session.user.emailVerified) {
    return {
      response: context.json(
        createApiError(
          "FORBIDDEN",
          "The account email must be verified.",
          context.get("requestId"),
        ),
        403,
      ),
    } as const;
  }

  return { session } as const;
}

export function createAccountRoutes(
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

  routes.get("/profile", async (context) => {
    const auth = createCentralAuth(context);
    const authenticated = await requireVerifiedSession(context, auth);
    if ("response" in authenticated) {
      return authenticated.response;
    }

    const accounts = await context.env.DB.prepare(
      `SELECT "providerId"
       FROM "account"
       WHERE "userId" = ?`,
    )
      .bind(authenticated.session.user.id)
      .all<{ providerId: string }>();
    const providers = new Set(
      accounts.results.map(({ providerId }) => providerId),
    );
    const globalRole = await new GlobalRoleRepository(
      context.env.DB,
    ).isSuperAdmin(authenticated.session.user.id);
    return context.json({
      user: {
        id: authenticated.session.user.id,
        email: authenticated.session.user.email,
        username: authenticated.session.user.username ?? null,
      },
      hasPassword: providers.has("credential"),
      githubLinked: providers.has("github"),
      globalRole: globalRole ? "super_admin" : null,
    });
  });

  routes.post("/username", async (context) => {
    const auth = createCentralAuth(context);
    const authenticated = await requireVerifiedSession(context, auth);
    if ("response" in authenticated) {
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

    const parsed = usernameBodySchema.safeParse(await context.req.json());
    if (!parsed.success) {
      return context.json(
        createApiError(
          "INVALID_REQUEST",
          "A valid username is required.",
          context.get("requestId"),
        ),
        400,
      );
    }

    try {
      const result = await new AccountService(context.env.DB).setUsername(
        authenticated.session.user.id,
        parsed.data.username,
      );
      await recordSecurityEvent(context, {
        event: "username_updated",
        userId: authenticated.session.user.id,
      });
      return context.json({
        username: result.username,
        usernameChangedAt: result.usernameChangedAt.toISOString(),
      });
    } catch (error) {
      if (!(error instanceof AccountPolicyError)) {
        throw error;
      }

      const status =
        error.code === "USERNAME_TAKEN"
          ? 409
          : error.code === "USERNAME_CHANGE_TOO_SOON"
            ? 429
            : error.code === "USER_NOT_FOUND"
              ? 404
              : 400;
      const code =
        status === 409
          ? "CONFLICT"
          : status === 429
            ? "RATE_LIMITED"
            : status === 404
              ? "NOT_FOUND"
              : "INVALID_REQUEST";
      return context.json(
        {
          ...createApiError(code, error.message, context.get("requestId")),
          retryAt: error.retryAt?.toISOString() ?? null,
        },
        status,
      );
    }
  });

  routes.post("/password", async (context) => {
    const auth = createCentralAuth(context);
    const authenticated = await requireVerifiedSession(context, auth);
    if ("response" in authenticated) {
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

    const parsed = passwordBodySchema.safeParse(await context.req.json());
    if (!parsed.success) {
      return context.json(
        createApiError(
          "INVALID_REQUEST",
          "The password must contain between 8 and 128 characters.",
          context.get("requestId"),
        ),
        400,
      );
    }

    const credentialAccount = await context.env.DB.prepare(
      `SELECT "id"
       FROM "account"
       WHERE "userId" = ? AND "providerId" = 'credential'
       LIMIT 1`,
    )
      .bind(authenticated.session.user.id)
      .first<{ id: string }>();
    if (credentialAccount) {
      if (!parsed.data.currentPassword) {
        return context.json(
          createApiError(
            "INVALID_REQUEST",
            "The current password is required.",
            context.get("requestId"),
          ),
          400,
        );
      }
      await auth.api.changePassword({
        headers: context.req.raw.headers,
        body: {
          currentPassword: parsed.data.currentPassword,
          newPassword: parsed.data.password,
          revokeOtherSessions: true,
        },
      });
    } else {
      await auth.api.setPassword({
        headers: context.req.raw.headers,
        body: { newPassword: parsed.data.password },
      });
    }
    await recordSecurityEvent(context, {
      event: "password_updated",
      userId: authenticated.session.user.id,
    });
    return context.json({
      success: true,
      mode: credentialAccount ? "changed" : "set",
    });
  });

  routes.get("/sessions", async (context) => {
    const auth = createCentralAuth(context);
    const authenticated = await requireVerifiedSession(context, auth);
    if ("response" in authenticated) {
      return authenticated.response;
    }

    const sessions = await context.env.DB.prepare(
      `SELECT
        "id",
        "createdAt",
        "updatedAt",
        "expiresAt",
        "ipAddress",
        "userAgent"
       FROM "session"
       WHERE "userId" = ?
         AND "expiresAt" > ?
       ORDER BY "updatedAt" DESC`,
    )
      .bind(
        authenticated.session.user.id,
        new Date().toISOString(),
      )
      .all<{
        id: string;
        createdAt: string;
        updatedAt: string;
        expiresAt: string;
        ipAddress: string | null;
        userAgent: string | null;
      }>();

    return context.json({
      sessions: sessions.results.map((session) => ({
        ...session,
        current: session.id === authenticated.session.session.id,
      })),
    });
  });

  routes.post("/sessions/:sessionId/revoke", async (context) => {
    const auth = createCentralAuth(context);
    const authenticated = await requireVerifiedSession(context, auth);
    if ("response" in authenticated) {
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

    const sessionId = context.req.param("sessionId");
    if (sessionId === authenticated.session.session.id) {
      return context.json(
        createApiError(
          "INVALID_REQUEST",
          "Use sign out to end the current session.",
          context.get("requestId"),
        ),
        400,
      );
    }
    const target = await context.env.DB.prepare(
      `SELECT "token"
       FROM "session"
       WHERE "id" = ? AND "userId" = ?
       LIMIT 1`,
    )
      .bind(sessionId, authenticated.session.user.id)
      .first<{ token: string }>();
    if (!target) {
      return context.json(
        createApiError(
          "NOT_FOUND",
          "The session was not found.",
          context.get("requestId"),
        ),
        404,
      );
    }

    await auth.api.revokeSession({
      headers: context.req.raw.headers,
      body: { token: target.token },
    });
    return context.json({ success: true });
  });

  return routes;
}
