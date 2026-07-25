import type { MiddlewareHandler } from "hono";
import type { AppBindings } from "../env";
import { createApiError } from "./errors";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);
const STATEFUL_GET_PATHS = [
  "/api/sso/github/callback",
  "/api/sso/auth/callback/",
  "/api/sso/auth/oauth2/authorize",
];

function isStatefulRequest(method: string, pathname: string): boolean {
  if (!SAFE_METHODS.has(method)) {
    return true;
  }

  return (
    method === "GET" &&
    STATEFUL_GET_PATHS.some((path) => pathname.startsWith(path))
  );
}

export const canonicalOriginMiddleware: MiddlewareHandler<AppBindings> = async (
  context,
  next,
) => {
  const requestUrl = new URL(context.req.url);
  if (!isStatefulRequest(context.req.method, requestUrl.pathname)) {
    await next();
    return;
  }

  const requestOrigin = requestUrl.origin;
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
