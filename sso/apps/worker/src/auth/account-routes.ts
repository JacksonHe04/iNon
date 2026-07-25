import { Hono, type Context } from "hono";
import { z } from "zod";
import type { AppBindings } from "../env";
import type { SecurityNotificationEvent } from "../email/templates/security-notification";
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
  password: z.string().min(8).max(128),
});

async function requireVerifiedSession(
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

    await auth.api.setPassword({
      headers: context.req.raw.headers,
      body: { newPassword: parsed.data.password },
    });
    await recordSecurityEvent(context, {
      event: "password_updated",
      userId: authenticated.session.user.id,
    });
    return context.json({ success: true });
  });

  return routes;
}
