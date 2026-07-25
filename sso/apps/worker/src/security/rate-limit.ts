export type SecurityAction =
  | "otp_send"
  | "otp_verify"
  | "password_login"
  | "github_start"
  | "account_mutation";

export type RateLimitSubjectKind = "identifier" | "ip" | "user";

interface RateLimitRule {
  max: number;
  windowSeconds: number;
}

const RULES: Record<
  SecurityAction,
  Partial<Record<RateLimitSubjectKind, RateLimitRule>>
> = {
  otp_send: {
    identifier: { max: 5, windowSeconds: 15 * 60 },
    ip: { max: 20, windowSeconds: 60 * 60 },
  },
  otp_verify: {
    identifier: { max: 10, windowSeconds: 15 * 60 },
    ip: { max: 30, windowSeconds: 15 * 60 },
  },
  password_login: {
    identifier: { max: 10, windowSeconds: 15 * 60 },
    ip: { max: 50, windowSeconds: 15 * 60 },
  },
  github_start: {
    ip: { max: 20, windowSeconds: 15 * 60 },
  },
  account_mutation: {
    user: { max: 10, windowSeconds: 60 * 60 },
    ip: { max: 20, windowSeconds: 60 * 60 },
  },
};

export interface RateLimitSubject {
  kind: RateLimitSubjectKind;
  value: string;
}

export interface RateLimitDecision {
  allowed: boolean;
  retryAfterSeconds: number;
}

function bytesToBase64Url(bytes: Uint8Array): string {
  let value = "";
  for (const byte of bytes) {
    value += String.fromCharCode(byte);
  }
  return btoa(value)
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "");
}

async function digestSubject(
  secret: string,
  subject: RateLimitSubject,
): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(`${subject.kind}:${subject.value}`),
  );
  return bytesToBase64Url(new Uint8Array(signature));
}

export class D1RateLimiter {
  constructor(
    private readonly db: D1Database,
    private readonly digestSecret: string,
  ) {}

  async consume(
    action: SecurityAction,
    subjects: readonly RateLimitSubject[],
    now = Math.floor(Date.now() / 1_000),
  ): Promise<RateLimitDecision> {
    const applicable = subjects.flatMap((subject) => {
      const rule = RULES[action][subject.kind];
      return rule ? [{ subject, rule }] : [];
    });
    const prepared = await Promise.all(
      applicable.map(async ({ subject, rule }) => {
        const subjectDigest = await digestSubject(
          this.digestSecret,
          subject,
        );
        const windowStartedAt =
          Math.floor(now / rule.windowSeconds) * rule.windowSeconds;
        const expiresAt = windowStartedAt + rule.windowSeconds;
        const bucketKey = [
          action,
          subject.kind,
          subjectDigest,
          windowStartedAt,
        ].join(":");
        return {
          rule,
          expiresAt,
          statement: this.db
            .prepare(
              `INSERT INTO "auth_rate_limit_buckets" (
                "bucket_key",
                "action",
                "subject_kind",
                "subject_digest",
                "window_started_at",
                "expires_at",
                "request_count"
              ) VALUES (?, ?, ?, ?, ?, ?, 1)
              ON CONFLICT ("bucket_key") DO UPDATE SET
                "request_count" = "request_count" + 1
              RETURNING "request_count"`,
            )
            .bind(
              bucketKey,
              action,
              subject.kind,
              subjectDigest,
              windowStartedAt,
              expiresAt,
            ),
        };
      }),
    );
    if (prepared.length === 0) {
      return { allowed: true, retryAfterSeconds: 0 };
    }

    const results = await this.db.batch(
      prepared.map(({ statement }) => statement),
    );
    let retryAfterSeconds = 0;
    let allowed = true;
    for (const [index, result] of results.entries()) {
      const requestCount = (
        result.results[0] as { request_count?: number } | undefined
      )?.request_count;
      const entry = prepared[index]!;
      if (requestCount === undefined || requestCount > entry.rule.max) {
        allowed = false;
        retryAfterSeconds = Math.max(
          retryAfterSeconds,
          Math.max(1, entry.expiresAt - now),
        );
      }
    }

    return { allowed, retryAfterSeconds };
  }
}
