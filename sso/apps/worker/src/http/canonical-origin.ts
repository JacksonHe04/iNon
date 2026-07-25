import type { MiddlewareHandler } from "hono";
import type { AppBindings } from "../env";
import { createApiError } from "./errors";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

export const canonicalOriginMiddleware: MiddlewareHandler<AppBindings> = async (
  context,
  next,
) => {
  if (SAFE_METHODS.has(context.req.method)) {
    await next();
    return;
  }

  const requestOrigin = new URL(context.req.url).origin;
  const canonicalOrigin = new URL(context.env.CANONICAL_ORIGIN).origin;

  if (requestOrigin !== canonicalOrigin) {
    return context.json(
      createApiError(
        "INVALID_REQUEST",
        "Stateful SSO requests must use the canonical origin.",
        context.get("requestId"),
      ),
      421,
    );
  }

  await next();
};
