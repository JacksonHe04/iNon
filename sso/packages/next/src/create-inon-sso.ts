import { createRemoteJWKSet, jwtVerify, type JWTPayload } from "jose";
import {
  DEFAULT_BASE_PATH,
  DEFAULT_ISSUER,
  INON_SESSION_ABSOLUTE_SECONDS,
  INON_SESSION_SLIDING_SECONDS,
  OAUTH_SCOPES,
  OAUTH_TRANSACTION_SECONDS,
} from "./constants";
import {
  cookieNames,
  expireCookie,
  readCookie,
  serializeCookie,
} from "./cookies";
import {
  createPkceChallenge,
  decryptPayload,
  deriveEncryptionKey,
  encryptPayload,
  randomValue,
} from "./crypto";
import { InonSsoError } from "./errors";
import { identityFromClaims } from "./identity";
import type {
  InonIdentity,
  InonProjectSession,
  InonSsoClient,
  InonSsoConfig,
  ProjectKey,
  ProjectRole,
} from "./types";

const TRANSACTION_TOKEN_TYPE = "inon-oauth-transaction+jwt";
const SESSION_TOKEN_TYPE = "inon-project-session+jwt";

interface NormalizedConfig {
  project: ProjectKey;
  clientId: string;
  clientSecret: string;
  appOrigin: string;
  sessionSecret: string;
  basePath: string;
  issuer: string;
  secureCookies: boolean;
  fetch: typeof globalThis.fetch;
}

interface OAuthTokenResponse {
  accessToken: string;
  refreshToken: string;
  idToken: string | null;
  expiresIn: number;
}

interface StoredSession extends InonProjectSession {
  accessToken: string;
  accessTokenExpiresAt: number;
  refreshToken: string;
}

function normalizeAbsoluteUrl(value: string, field: string): string {
  const url = new URL(value);
  if (url.protocol !== "https:" && url.protocol !== "http:") {
    throw new TypeError(`${field} must use http or https.`);
  }

  if (
    field === "appOrigin" &&
    (url.pathname !== "/" || url.search.length > 0 || url.hash.length > 0)
  ) {
    throw new TypeError("appOrigin must not include a path, query, or hash.");
  }

  return field === "appOrigin"
    ? url.origin
    : value.replace(/\/+$/, "");
}

function normalizeBasePath(value: string): string {
  if (!value.startsWith("/") || value.startsWith("//")) {
    throw new TypeError("basePath must be an origin-relative path.");
  }

  return value === "/" ? "" : value.replace(/\/+$/, "");
}

function normalizeConfig(config: InonSsoConfig): NormalizedConfig {
  const appOrigin = normalizeAbsoluteUrl(config.appOrigin, "appOrigin");
  const issuer = normalizeAbsoluteUrl(
    config.issuer ?? DEFAULT_ISSUER,
    "issuer",
  );
  const secureCookies =
    config.secureCookies ?? new URL(appOrigin).protocol === "https:";

  if (config.clientId.length === 0 || config.clientSecret.length === 0) {
    throw new TypeError("iNon SSO client credentials are required.");
  }

  return {
    project: config.project,
    clientId: config.clientId,
    clientSecret: config.clientSecret,
    appOrigin,
    sessionSecret: config.sessionSecret,
    basePath: normalizeBasePath(config.basePath ?? DEFAULT_BASE_PATH),
    issuer,
    secureCookies,
    fetch: config.fetch ?? globalThis.fetch,
  };
}

function safeReturnTo(value: string | null | undefined): string {
  if (
    typeof value !== "string" ||
    !value.startsWith("/") ||
    value.startsWith("//")
  ) {
    return "/";
  }

  return value;
}

function queryReturnTo(request: Request): string {
  return safeReturnTo(new URL(request.url).searchParams.get("returnTo"));
}

function routeUrl(
  config: NormalizedConfig,
  action: "login" | "callback" | "refresh" | "logout",
): string {
  return `${config.appOrigin}${config.basePath}/${action}`;
}

