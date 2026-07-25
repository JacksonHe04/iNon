export interface Env {
  DB: D1Database;
  ENVIRONMENT: "development" | "preview" | "production";
  CANONICAL_ORIGIN: string;
  BETTER_AUTH_SECRET: string;
  GITHUB_CLIENT_ID: string;
  GITHUB_CLIENT_SECRET: string;
  INTERNAL_API_TOKEN: string;
  RESEND_API_KEY: string;
  RESEND_FROM: string;
  TURNSTILE_HOSTNAMES: string;
  TURNSTILE_SECRET_KEY: string;
  TURNSTILE_SITE_KEY: string;
}

export interface AppBindings {
  Bindings: Env;
  Variables: {
    requestId: string;
  };
}
