import { describe, expect, it } from "vitest";

import { normalizeUsername, validateUsername } from "../src/index";

describe("username contract", () => {
  it("normalizes width and English case", () => {
    expect(normalizeUsername("Ａlice-树_01")).toBe("alice-树_01");
  });

  it.each(["Alice", "树_01", "iNon-user"])("accepts %s", (value) => {
    expect(validateUsername(value).success).toBe(true);
  });

  it.each(["has space", "dot.name", "emoji😀", ""])(
    "rejects %s",
    (value) => {
      expect(validateUsername(value).success).toBe(false);
    },
  );
});
