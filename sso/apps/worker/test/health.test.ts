import { env, SELF } from "cloudflare:test";
import { expect, it } from "vitest";

it("returns a canonical health response", async () => {
  const response = await SELF.fetch("https://inon.space/api/sso/health");

  expect(response.status).toBe(200);
  expect(await response.json()).toEqual({
    status: "ok",
    service: "inon-sso",
    environment: env.ENVIRONMENT,
  });
  expect(response.headers.get("x-request-id")).toMatch(/^req_/);
});
