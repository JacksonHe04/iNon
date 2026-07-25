import type { Context } from "hono";
import type { AppBindings } from "../env";
import { createApiError } from "../http/errors";
import {
  type AuthEntryPointGuard,
} from "./auth-entry-points";
import type { SecurityAction } from "./rate-limit";

export async function enforceAuthEntryPoint(
  context: Context<AppBindings>,
  guard: AuthEntryPointGuard,
  input: {
    action: SecurityAction;
    identifier?: string;
    userId?: string;
  },
): Promise<Response | null> {
  const decision = await guard.protect({
    ...input,
    remoteIp: context.get("clientIp") ?? null,
    turnstileToken:
      context.req.header("x-turnstile-token")?.trim() || null,
  });
  if (decision.allowed) {
    return null;
  }

  if (decision.reason === "rate_limited") {
    context.header(
      "retry-after",
      decision.retryAfterSeconds.toString(),
    );
    return context.json(
      {
        ...createApiError(
          "RATE_LIMITED",
          "Too many authentication attempts. Please try again later.",
          context.get("requestId"),
        ),
        retryAfterSeconds: decision.retryAfterSeconds,
      },
      429,
    );
  }

  return context.json(
    createApiError(
      "FORBIDDEN",
      "Security verification failed.",
      context.get("requestId"),
    ),
    403,
  );
}
