import { SELF } from "cloudflare:test";
import { expect, it } from "vitest";

it("does not expose project diagnostics without the internal token", async () => {
  const response = await SELF.fetch(
    "https://inon.space/api/sso/internal/projects",
  );

  expect(response.status).toBe(401);
  expect(await response.json()).toMatchObject({
    error: { code: "UNAUTHENTICATED" },
  });
});

it("rejects an incorrect internal token", async () => {
  const response = await SELF.fetch(
    "https://inon.space/api/sso/internal/projects",
    {
      headers: { authorization: "Bearer incorrect-token" },
    },
  );

  expect(response.status).toBe(401);
  expect(await response.json()).toMatchObject({
    error: { code: "UNAUTHENTICATED" },
  });
});

it("returns the seeded project registry to an internal caller", async () => {
  const response = await SELF.fetch(
    "https://inon.space/api/sso/internal/projects",
    {
      headers: { authorization: "Bearer test-internal-token" },
    },
  );

  expect(response.status).toBe(200);
  expect(await response.json()).toEqual({
    projects: [
      { key: "inon", name: "iNon", status: "active" },
      { key: "leaf", name: "Leaf", status: "active" },
      { key: "pine", name: "PINE", status: "active" },
      { key: "sayless", name: "SAYLESS", status: "active" },
      { key: "treez", name: "Treez", status: "active" },
    ],
  });
});
