import { SELF } from "cloudflare:test";
import { expect, it } from "vitest";

it("does not accept a stateful request on the internal origin", async () => {
  const response = await SELF.fetch("https://inon-sso.internal/api/sso/session", {
    method: "POST",
  });

  expect(response.status).toBe(421);
  expect(await response.json()).toMatchObject({
    error: { code: "INVALID_REQUEST" },
  });
});