function projectUrl(
  config: NormalizedConfig,
  path: string,
): string {
  return new URL(safeReturnTo(path), config.appOrigin).toString();
}

function routeLink(
  config: NormalizedConfig,
  action: "login" | "refresh" | "logout",
  returnTo = "/",
): string {
  const url = new URL(`${config.basePath}/${action}`, config.appOrigin);
  url.searchParams.set("returnTo", safeReturnTo(returnTo));
  return `${url.pathname}${url.search}`;
}

function redirect(
  location: string,
  options?: {
    cookies?: string[];
  },
): Response {
  const headers = new Headers({
    "Cache-Control": "no-store",
    Location: location,
  });

  for (const cookie of options?.cookies ?? []) {
    headers.append("Set-Cookie", cookie);
  }

  return new Response(null, { status: 303, headers });
}

function oauthErrorResponse(): Response {
  return Response.json(
    {
      error: "SSO_LOGIN_FAILED",
      message: "The iNon sign-in could not be completed. Please try again.",
    },
    {
      status: 400,
      headers: { "Cache-Control": "no-store" },
    },
  );
}

function requiredString(value: unknown, field: string): string {
  if (typeof value !== "string" || value.length === 0) {
    throw new TypeError(`Invalid ${field} in the iNon SSO session.`);
  }

  return value;
}

function requiredNumber(value: unknown, field: string): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new TypeError(`Invalid ${field} in the iNon SSO session.`);
  }

  return value;
}

function parseStoredSession(
  payload: JWTPayload,
  project: ProjectKey,
): StoredSession {
  const identity = identityFromClaims(payload, project);

  return {
    ...identity,
    issuedAt: requiredNumber(payload.initial_iat, "initial_iat"),
    absoluteExpiresAt: requiredNumber(
      payload.absolute_expires_at,
      "absolute_expires_at",
    ),
    accessToken: requiredString(payload.access_token, "access_token"),
    accessTokenExpiresAt: requiredNumber(
      payload.access_expires_at,
      "access_expires_at",
    ),
    refreshToken: requiredString(payload.refresh_token, "refresh_token"),
  };
}

function publicSession(session: StoredSession): InonProjectSession {
  const {
    accessToken: _accessToken,
    accessTokenExpiresAt: _accessTokenExpiresAt,
    refreshToken: _refreshToken,
    ...result
  } = session;

  return result;
}

function sessionClaims(
  session: StoredSession,
): Record<string, string | number | boolean | null> {
  return {
    sub: session.id,
    email: session.email,
    email_verified: session.emailVerified,
    preferred_username: session.username,
    "https://inon.space/project": session.project,
    "https://inon.space/project_role": session.projectRole,
    initial_iat: session.issuedAt,
    absolute_expires_at: session.absoluteExpiresAt,
    access_token: session.accessToken,
    access_expires_at: session.accessTokenExpiresAt,
    refresh_token: session.refreshToken,
  };
}

function parseTokenResponse(
  value: unknown,
  options: {
    requireIdToken: boolean;
  },
): OAuthTokenResponse {
  if (typeof value !== "object" || value === null) {
    throw new InonSsoError("OAUTH_ERROR", "Invalid OAuth token response.");
  }

  const body = value as Record<string, unknown>;
  const idToken =
    typeof body.id_token === "string" && body.id_token.length > 0
      ? body.id_token
      : null;

  if (options.requireIdToken && idToken === null) {
    throw new InonSsoError("OAUTH_ERROR", "The ID token is missing.");
  }

  return {
    accessToken: requiredString(body.access_token, "access_token"),
    refreshToken: requiredString(body.refresh_token, "refresh_token"),
    idToken,
    expiresIn: requiredNumber(body.expires_in, "expires_in"),
  };
}

