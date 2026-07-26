import {
  inonOAuthScopes,
  projectKeySchema,
  type ProjectKey,
  projectKeys,
} from "@inon/sso-contracts";
import { z } from "zod";
import {
  FIRST_PARTY_CLIENTS,
  parseFirstPartyClientProject,
  serializeFirstPartyClientMetadata,
} from "./client-registry";

const CLIENT_SCOPES = inonOAuthScopes;
const CLIENT_GRANT_TYPES = [
  "authorization_code",
  "refresh_token",
] as const;

interface StoredOAuthClient {
  clientId: string;
  clientSecret: string | null;
  name: string | null;
  redirectUris: string;
  scopes: string | null;
  tokenEndpointAuthMethod: string | null;
  grantTypes: string | null;
  responseTypes: string | null;
  type: string | null;
  skipConsent: number | null;
  enableEndSession: number | null;
  requirePKCE: number | null;
  metadata: string | null;
}

export interface BootstrappedOAuthClient {
  project: ProjectKey;
  clientId: string;
  created: boolean;
}

const firstPartyOAuthClientCredentialSchema = z.object({
  project: projectKeySchema,
  clientId: z.string().regex(/^[A-Za-z0-9_-]{32,128}$/),
  clientSecret: z.string().regex(/^[A-Za-z0-9_-]{43,128}$/),
});

export const firstPartyOAuthClientBootstrapSchema = z
  .object({
    clients: z
      .array(firstPartyOAuthClientCredentialSchema)
      .length(projectKeys.length),
  })
  .superRefine(({ clients }, context) => {
    const suppliedProjects = new Set(
      clients.map(({ project }) => project),
    );
    if (
      suppliedProjects.size !== projectKeys.length ||
      projectKeys.some((project) => !suppliedProjects.has(project))
    ) {
      context.addIssue({
        code: "custom",
        message: "Exactly one credential per first-party project is required.",
        path: ["clients"],
      });
    }
  });

export type FirstPartyOAuthClientCredential = z.infer<
  typeof firstPartyOAuthClientCredentialSchema
>;

export class OAuthClientBootstrapError extends Error {
  constructor(
    readonly project: ProjectKey,
    message: string,
  ) {
    super(message);
    this.name = "OAuthClientBootstrapError";
  }
}

function parseStoredStringArray(value: string | null): string[] {
  if (value === null) {
    return [];
  }

  const parsed: unknown = JSON.parse(value);
  if (
    !Array.isArray(parsed) ||
    parsed.some((entry) => typeof entry !== "string")
  ) {
    throw new Error("Stored OAuth client array is malformed.");
  }
  return parsed;
}

function haveSameValues(actual: string[], expected: readonly string[]) {
  return (
    actual.length === expected.length &&
    expected.every((value) => actual.includes(value))
  );
}

function encodeBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary)
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replace(/=+$/u, "");
}

async function hashClientSecret(clientSecret: string): Promise<string> {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(clientSecret),
  );
  return encodeBase64Url(new Uint8Array(digest));
}

async function assertStoredClientConfiguration(
  row: StoredOAuthClient,
  definition: (typeof FIRST_PARTY_CLIENTS)[number],
  credential: FirstPartyOAuthClientCredential,
) {
  const project = parseFirstPartyClientProject(
    row.metadata === null ? null : JSON.parse(row.metadata),
  );
  const expectedSecret = await hashClientSecret(
    credential.clientSecret,
  );
  const valid =
    project === definition.project &&
    row.clientId === credential.clientId &&
    row.clientSecret === expectedSecret &&
    row.name === definition.name &&
    haveSameValues(
      parseStoredStringArray(row.redirectUris),
      definition.redirectUris,
    ) &&
    haveSameValues(parseStoredStringArray(row.scopes), CLIENT_SCOPES) &&
    row.tokenEndpointAuthMethod === "client_secret_basic" &&
    haveSameValues(
      parseStoredStringArray(row.grantTypes),
      CLIENT_GRANT_TYPES,
    ) &&
    haveSameValues(parseStoredStringArray(row.responseTypes), ["code"]) &&
    row.type === "web" &&
    row.skipConsent === 1 &&
    row.enableEndSession === 1 &&
    row.requirePKCE === 1;

  if (!valid) {
    throw new OAuthClientBootstrapError(
      definition.project,
      `Stored OAuth client configuration for ${definition.name} has drifted.`,
    );
  }
}

