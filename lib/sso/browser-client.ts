export class SsoApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code: string,
  ) {
    super(message);
    this.name = "SsoApiError";
  }
}

interface RequestOptions {
  body?: Record<string, unknown>;
  method?: "GET" | "POST";
  turnstileToken?: string;
}

export async function requestSsoJson<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const headers = new Headers({ accept: "application/json" });
  if (options.body) {
    headers.set("content-type", "application/json");
  }
  if (options.turnstileToken) {
    headers.set("x-turnstile-token", options.turnstileToken);
  }

  const response = await fetch(`/api/sso${path}`, {
    method: options.method ?? (options.body ? "POST" : "GET"),
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
    credentials: "include",
    cache: "no-store",
  });
  const payload: unknown = await response
    .json()
    .catch(() => null);
  if (!response.ok) {
    const record =
      payload && typeof payload === "object"
        ? (payload as Record<string, unknown>)
        : {};
    const nested =
      record.error && typeof record.error === "object"
        ? (record.error as Record<string, unknown>)
        : {};
    throw new SsoApiError(
      (typeof nested.message === "string" && nested.message) ||
        (typeof record.message === "string" && record.message) ||
        "账号服务未能完成这次操作。",
      response.status,
      (typeof nested.code === "string" && nested.code) ||
        (typeof record.code === "string" && record.code) ||
        "REQUEST_FAILED",
    );
  }

  return payload as T;
}
