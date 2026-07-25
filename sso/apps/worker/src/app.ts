import { Hono } from "hono";
import {
  createAuthRoutes,
  type AuthRouteOptions,
} from "./auth/auth-routes";
import type { AppBindings } from "./env";
import { canonicalOriginMiddleware } from "./http/canonical-origin";
import { internalApiAuthMiddleware } from "./http/internal-auth";
import { requestIdMiddleware } from "./http/request-id";
import { createOAuthClientRoutes } from "./internal/oauth-client-routes";
import { createProjectRoutes } from "./projects/project-routes";

export function createApp(authOptions: AuthRouteOptions = {}) {
  const app = new Hono<AppBindings>().basePath("/api/sso");

  app.use("*", requestIdMiddleware);
  app.use("*", canonicalOriginMiddleware);

  app.get("/health", (context) =>
    context.json({
      status: "ok",
      service: "inon-sso",
      environment: context.env.ENVIRONMENT,
    }),
  );
  app.route("/", createAuthRoutes(authOptions));
  app.use("/internal/*", internalApiAuthMiddleware);
  app.route("/internal", createProjectRoutes());
  app.route("/internal", createOAuthClientRoutes());

  return app;
}