async function readJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch (error) {
    throw new InonSsoError(
      "OAUTH_ERROR",
      "The iNon SSO endpoint returned an invalid response.",
      { cause: error },
    );
  }
}

async function requestTokens(
  config: NormalizedConfig,
  parameters: URLSearchParams,
  requireIdToken: boolean,
): Promise<OAuthTokenResponse> {
  parameters.set("client_id", config.clientId);
  parameters.set("client_secret", config.clientSecret);
  parameters.set("resource", config.issuer);

  const response = await config.fetch(`${config.issuer}/oauth2/token`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: parameters,
    redirect: "error",
  });

  const body = await readJson(response);
  if (!response.ok) {
    throw new InonSsoError("OAUTH_ERROR", "The OAuth token request failed.");
  }

  return parseTokenResponse(body, { requireIdToken });
}

async function currentIdentity(
  config: NormalizedConfig,
  accessToken: string,
): Promise<InonIdentity> {
  const response = await config.fetch(`${config.issuer}/oauth2/userinfo`, {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    redirect: "error",
  });

  if (response.status === 401) {
    throw new InonSsoError(
      "REFRESH_REQUIRED",
      "The iNon access token must be refreshed.",
    );
  }

  const body = await readJson(response);
  if (!response.ok) {
    throw new InonSsoError("OAUTH_ERROR", "The userinfo request failed.");
  }

  return identityFromClaims(
    body as Record<string, unknown>,
    config.project,
  );
}

function ensureSameUser(
  expectedUserId: string,
  identity: InonIdentity,
): void {
  if (identity.id !== expectedUserId) {
    throw new InonSsoError(
      "OAUTH_ERROR",
      "The refreshed iNon identity does not match the project session.",
    );
  }
}

