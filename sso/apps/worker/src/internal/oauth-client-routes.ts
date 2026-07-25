import { Hono } from "hono";
import { createAuth } from "../auth/create-auth";
import type { AppBindings } from "../env";
import { createApiError } from "../http/errors";
import {
  bootstrapFirstPartyOAuthClients,
  OAuthClientBootstrapError,
} from "../oauth/client-bootstrap";

export function createOAuthClientRoutes() {
  const routes = new Hono<AppBindings>();

  routes.post("/oauth-clients/bootstrap", async (context) => {
    const auth = createAuth(context.env, {
      sendVerificationOTP: async () => {
        throw new Error("Email delivery is unavailable on internal routes.");
      },
    });

    try {
      const clients = await bootstrapFirstPartyOAuthClients(
        context.env.DB,
        auth,
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
