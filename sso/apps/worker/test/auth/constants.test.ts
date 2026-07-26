import { describe, expect, it } from "vitest";
import {
  AUTH_BASE_PATH,
  AUTH_BASE_URL,
  GITHUB_CALLBACK_URL,
  OAUTH_ISSUER,
  PROJECT_CALLBACK_URLS,
  PROJECT_REDIRECT_URIS,
  SESSION_ABSOLUTE_TTL_SECONDS,
  SESSION_SLIDING_TTL_SECONDS,
} from "../../src/auth/constants";

describe("central authentication constants", () => {
  it("uses inon.space as the only public authentication origin", () => {
    expect(AUTH_BASE_PATH).toBe("/api/sso/auth");
    expect(AUTH_BASE_URL).toBe("https://inon.space/api/sso/auth");
    expect(OAUTH_ISSUER).toBe(AUTH_BASE_URL);
    expect(GITHUB_CALLBACK_URL).toBe(
      "https://inon.space/api/sso/github/callback",
    );
  });

  it("fixes the sliding and absolute session limits", () => {
    expect(SESSION_SLIDING_TTL_SECONDS).toBe(30 * 24 * 60 * 60);
    expect(SESSION_ABSOLUTE_TTL_SECONDS).toBe(90 * 24 * 60 * 60);
  });

  it("defines canonical callbacks and exact redirect URI allowlists", () => {
    expect(PROJECT_CALLBACK_URLS).toEqual({
      inon: "https://inon.space/api/auth/inon/callback",
      leaf: "https://leaf.inon.space/api/auth/inon/callback",
      pine: "https://pine.inon.space/api/auth/inon/callback",
      sayless: "https://sayless.inon.space/api/auth/inon/callback",
      treez: "https://treez.inon.space/api/auth/inon/callback",
    });
    expect(PROJECT_REDIRECT_URIS).toEqual({
      inon: ["https://inon.space/api/auth/inon/callback"],
      leaf: ["https://leaf.inon.space/api/auth/inon/callback"],
      pine: ["https://pine.inon.space/api/auth/inon/callback"],
      sayless: [
        "https://sayless.inon.space/api/auth/inon/callback",
        "http://localhost:3000/api/auth/inon/callback",
      ],
      treez: ["https://treez.inon.space/api/auth/inon/callback"],
    });
  });
});
