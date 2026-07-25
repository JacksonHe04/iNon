import { Hono } from "hono";
import type { AppBindings } from "./env";
import { canonicalOriginMiddleware } from "./http/canonical-origin";
import { requestIdMiddleware } from "./http/request-id";

export function createApp() {
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

  return app;
}
