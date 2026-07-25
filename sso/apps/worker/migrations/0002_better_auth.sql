CREATE TABLE "user" (
  "id" TEXT PRIMARY KEY NOT NULL,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL UNIQUE,
  "emailVerified" INTEGER NOT NULL,
  "image" TEXT,
  "createdAt" DATE NOT NULL,
  "updatedAt" DATE NOT NULL,
  "username" TEXT UNIQUE,
  "displayUsername" TEXT,
  "status" TEXT NOT NULL CHECK ("status" IN ('active', 'disabled')),
  "usernameChangedAt" DATE,
  "migrationSource" TEXT,
  "migrationSubject" TEXT
);

CREATE TABLE "session" (
  "id" TEXT PRIMARY KEY NOT NULL,
  "expiresAt" DATE NOT NULL,
  "token" TEXT NOT NULL UNIQUE,
  "createdAt" DATE NOT NULL,
  "updatedAt" DATE NOT NULL,
  "ipAddress" TEXT,
  "userAgent" TEXT,
  "userId" TEXT NOT NULL
    REFERENCES "user" ("id") ON DELETE CASCADE,
  "absoluteExpiresAt" DATE NOT NULL,
  "revokedAt" DATE,
  "revokeReason" TEXT
);

CREATE TABLE "account" (
  "id" TEXT PRIMARY KEY NOT NULL,
  "accountId" TEXT NOT NULL,
  "providerId" TEXT NOT NULL,
  "userId" TEXT NOT NULL
    REFERENCES "user" ("id") ON DELETE CASCADE,
  "accessToken" TEXT,
  "refreshToken" TEXT,
  "idToken" TEXT,
  "accessTokenExpiresAt" DATE,
  "refreshTokenExpiresAt" DATE,
  "scope" TEXT,
  "password" TEXT,
  "createdAt" DATE NOT NULL,
  "updatedAt" DATE NOT NULL
);

CREATE TABLE "verification" (
  "id" TEXT PRIMARY KEY NOT NULL,
  "identifier" TEXT NOT NULL,
  "value" TEXT NOT NULL,
  "expiresAt" DATE NOT NULL,
  "createdAt" DATE NOT NULL,
  "updatedAt" DATE NOT NULL
);

CREATE TABLE "jwks" (
  "id" TEXT PRIMARY KEY NOT NULL,
  "publicKey" TEXT NOT NULL,
  "privateKey" TEXT NOT NULL,
  "createdAt" DATE NOT NULL,
  "expiresAt" DATE
);

CREATE TABLE "oauthClient" (
  "id" TEXT PRIMARY KEY NOT NULL,
  "clientId" TEXT NOT NULL UNIQUE,
  "clientSecret" TEXT,
  "disabled" INTEGER,
  "skipConsent" INTEGER,
  "enableEndSession" INTEGER,
  "subjectType" TEXT,
  "scopes" TEXT,
  "userId" TEXT REFERENCES "user" ("id") ON DELETE CASCADE,
  "createdAt" DATE,
  "updatedAt" DATE,
  "name" TEXT,
  "uri" TEXT,
  "icon" TEXT,
  "contacts" TEXT,
  "tos" TEXT,
  "policy" TEXT,
  "softwareId" TEXT,
  "softwareVersion" TEXT,
  "softwareStatement" TEXT,
  "redirectUris" TEXT NOT NULL,
  "postLogoutRedirectUris" TEXT,
  "tokenEndpointAuthMethod" TEXT,
  "grantTypes" TEXT,
  "responseTypes" TEXT,
  "public" INTEGER,
  "type" TEXT,
  "requirePKCE" INTEGER,
  "referenceId" TEXT,
  "metadata" TEXT
);

CREATE TABLE "oauthRefreshToken" (
  "id" TEXT PRIMARY KEY NOT NULL,
  "token" TEXT NOT NULL UNIQUE,
  "clientId" TEXT NOT NULL
    REFERENCES "oauthClient" ("clientId") ON DELETE CASCADE,
  "sessionId" TEXT
    REFERENCES "session" ("id") ON DELETE SET NULL,
  "userId" TEXT NOT NULL
    REFERENCES "user" ("id") ON DELETE CASCADE,
  "referenceId" TEXT,
  "expiresAt" DATE NOT NULL,
  "createdAt" DATE NOT NULL,
  "revoked" DATE,
  "authTime" DATE,
  "scopes" TEXT NOT NULL
);

