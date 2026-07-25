import type { MiddlewareHandler } from "hono";
import type { AppBindings } from "../env";
import { createApiError } from "./errors";
import { secureCompare } from "./secure-compare";

function extractBearerToken(header: string | undefined): string | null {
  if (header === undefined || !header.startsWith("Bearer ")) {
    return null;
  }

  const token = header.slice("Bearer ".length);
  return token.length === 0 ? null : token;
}

export const internalApiAuthMiddleware: MiddlewareHandler<
  AppBindings
> = async (context, next) => {
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

  await next();
};
