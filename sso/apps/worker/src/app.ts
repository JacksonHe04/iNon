import { Hono } from "hono";
import {
  createAuthRoutes,
  type AuthRouteOptions,
} from "./auth/auth-routes";
import type { AppBindings } from "./env";
import { canonicalOriginMiddleware } from "./http/canonical-origin";
import { requestIdMiddleware } from "./http/request-id";
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
  app.route("/internal", createProjectRoutes());

  return app;
}
