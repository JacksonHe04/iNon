export interface Env {
  DB: D1Database;
  ENVIRONMENT: "development" | "preview" | "production";
  CANONICAL_ORIGIN: string;
  INTERNAL_API_TOKEN: string;
}

export interface AppBindings {
  Bindings: Env;
  Variables: {
    requestId: string;
  };
}
