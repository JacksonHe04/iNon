import { chmod, mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { randomBytes } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createBootstrapHeaders } from "./lib/bootstrap-request.mjs";

const projectKeys = ["inon", "leaf", "pine", "sayless", "treez"];
const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const workspaceDirectory = path.resolve(scriptDirectory, "..");
const secretsDirectory = path.join(workspaceDirectory, ".secrets");
const outputPath = path.join(secretsDirectory, "oauth-clients.json");
const endpoint = new URL(
  "/api/sso/internal/oauth-clients/bootstrap",
  process.env.INON_SSO_WORKER_URL ?? "https://inon.space",
);
let existing = { clients: {} };
try {
  existing = JSON.parse(await readFile(outputPath, "utf8"));
} catch (error) {
  if (error?.code !== "ENOENT") {
    throw error;
  }
}

function generateCredential(bytes) {
  return randomBytes(bytes).toString("base64url");
}

const clients = {};
for (const project of projectKeys) {
  const previous = existing.clients?.[project];
  clients[project] = {
    clientId: previous?.clientId ?? generateCredential(32),
    clientSecret: previous?.clientSecret ?? generateCredential(48),
  };
}

async function storeRegistry() {
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
}

// Persist candidates before the request so a committed D1 write can always be
// retried with the same client IDs and secrets after a network interruption.
await storeRegistry();

const response = await fetch(endpoint, {
  method: "POST",
  headers: createBootstrapHeaders({
    "content-type": "application/json",
  }),
  body: JSON.stringify({
    clients: projectKeys.map((project) => ({
      project,
      ...clients[project],
    })),
  }),
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

for (const project of projectKeys) {
  const current = payload.clients.find((client) => client.project === project);
  if (!current?.clientId) {
    throw new Error(`OAuth client ${project} is missing its client ID.`);
  }
  if (clients[project].clientId !== current.clientId) {
    throw new Error(`OAuth client ${project} changed its client ID.`);
  }
}

await storeRegistry();

const createdCount = payload.clients.filter(({ created }) => created).length;
console.log(
  `Stored ${projectKeys.length} OAuth clients (${createdCount} newly created) in ${outputPath}.`,
);