async function readStoredClients(
  db: D1Database,
): Promise<Map<ProjectKey, StoredOAuthClient>> {
  const rows = await db
    .prepare(
      `SELECT
        "clientId",
        "clientSecret",
        "name",
        "redirectUris",
        "scopes",
        "tokenEndpointAuthMethod",
        "grantTypes",
        "responseTypes",
        "type",
        "skipConsent",
        "enableEndSession",
        "requirePKCE",
        "metadata"
       FROM "oauthClient"
       WHERE json_extract("metadata", '$.project')
         IN ('inon', 'leaf', 'pine', 'sayless', 'treez')`,
    )
    .all<StoredOAuthClient>();

  return new Map(
    rows.results.map((row) => [
      parseFirstPartyClientProject(
        row.metadata === null ? null : JSON.parse(row.metadata),
      ),
      row,
    ]),
  );
}

export async function bootstrapFirstPartyOAuthClients(
  db: D1Database,
  credentials: FirstPartyOAuthClientCredential[],
): Promise<BootstrappedOAuthClient[]> {
  const storedClients = await readStoredClients(db);
  const credentialByProject = new Map(
    credentials.map((credential) => [
      credential.project,
      credential,
    ]),
  );
  const missing: Array<{
    credential: FirstPartyOAuthClientCredential;
    definition: (typeof FIRST_PARTY_CLIENTS)[number];
  }> = [];

  for (const definition of FIRST_PARTY_CLIENTS) {
    const credential = credentialByProject.get(definition.project);
    if (!credential) {
      throw new OAuthClientBootstrapError(
        definition.project,
        `OAuth client credentials for ${definition.name} are missing.`,
      );
    }
    const existing = storedClients.get(definition.project);
    if (existing) {
      await assertStoredClientConfiguration(
        existing,
        definition,
        credential,
      );
      continue;
    }

    missing.push({
      credential,
      definition,
    });
  }

  if (missing.length > 0) {
    const now = new Date().toISOString();
    const statements = await Promise.all(
      missing.map(async ({ credential, definition }) =>
        db
          .prepare(
            `INSERT INTO "oauthClient" (
              "id",
              "clientId",
              "clientSecret",
              "disabled",
              "skipConsent",
              "enableEndSession",
              "subjectType",
              "scopes",
              "createdAt",
              "updatedAt",
              "name",
              "uri",
              "redirectUris",
              "tokenEndpointAuthMethod",
              "grantTypes",
              "responseTypes",
              "public",
              "type",
              "requirePKCE",
              "metadata"
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          )
          .bind(
            crypto.randomUUID(),
            credential.clientId,
            await hashClientSecret(credential.clientSecret),
            0,
            1,
            1,
            "public",
            JSON.stringify(CLIENT_SCOPES),
            now,
            now,
            definition.name,
            new URL(definition.redirectUris[0]).origin,
            JSON.stringify(definition.redirectUris),
            "client_secret_basic",
            JSON.stringify(CLIENT_GRANT_TYPES),
            JSON.stringify(["code"]),
            0,
            "web",
            1,
            serializeFirstPartyClientMetadata(definition.project),
          ),
      ),
    );
    await db.batch(statements);
  }

  const createdProjects = new Set(
    missing.map(({ definition }) => definition.project),
  );
  return FIRST_PARTY_CLIENTS.map((definition) => ({
    project: definition.project,
    clientId: credentialByProject.get(definition.project)!.clientId,
    created: createdProjects.has(definition.project),
  }));
}
