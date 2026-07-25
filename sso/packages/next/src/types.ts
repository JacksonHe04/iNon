export type ProjectKey =
  | "inon"
  | "leaf"
  | "pine"
  | "sayless"
  | "treez";

export type ProjectRole = "member" | "admin";

export interface InonSsoConfig {
  project: ProjectKey;
  clientId: string;
  clientSecret: string;
  appOrigin: string;
  sessionSecret: string;
  basePath?: string;
  issuer?: string;
  secureCookies?: boolean;
  fetch?: typeof globalThis.fetch;
}

export interface InonIdentity {
  id: string;
  email: string;
  emailVerified: boolean;
  username: string | null;
  project: ProjectKey;
  projectRole: ProjectRole;
}

export interface InonProjectSession extends InonIdentity {
  issuedAt: number;
  absoluteExpiresAt: number;
}

export interface InonSsoClient {
  readonly project: ProjectKey;
  readonly basePath: string;
  readonly handler: (request: Request) => Promise<Response>;
  readonly handlers: {
    GET: (request: Request) => Promise<Response>;
  };
  getSession(request: Request): Promise<InonProjectSession | null>;
  requireUser(request: Request): Promise<InonProjectSession>;
  requireProjectAdmin(request: Request): Promise<InonProjectSession>;
  loginUrl(returnTo?: string): string;
  refreshUrl(returnTo?: string): string;
  logoutUrl(returnTo?: string): string;
}
