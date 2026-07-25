import { Hono, type Context } from "hono";
import type { AppBindings } from "../env";
import type { EmailService } from "../email/email-service";
import { createResendEmailService } from "../email/resend-email-service";
import { createAccountRoutes, type CentralAuthFactory } from "./account-routes";
import { createAuth } from "./create-auth";
import { handleGitHubCallback } from "./github-callback";

export interface AuthRouteOptions {
  createEmailService?: (context: Context<AppBindings>) => EmailService;
  deferBackgroundTasks?: boolean;
}

function defaultEmailService(context: Context<AppBindings>): EmailService {
  return createResendEmailService(
    context.env.RESEND_API_KEY,
    context.env.RESEND_FROM,
  );
}

export function createAuthRoutes(options: AuthRouteOptions = {}) {
  const routes = new Hono<AppBindings>();
  const createCentralAuth: CentralAuthFactory = (context) => {
    const emailService =
      options.createEmailService?.(context) ?? defaultEmailService(context);
    return createAuth(context.env, {
      sendVerificationOTP: (message) =>
        emailService.sendVerificationOTP(message),
      ...(options.deferBackgroundTasks === false
        ? {}
        : {
            runInBackground: (promise: Promise<unknown>) =>
              context.executionCtx.waitUntil(promise),
          }),
    });
  };

  routes.route("/account", createAccountRoutes(createCentralAuth));

  routes.all("/github/callback", (context) =>
    handleGitHubCallback(createCentralAuth(context), context.req.raw),
  );

  routes.all("/auth/*", (context) =>
    createCentralAuth(context).handler(context.req.raw),
  );

  return routes;
}
