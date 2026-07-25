import type { MiddlewareHandler } from "hono";
import type { AppBindings } from "../env";

export function createRequestId(): string {
  return `req_${crypto.randomUUID()}`;
}

export const requestIdMiddleware: MiddlewareHandler<AppBindings> = async (
  context,
  next,
) => {
  const requestId = createRequestId();
  context.set("requestId", requestId);

  await next();

  context.header("x-request-id", requestId);
};
