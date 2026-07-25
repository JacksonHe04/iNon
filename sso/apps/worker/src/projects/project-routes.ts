import { Hono } from "hono";
import type { AppBindings } from "../env";
import { createApiError } from "../http/errors";
import { secureCompare } from "../http/secure-compare";
import { ProjectService } from "./project-service";

function extractBearerToken(header: string | undefined): string | null {
  if (header === undefined || !header.startsWith("Bearer ")) {
    return null;
  }

  const token = header.slice("Bearer ".length);
  return token.length === 0 ? null : token;
}

export function createProjectRoutes() {
  const routes = new Hono<AppBindings>();

  routes.get("/projects", async (context) => {
    const token = extractBearerToken(context.req.header("authorization"));
    const authenticated =
      token !== null &&
      (await secureCompare(token, context.env.INTERNAL_API_TOKEN));

    if (!authenticated) {
      return context.json(
        createApiError(
          "UNAUTHENTICATED",
          "A valid internal API token is required.",
          context.get("requestId"),
        ),
        401,
      );
    }

    const projects = await new ProjectService(context.env.DB).list();
    return context.json({ projects });
  });

  return routes;
}