export function createInonSso(input: InonSsoConfig): InonSsoClient {
  const config = normalizeConfig(input);
  const names = cookieNames(config.secureCookies);
  const keyPromise = deriveEncryptionKey(config.sessionSecret);
  const jwks = createRemoteJWKSet(new URL(`${config.issuer}/jwks`));

  async function encryptSession(session: StoredSession): Promise<string> {
    return encryptPayload(sessionClaims(session), {
      key: await keyPromise,
      type: SESSION_TOKEN_TYPE,
      issuer: config.issuer,
      audience: config.appOrigin,
      expiresAt: session.absoluteExpiresAt,
    });
  }

  async function storedSession(
    request: Request,
  ): Promise<StoredSession | null> {
    const token = readCookie(request, names.session);
    if (token === null) {
      return null;
    }

    try {
      const payload = await decryptPayload(token, {
        key: await keyPromise,
        type: SESSION_TOKEN_TYPE,
        issuer: config.issuer,
        audience: config.appOrigin,
      });
      const session = parseStoredSession(payload, config.project);

      return session.absoluteExpiresAt > Math.floor(Date.now() / 1000)
        ? session
        : null;
    } catch {
      return null;
    }
  }

  function sessionCookie(
    encryptedSession: string,
    absoluteExpiresAt: number,
  ): string {
    const remaining = absoluteExpiresAt - Math.floor(Date.now() / 1000);
    return serializeCookie(names.session, encryptedSession, {
      maxAge: Math.min(INON_SESSION_SLIDING_SECONDS, remaining),
      secure: config.secureCookies,
    });
  }

  function clearAuthCookies(): string[] {
    return [
      expireCookie(names.transaction, config.secureCookies),
      expireCookie(names.session, config.secureCookies),
    ];
  }

  async function login(request: Request): Promise<Response> {
    const state = randomValue();
    const nonce = randomValue();
    const verifier = randomValue(48);
    const challenge = await createPkceChallenge(verifier);
    const returnTo = queryReturnTo(request);
    const expiresAt =
      Math.floor(Date.now() / 1000) + OAUTH_TRANSACTION_SECONDS;
    const transaction = await encryptPayload(
      {
        state,
        nonce,
        verifier,
        return_to: returnTo,
      },
      {
        key: await keyPromise,
        type: TRANSACTION_TOKEN_TYPE,
        issuer: config.appOrigin,
        audience: config.clientId,
        expiresAt,
      },
    );

    const authorize = new URL(`${config.issuer}/oauth2/authorize`);
    authorize.searchParams.set("response_type", "code");
    authorize.searchParams.set("client_id", config.clientId);
    authorize.searchParams.set("redirect_uri", routeUrl(config, "callback"));
    authorize.searchParams.set("scope", OAUTH_SCOPES.join(" "));
    authorize.searchParams.set("state", state);
    authorize.searchParams.set("nonce", nonce);
    authorize.searchParams.set("code_challenge", challenge);
    authorize.searchParams.set("code_challenge_method", "S256");

    return redirect(authorize.toString(), {
      cookies: [
        serializeCookie(names.transaction, transaction, {
          maxAge: OAUTH_TRANSACTION_SECONDS,
          secure: config.secureCookies,
        }),
      ],
    });
  }

  async function callback(request: Request): Promise<Response> {
    try {
      const url = new URL(request.url);
      if (url.searchParams.has("error")) {
        return oauthErrorResponse();
      }

      const code = requiredString(url.searchParams.get("code"), "code");
      const state = requiredString(url.searchParams.get("state"), "state");
      const transactionToken = readCookie(request, names.transaction);
      if (transactionToken === null) {
        return oauthErrorResponse();
      }

      const transaction = await decryptPayload(transactionToken, {
        key: await keyPromise,
        type: TRANSACTION_TOKEN_TYPE,
        issuer: config.appOrigin,
        audience: config.clientId,
      });
      if (transaction.state !== state) {
        return oauthErrorResponse();
      }

      const nonce = requiredString(transaction.nonce, "nonce");
      const verifier = requiredString(transaction.verifier, "verifier");
      const tokens = await requestTokens(
        config,
        new URLSearchParams({
          grant_type: "authorization_code",
          code,
          code_verifier: verifier,
          redirect_uri: routeUrl(config, "callback"),
        }),
        true,
      );

      const verified = await jwtVerify(
        requiredString(tokens.idToken, "id_token"),
        jwks,
        {
          algorithms: ["EdDSA"],
          issuer: config.issuer,
          audience: config.clientId,
        },
      );
      if (verified.payload.nonce !== nonce) {
        return oauthErrorResponse();
      }

      const tokenIdentity = identityFromClaims(
        verified.payload,
        config.project,
      );
      const identity = await currentIdentity(config, tokens.accessToken);
      ensureSameUser(tokenIdentity.id, identity);

      const now = Math.floor(Date.now() / 1000);
      const session: StoredSession = {
        ...identity,
        issuedAt: now,
        absoluteExpiresAt: now + INON_SESSION_ABSOLUTE_SECONDS,
        accessToken: tokens.accessToken,
        accessTokenExpiresAt: now + tokens.expiresIn,
        refreshToken: tokens.refreshToken,
      };
      const encryptedSession = await encryptSession(session);

      return redirect(
        projectUrl(
          config,
          safeReturnTo(
            typeof transaction.return_to === "string"
              ? transaction.return_to
              : "/",
          ),
        ),
        {
          cookies: [
            expireCookie(names.transaction, config.secureCookies),
            sessionCookie(encryptedSession, session.absoluteExpiresAt),
          ],
        },
      );
    } catch {
      return oauthErrorResponse();
    }
  }

  async function refresh(request: Request): Promise<Response> {
    const returnTo = queryReturnTo(request);
    const session = await storedSession(request);
    if (session === null) {
      return redirect(
        projectUrl(config, routeLink(config, "login", returnTo)),
        { cookies: clearAuthCookies() },
      );
    }

    try {
      const tokens = await requestTokens(
        config,
        new URLSearchParams({
          grant_type: "refresh_token",
          refresh_token: session.refreshToken,
        }),
        false,
      );
      const identity = await currentIdentity(config, tokens.accessToken);
      ensureSameUser(session.id, identity);

      const nextSession: StoredSession = {
        ...identity,
        issuedAt: session.issuedAt,
        absoluteExpiresAt: session.absoluteExpiresAt,
        accessToken: tokens.accessToken,
        accessTokenExpiresAt:
          Math.floor(Date.now() / 1000) + tokens.expiresIn,
        refreshToken: tokens.refreshToken,
      };
      const encryptedSession = await encryptSession(nextSession);

      return redirect(projectUrl(config, returnTo), {
        cookies: [
          sessionCookie(encryptedSession, nextSession.absoluteExpiresAt),
        ],
      });
    } catch {
      return redirect(
        projectUrl(config, routeLink(config, "login", returnTo)),
        { cookies: clearAuthCookies() },
      );
    }
  }

  async function logout(request: Request): Promise<Response> {
    const returnTo = queryReturnTo(request);
    const session = await storedSession(request);

    if (session !== null) {
      try {
        await config.fetch(`${config.issuer}/oauth2/revoke`, {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            token: session.refreshToken,
            token_type_hint: "refresh_token",
            client_id: config.clientId,
            client_secret: config.clientSecret,
          }),
          redirect: "error",
        });
      } catch {
        // Local logout remains available if central revocation is unavailable.
      }
    }

    return redirect(projectUrl(config, returnTo), {
      cookies: clearAuthCookies(),
    });
  }

  async function handler(request: Request): Promise<Response> {
    const pathname = new URL(request.url).pathname;
    if (pathname === `${config.basePath}/login`) {
      return login(request);
    }
    if (pathname === `${config.basePath}/callback`) {
      return callback(request);
    }
    if (pathname === `${config.basePath}/refresh`) {
      return refresh(request);
    }
    if (pathname === `${config.basePath}/logout`) {
      return logout(request);
    }

    return Response.json(
      { error: "NOT_FOUND" },
      {
        status: 404,
        headers: { "Cache-Control": "no-store" },
      },
    );
  }

  async function requireUser(
    request: Request,
  ): Promise<InonProjectSession> {
    const session = await storedSession(request);
    if (session === null) {
      throw new InonSsoError(
        "UNAUTHENTICATED",
        "An iNon project session is required.",
      );
    }

    return publicSession(session);
  }

  async function requireProjectAdmin(
    request: Request,
  ): Promise<InonProjectSession> {
    const session = await storedSession(request);
    if (session === null) {
      throw new InonSsoError(
        "UNAUTHENTICATED",
        "An iNon project session is required.",
      );
    }

    if (session.accessTokenExpiresAt <= Math.floor(Date.now() / 1000)) {
      throw new InonSsoError(
        "REFRESH_REQUIRED",
        "The iNon project session must be refreshed.",
      );
    }

    const identity = await currentIdentity(config, session.accessToken);
    ensureSameUser(session.id, identity);
    if (identity.projectRole !== ("admin" satisfies ProjectRole)) {
      throw new InonSsoError(
        "FORBIDDEN",
        "Project administrator access is required.",
      );
    }

    return {
      ...identity,
      issuedAt: session.issuedAt,
      absoluteExpiresAt: session.absoluteExpiresAt,
    };
  }

  const client: InonSsoClient = {
    project: config.project,
    basePath: config.basePath,
    handler,
    handlers: { GET: handler },
    async getSession(request) {
      const session = await storedSession(request);
      return session === null ? null : publicSession(session);
    },
    requireUser,
    requireProjectAdmin,
    loginUrl(returnTo) {
      return routeLink(config, "login", returnTo);
    },
    refreshUrl(returnTo) {
      return routeLink(config, "refresh", returnTo);
    },
    logoutUrl(returnTo) {
      return routeLink(config, "logout", returnTo);
    },
  };

  return client;
}
