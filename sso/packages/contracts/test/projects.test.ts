import { expect, it } from "vitest";

import { projectKeySchema, projectKeys } from "../src/index";

it("contains exactly the five SSO projects", () => {
  expect(projectKeys).toEqual(["inon", "leaf", "pine", "sayless", "treez"]);
  expect(projectKeySchema.safeParse("palm").success).toBe(false);
});
