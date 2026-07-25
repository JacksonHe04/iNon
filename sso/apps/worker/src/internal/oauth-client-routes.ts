import { Hono } from "hono";
import type { AppBindings } from "../env";
import { createApiError } from "../http/errors";
import {
  bootstrapFirstPartyOAuthClients,
  firstPartyOAuthClientBootstrapSchema,
  OAuthClientBootstrapError,
} from "../oauth/client-bootstrap";

export function createOAuthClientRoutes() {
  const routes = new Hono<AppBindings>();

  routes.post("/oauth-clients/bootstrap", async (context) => {
    const body = await context.req.json().catch(() => null);
    const parsed = firstPartyOAuthClientBootstrapSchema.safeParse(body);
    if (!parsed.success) {
      return context.json(
        createApiError(
          "INVALID_REQUEST",
          "A complete first-party OAuth client registry is required.",
          context.get("requestId"),
        ),
        400,
      );
    }

    try {
      const clients = await bootstrapFirstPartyOAuthClients(
        context.env.DB,
        parsed.data.clients,
      );
      context.header("cache-control", "no-store");
      return context.json({ clients });
    } catch (error) {
      if (!(error instanceof OAuthClientBootstrapError)) {
        throw error;
      }

      return context.json(
        {
          ...createApiError(
            "CONFLICT",
            error.message,
            context.get("requestId"),
          ),
          project: error.project,
        },
        409,
      );
    }
  });

  return routes;
}
