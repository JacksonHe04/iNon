import { Hono, type Context } from "hono";
import { normalizeUsername } from "@inon/sso-contracts";
import type { AppBindings } from "../env";
import type { EmailService } from "../email/email-service";
import { createResendEmailService } from "../email/resend-email-service";
import {
  DefaultAuthEntryPointGuard,
  type AuthEntryPointGuard,
} from "../security/auth-entry-points";
import { enforceAuthEntryPoint } from "../security/http-enforcement";
import type { SecurityAction } from "../security/rate-limit";
import { SecurityEventService } from "../security/security-events";
import { createAccountRoutes, type CentralAuthFactory } from "./account-routes";
import { createAuth } from "./create-auth";
import { normalizeEmail } from "./email";
import { handleGitHubCallback } from "./github-callback";

export interface AuthRouteOptions {
  createEmailService?: (context: Context<AppBindings>) => EmailService;
  createSecurityGuard?: (
    context: Context<AppBindings>,
  ) => AuthEntryPointGuard;
  deferBackgroundTasks?: boolean;
}

interface ProtectedAuthRequest {
  action: SecurityAction;
  identifier?: string;
}

async function classifyProtectedAuthRequest(
  request: Request,
): Promise<ProtectedAuthRequest | null> {
  if (request.method !== "POST") {
    return null;
  }

  const pathname = new URL(request.url).pathname;
  const body = await request
    .clone()
    .json<Record<string, unknown>>()
    .catch((): Record<string, unknown> => ({}));
  if (pathname.endsWith("/email-otp/send-verification-otp")) {
    return {
      action: "otp_send",
      ...(typeof body.email === "string"
        ? { identifier: normalizeEmail(body.email) }
        : {}),
    };
  }
  if (pathname.endsWith("/sign-in/email-otp")) {
    return {
      action: "otp_verify",
      ...(typeof body.email === "string"
        ? { identifier: normalizeEmail(body.email) }
        : {}),
    };
  }
  if (pathname.endsWith("/sign-in/email")) {
    return {
      action: "password_login",
      ...(typeof body.email === "string"
        ? { identifier: normalizeEmail(body.email) }
        : {}),
    };
  }
  if (pathname.endsWith("/sign-in/username")) {
    return {
      action: "password_login",
      ...(typeof body.username === "string"
        ? { identifier: normalizeUsername(body.username) }
        : {}),
    };
  }
  if (
    pathname.endsWith("/sign-in/social") &&
    body.provider === "github"
  ) {
    return { action: "github_start" };
  }

  return null;
}

function defaultEmailService(context: Context<AppBindings>): EmailService {
  return createResendEmailService(
    context.env.RESEND_API_KEY,
    context.env.RESEND_FROM,
  );
}

export function createAuthRoutes(options: AuthRouteOptions = {}) {
  const routes = new Hono<AppBindings>();
  const getEmailService = (context: Context<AppBindings>) =>
    options.createEmailService?.(context) ?? defaultEmailService(context);
  const recordSecurityEvent = async (
    context: Context<AppBindings>,
    input: {
      event: Parameters<SecurityEventService["record"]>[0]["event"];
      userId: string;
    },
  ) => {
    const task = new SecurityEventService(
      context.env.DB,
      getEmailService(context),
    )
      .record({
        ...input,
        requestId: context.get("requestId"),
      })
      .catch(() => undefined);
    if (options.deferBackgroundTasks === false) {
      await task;
      return;
    }
    context.executionCtx.waitUntil(task);
  };
  const createSecurityGuard = (context: Context<AppBindings>) =>
    options.createSecurityGuard?.(context) ??
    new DefaultAuthEntryPointGuard(context.env);
  const createCentralAuth: CentralAuthFactory = (context) => {
    const emailService = getEmailService(context);
    return createAuth(context.env, {
      sendVerificationOTP: (message) =>
        emailService.sendVerificationOTP(message),
      recordSecurityEvent: (input) =>
        new SecurityEventService(context.env.DB, emailService).record({
          ...input,
          requestId: context.get("requestId"),
        }),
      ...(options.deferBackgroundTasks === false
        ? {}
        : {
            runInBackground: (promise: Promise<unknown>) =>
              context.executionCtx.waitUntil(promise),
          }),
    });
  };

  routes.route(
    "/account",
    createAccountRoutes(
      createCentralAuth,
      createSecurityGuard,
      recordSecurityEvent,
    ),
  );

  routes.all("/github/callback", (context) =>
    handleGitHubCallback(createCentralAuth(context), context.req.raw),
  );

  routes.all("/auth/*", async (context) => {
    const protectedRequest = await classifyProtectedAuthRequest(
      context.req.raw,
    );
    if (protectedRequest) {
      const securityResponse = await enforceAuthEntryPoint(
        context,
        createSecurityGuard(context),
        protectedRequest,
      );
      if (securityResponse) {
        return securityResponse;
      }
    }

    return createCentralAuth(context).handler(context.req.raw);
  });

  return routes;
}
