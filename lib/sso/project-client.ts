import { createInonSso } from "@inon-ai/inon-sso";
import { inonProjectOrigin } from "./origin";

function requiredEnvironmentVariable(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is required for the iNon SSO client.`);
  }
  return value;
}

let client: ReturnType<typeof createInonSso> | undefined;

export function getInonProjectSso() {
  const appOrigin = inonProjectOrigin();
  client ??= createInonSso({
    project: "inon",
    clientId: requiredEnvironmentVariable("INON_SSO_CLIENT_ID"),
    clientSecret: requiredEnvironmentVariable("INON_SSO_CLIENT_SECRET"),
    sessionSecret: requiredEnvironmentVariable("INON_SSO_SESSION_SECRET"),
    appOrigin,
    secureCookies: appOrigin.startsWith("https://"),
  });

  return client;
}