CREATE TABLE "oauthAccessToken" (
  "id" TEXT PRIMARY KEY NOT NULL,
  "token" TEXT NOT NULL UNIQUE,
  "clientId" TEXT NOT NULL
    REFERENCES "oauthClient" ("clientId") ON DELETE CASCADE,
  "sessionId" TEXT
    REFERENCES "session" ("id") ON DELETE SET NULL,
  "userId" TEXT
    REFERENCES "user" ("id") ON DELETE CASCADE,
  "referenceId" TEXT,
  "refreshId" TEXT
    REFERENCES "oauthRefreshToken" ("id") ON DELETE CASCADE,
  "expiresAt" DATE NOT NULL,
  "createdAt" DATE NOT NULL,
  "scopes" TEXT NOT NULL
);

CREATE TABLE "oauthConsent" (
  "id" TEXT PRIMARY KEY NOT NULL,
  "clientId" TEXT NOT NULL
    REFERENCES "oauthClient" ("clientId") ON DELETE CASCADE,
  "userId" TEXT
    REFERENCES "user" ("id") ON DELETE CASCADE,
  "referenceId" TEXT,
  "scopes" TEXT NOT NULL,
  "createdAt" DATE NOT NULL,
  "updatedAt" DATE NOT NULL
);

CREATE INDEX "session_userId_idx" ON "session" ("userId");
CREATE INDEX "account_userId_idx" ON "account" ("userId");
CREATE UNIQUE INDEX "account_provider_identity_unique"
  ON "account" ("providerId", "accountId");
CREATE INDEX "verification_identifier_idx"
  ON "verification" ("identifier");
CREATE INDEX "oauthClient_userId_idx" ON "oauthClient" ("userId");
CREATE INDEX "oauthRefreshToken_clientId_idx"
  ON "oauthRefreshToken" ("clientId");
CREATE INDEX "oauthRefreshToken_sessionId_idx"
  ON "oauthRefreshToken" ("sessionId");
CREATE INDEX "oauthRefreshToken_userId_idx"
  ON "oauthRefreshToken" ("userId");
CREATE INDEX "oauthAccessToken_clientId_idx"
  ON "oauthAccessToken" ("clientId");
CREATE INDEX "oauthAccessToken_sessionId_idx"
  ON "oauthAccessToken" ("sessionId");
CREATE INDEX "oauthAccessToken_userId_idx"
  ON "oauthAccessToken" ("userId");
CREATE INDEX "oauthAccessToken_refreshId_idx"
  ON "oauthAccessToken" ("refreshId");
CREATE INDEX "oauthConsent_clientId_idx"
  ON "oauthConsent" ("clientId");
CREATE INDEX "oauthConsent_userId_idx"
  ON "oauthConsent" ("userId");

CREATE UNIQUE INDEX "user_migration_identity_unique"
  ON "user" ("migrationSource", "migrationSubject")
  WHERE "migrationSource" IS NOT NULL AND "migrationSubject" IS NOT NULL;

CREATE TRIGGER "session_absolute_expiry_insert"
BEFORE INSERT ON "session"
WHEN NEW."expiresAt" > NEW."absoluteExpiresAt"
BEGIN
  SELECT RAISE(ABORT, 'session exceeds absolute expiry');
END;

CREATE TRIGGER "session_absolute_expiry_update"
BEFORE UPDATE OF "expiresAt" ON "session"
WHEN NEW."expiresAt" > OLD."absoluteExpiresAt"
BEGIN
  SELECT RAISE(ABORT, 'session exceeds absolute expiry');
END;

CREATE TRIGGER "session_absolute_expiry_immutable"
BEFORE UPDATE OF "absoluteExpiresAt" ON "session"
WHEN NEW."absoluteExpiresAt" != OLD."absoluteExpiresAt"
BEGIN
  SELECT RAISE(ABORT, 'session absolute expiry is immutable');
END;
