import {
  inonOAuthScopes,
  type ProjectKey,
} from "@inon/sso-contracts";
import type { CentralAuth } from "../auth/account-routes";
import {
  FIRST_PARTY_CLIENTS,
  parseFirstPartyClientProject,
} from "./client-registry";

const CLIENT_SCOPES = inonOAuthScopes;
const CLIENT_GRANT_TYPES = [
  "authorization_code",
  "refresh_token",
] as const;

interface StoredOAuthClient {
  clientId: string;
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
  clientSecret?: string;
  created: boolean;
}

export class OAuthClientBootstrapError extends Error {
  constructor(
    readonly project: ProjectKey,
    message: string,
  ) {
    super(message);
    this.name = "OAuthClientBootstrapError";
  }
}

interface AdminCreateOAuthClientResult {
  client_id: string;
  client_secret?: string;
}

type AdminCreateOAuthClient = (input: {
  body: {
    client_name: string;
    client_uri: string;
    redirect_uris: string[];
    scope: string;
    token_endpoint_auth_method: "client_secret_basic";
    grant_types: Array<"authorization_code" | "refresh_token">;
    response_types: ["code"];
    type: "web";
    skip_consent: true;
    enable_end_session: true;
    require_pkce: true;
    subject_type: "public";
    metadata: { project: ProjectKey };
  };
}) => Promise<AdminCreateOAuthClientResult>;

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

function assertStoredClientConfiguration(
  row: StoredOAuthClient,
  definition: (typeof FIRST_PARTY_CLIENTS)[number],
) {
  const project = parseFirstPartyClientProject(
    row.metadata === null ? null : JSON.parse(row.metadata),
  );
  const valid =
    project === definition.project &&
    row.name === definition.name &&
    haveSameValues(
      parseStoredStringArray(row.redirectUris),
      [definition.redirectUri],
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
  auth: CentralAuth,
): Promise<BootstrappedOAuthClient[]> {
  const storedClients = await readStoredClients(db);
  const result: BootstrappedOAuthClient[] = [];
  // Better Auth 1.6.25's generated endpoint type intersects Response.type
  // with OAuthClient.type and collapses to never. Runtime data is the
  // documented OAuth client response, so keep the workaround at this boundary.
  const adminCreateOAuthClient =
    auth.api.adminCreateOAuthClient as unknown as AdminCreateOAuthClient;

  for (const definition of FIRST_PARTY_CLIENTS) {
    const existing = storedClients.get(definition.project);
    if (existing) {
      assertStoredClientConfiguration(existing, definition);
      result.push({
        project: definition.project,
        clientId: existing.clientId,
        created: false,
      });
      continue;
    }

    const created = await adminCreateOAuthClient({
      body: {
        client_name: definition.name,
        client_uri: new URL(definition.redirectUri).origin,
        redirect_uris: [definition.redirectUri],
        scope: CLIENT_SCOPES.join(" "),
        token_endpoint_auth_method: "client_secret_basic",
        grant_types: [...CLIENT_GRANT_TYPES],
        response_types: ["code"],
        type: "web",
        skip_consent: true,
        enable_end_session: true,
        require_pkce: true,
        subject_type: "public",
        metadata: { project: definition.project },
      },
    });
    if (!created.client_secret) {
      throw new OAuthClientBootstrapError(
        definition.project,
        `Better Auth did not issue a secret for ${definition.name}.`,
      );
    }

    result.push({
      project: definition.project,
      clientId: created.client_id,
      clientSecret: created.client_secret,
      created: true,
    });
  }

  return result;
}
