export interface Env {
  DB: D1Database;
  ENVIRONMENT: "development" | "preview" | "production";
  CANONICAL_ORIGIN: string;
}

export interface AppBindings {
  Bindings: Env;
  Variables: {
    requestId: string;
  };
}
