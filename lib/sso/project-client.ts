import { createInonSso } from "@inon-ai/inon-sso";

function requiredEnvironmentVariable(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is required for the iNon SSO client.`);
  }
  return value;
}

let client: ReturnType<typeof createInonSso> | undefined;

export function getInonProjectSso() {
  client ??= createInonSso({
    project: "inon",
    clientId: requiredEnvironmentVariable("INON_SSO_CLIENT_ID"),
    clientSecret: requiredEnvironmentVariable("INON_SSO_CLIENT_SECRET"),
    sessionSecret: requiredEnvironmentVariable("INON_SSO_SESSION_SECRET"),
    appOrigin:
      process.env.INON_SSO_PUBLIC_ORIGIN ?? "https://inon.space",
  });

  return client;
}
