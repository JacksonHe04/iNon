import { env, SELF } from "cloudflare:test";
import { expect, it } from "vitest";
import { projectKeys } from "@inon/sso-contracts";

it("bootstraps exactly five idempotent first-party OAuth clients", async () => {
  const credentials = projectKeys.map((project) => ({
    project,
    clientId: `${project}_client_id`.padEnd(32, "_"),
    clientSecret: `${project}_client_secret`.padEnd(43, "_"),
  }));
  const request = () =>
    SELF.fetch(
      "https://inon.space/api/sso/internal/oauth-clients/bootstrap",
      {
        method: "POST",
        headers: {
          authorization: "Bearer test-internal-token",
          "content-type": "application/json",
        },
        body: JSON.stringify({ clients: credentials }),
      },
    );

  const firstResponse = await request();
  expect(firstResponse.status).toBe(200);
  expect(firstResponse.headers.get("cache-control")).toBe("no-store");
  const first = await firstResponse.json<{
    clients: Array<{
      project: string;
      clientId: string;
      created: boolean;
    }>;
  }>();
  expect(first.clients.map(({ project }) => project).sort()).toEqual(
    [...projectKeys].sort(),
  );
  expect(first.clients.every(({ created }) => created)).toBe(true);
  expect(first.clients.every(({ clientId }) => Boolean(clientId))).toBe(
    true,
  );

  const stored = await env.DB.prepare(
    `SELECT "clientId", "clientSecret"
     FROM "oauthClient"
     WHERE json_extract("metadata", '$.project')
       IN ('inon', 'leaf', 'pine', 'sayless', 'treez')`,
  ).all<{ clientId: string; clientSecret: string }>();
  expect(stored.results).toHaveLength(5);
  for (const client of first.clients) {
    const row = stored.results.find(
      ({ clientId }) => clientId === client.clientId,
    );
    const credential = credentials.find(
      ({ clientId }) => clientId === client.clientId,
    );
    expect(row?.clientSecret).not.toBe(credential?.clientSecret);
  }

  const secondResponse = await request();
  expect(secondResponse.status).toBe(200);
  const second = await secondResponse.json<typeof first>();
  expect(
    second.clients.map(({ clientId, project, created }) => ({
      clientId,
      project,
      created,
    })),
  ).toEqual(
    first.clients.map(({ clientId, project }) => ({
      clientId,
      project,
      created: false,
    })),
  );
});
