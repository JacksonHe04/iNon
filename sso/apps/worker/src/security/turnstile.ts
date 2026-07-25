import { z } from "zod";

const SITEVERIFY_URL =
  "https://challenges.cloudflare.com/turnstile/v0/siteverify";
const MAX_TOKEN_LENGTH = 2048;
const VERIFY_TIMEOUT_MS = 5_000;

const siteverifyResponseSchema = z.object({
  success: z.boolean(),
  action: z.string().optional(),
  hostname: z.string().optional(),
  "error-codes": z.array(z.string()).optional(),
});

export interface TurnstileVerification {
  token: string | null;
  action: string;
  remoteIp: string | null;
}

export interface TurnstileVerifier {
  verify(input: TurnstileVerification): Promise<boolean>;
}

export class CloudflareTurnstileVerifier implements TurnstileVerifier {
  private readonly allowedHostnames: Set<string>;

  constructor(
    private readonly secretKey: string,
    allowedHostnames: readonly string[],
    private readonly fetcher: typeof fetch = fetch,
  ) {
    this.allowedHostnames = new Set(allowedHostnames);
  }

  async verify(input: TurnstileVerification): Promise<boolean> {
    if (
      input.token === null ||
      input.token.length === 0 ||
      input.token.length > MAX_TOKEN_LENGTH
    ) {
      return false;
    }

    const body = new URLSearchParams({
      secret: this.secretKey,
      response: input.token,
      idempotency_key: crypto.randomUUID(),
    });
    if (input.remoteIp) {
      body.set("remoteip", input.remoteIp);
    }

    try {
      const response = await this.fetcher(SITEVERIFY_URL, {
        method: "POST",
        headers: {
          "content-type": "application/x-www-form-urlencoded",
        },
        body,
        signal: AbortSignal.timeout(VERIFY_TIMEOUT_MS),
      });
      if (!response.ok) {
        return false;
      }

      const parsed = siteverifyResponseSchema.safeParse(
        await response.json(),
      );
      return (
        parsed.success &&
        parsed.data.success &&
        parsed.data.action === input.action &&
        typeof parsed.data.hostname === "string" &&
        this.allowedHostnames.has(parsed.data.hostname)
      );
    } catch {
      return false;
    }
  }
}

export function parseTurnstileHostnames(value: string): string[] {
  return value
    .split(",")
    .map((hostname) => hostname.trim().toLowerCase())
    .filter((hostname) => hostname.length > 0);
}
