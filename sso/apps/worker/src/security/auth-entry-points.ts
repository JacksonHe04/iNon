import type { Env } from "../env";
import {
  D1RateLimiter,
  type RateLimitSubject,
  type SecurityAction,
} from "./rate-limit";
import {
  CloudflareTurnstileVerifier,
  parseTurnstileHostnames,
  type TurnstileVerifier,
} from "./turnstile";

export type AuthEntryPointDecision =
  | { allowed: true }
  | {
      allowed: false;
      reason: "rate_limited";
      retryAfterSeconds: number;
    }
  | { allowed: false; reason: "turnstile_failed" };

export interface AuthEntryPointGuard {
  protect(input: {
    action: SecurityAction;
    identifier?: string;
    userId?: string;
    remoteIp: string | null;
    turnstileToken: string | null;
  }): Promise<AuthEntryPointDecision>;
}

export class DefaultAuthEntryPointGuard
  implements AuthEntryPointGuard
{
  private readonly rateLimiter: D1RateLimiter;
  private readonly turnstile: TurnstileVerifier;

  constructor(env: Env, turnstile?: TurnstileVerifier) {
    this.rateLimiter = new D1RateLimiter(
      env.DB,
      env.BETTER_AUTH_SECRET,
    );
    this.turnstile =
      turnstile ??
      new CloudflareTurnstileVerifier(
        env.TURNSTILE_SECRET_KEY,
        parseTurnstileHostnames(env.TURNSTILE_HOSTNAMES),
      );
  }

  async protect(input: {
    action: SecurityAction;
    identifier?: string;
    userId?: string;
    remoteIp: string | null;
    turnstileToken: string | null;
  }): Promise<AuthEntryPointDecision> {
    const subjects: RateLimitSubject[] = [];
    if (input.identifier) {
      subjects.push({ kind: "identifier", value: input.identifier });
    }
    if (input.userId) {
      subjects.push({ kind: "user", value: input.userId });
    }
    subjects.push({ kind: "ip", value: input.remoteIp ?? "unknown" });

    const rateLimit = await this.rateLimiter.consume(
      input.action,
      subjects,
    );
    if (!rateLimit.allowed) {
      return {
        allowed: false,
        reason: "rate_limited",
        retryAfterSeconds: rateLimit.retryAfterSeconds,
      };
    }

    const verified = await this.turnstile.verify({
      token: input.turnstileToken,
      action: input.action,
      remoteIp: input.remoteIp,
    });
    return verified
      ? { allowed: true }
      : { allowed: false, reason: "turnstile_failed" };
  }
}
