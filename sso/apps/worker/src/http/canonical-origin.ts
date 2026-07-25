import type { MiddlewareHandler } from "hono";
import type { AppBindings } from "../env";
import { createApiError } from "./errors";
import { secureCompare } from "./secure-compare";

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

async function canonicalizeVercelProxyRequest(
  context: Parameters<MiddlewareHandler<AppBindings>>[0],
  canonicalOrigin: URL,
): Promise<Request | null> {
  const proxySecret = context.req.header("x-inon-proxy-secret");
  const forwardedHost = context.req
    .header("x-forwarded-host")
    ?.toLowerCase();
  const forwardedProtocol = context.req
    .header("x-forwarded-proto")
    ?.toLowerCase();
  if (
    !proxySecret ||
    forwardedHost !== canonicalOrigin.host ||
    forwardedProtocol !== canonicalOrigin.protocol.slice(0, -1) ||
    !(await secureCompare(proxySecret, context.env.VERCEL_PROXY_SECRET))
  ) {
    return null;
  }

  const publicUrl = new URL(context.req.url);
  publicUrl.protocol = canonicalOrigin.protocol;
  publicUrl.host = canonicalOrigin.host;
  const request = new Request(publicUrl, context.req.raw);
  request.headers.delete("x-inon-proxy-secret");
  return request;
}

export const canonicalOriginMiddleware: MiddlewareHandler<AppBindings> = async (
  context,
  next,
) => {
  const requestUrl = new URL(context.req.url);
  const canonicalOrigin = new URL(context.env.CANONICAL_ORIGIN);
  const directCanonicalRequest =
    requestUrl.origin === canonicalOrigin.origin
      ? context.req.raw
      : null;
  const proxiedCanonicalRequest = directCanonicalRequest
    ? null
    : await canonicalizeVercelProxyRequest(context, canonicalOrigin);
  const canonicalRequest =
    directCanonicalRequest ?? proxiedCanonicalRequest;

  if (canonicalRequest) {
    context.set("canonicalRequest", canonicalRequest);
  }

  if (!isStatefulRequest(context.req.method, requestUrl.pathname)) {
    await next();
    return;
  }

  if (!canonicalRequest) {
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
