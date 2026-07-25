import { chmod, mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectKeys = ["inon", "leaf", "pine", "sayless", "treez"];
const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const workspaceDirectory = path.resolve(scriptDirectory, "..");
const secretsDirectory = path.join(workspaceDirectory, ".secrets");
const outputPath = path.join(secretsDirectory, "oauth-clients.json");
const endpoint = new URL(
  "/api/sso/internal/oauth-clients/bootstrap",
  process.env.INON_SSO_WORKER_URL ?? "https://inon.space",
);
const internalToken = process.env.INON_SSO_INTERNAL_TOKEN;

if (!internalToken) {
  throw new Error("INON_SSO_INTERNAL_TOKEN is required.");
}

let existing = { clients: {} };
try {
  existing = JSON.parse(await readFile(outputPath, "utf8"));
} catch (error) {
  if (error?.code !== "ENOENT") {
    throw error;
  }
}

const response = await fetch(endpoint, {
  method: "POST",
  headers: {
    authorization: `Bearer ${internalToken}`,
  },
});
if (!response.ok) {
  throw new Error(
    `OAuth client bootstrap failed with HTTP ${response.status}.`,
  );
}

const payload = await response.json();
if (
  !Array.isArray(payload.clients) ||
  payload.clients.length !== projectKeys.length
) {
  throw new Error("OAuth client bootstrap returned an incomplete registry.");
}

const clients = {};
for (const project of projectKeys) {
  const current = payload.clients.find((client) => client.project === project);
  const previous = existing.clients?.[project];
  if (!current?.clientId) {
    throw new Error(`OAuth client ${project} is missing its client ID.`);
  }
  if (previous?.clientId && previous.clientId !== current.clientId) {
    throw new Error(`OAuth client ${project} changed its client ID.`);
  }

  const clientSecret = current.clientSecret ?? previous?.clientSecret;
  if (!clientSecret) {
    throw new Error(
      `OAuth client ${project} already exists but its local secret is unavailable.`,
    );
  }
  clients[project] = {
    clientId: current.clientId,
    clientSecret,
  };
}

await mkdir(secretsDirectory, { recursive: true, mode: 0o700 });
await chmod(secretsDirectory, 0o700);
const temporaryPath = `${outputPath}.${process.pid}.tmp`;
await writeFile(
  temporaryPath,
  `${JSON.stringify(
    {
      issuer: "https://inon.space/api/sso/auth",
      clients,
    },
    null,
    2,
  )}\n`,
  { mode: 0o600 },
);
await rename(temporaryPath, outputPath);
await chmod(outputPath, 0o600);

const createdCount = payload.clients.filter(({ created }) => created).length;
console.log(
  `Stored ${projectKeys.length} OAuth clients (${createdCount} newly created) in ${outputPath}.`,
);
