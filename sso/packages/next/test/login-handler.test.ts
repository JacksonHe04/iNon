import { describe, expect, it } from "vitest";
import { createInonSso } from "../src/create-inon-sso";

describe("OAuth login handler", () => {
  it("starts an S256 authorization flow and keeps return paths local", async () => {
    const client = createInonSso({
      project: "treez",
      clientId: "treez-client",
      clientSecret: "treez-secret",
      appOrigin: "http://localhost:3000",
      sessionSecret: "s".repeat(32),
      secureCookies: false,
    });

    const response = await client.handler(
      new Request(
        "http://localhost:3000/api/auth/inon/login?returnTo=https://evil.example",
      ),
    );
    const location = new URL(response.headers.get("location") ?? "");

    expect(response.status).toBe(303);
    expect(location.origin).toBe("https://inon.space");
    expect(location.pathname).toBe("/api/sso/auth/oauth2/authorize");
    expect(location.searchParams.get("code_challenge_method")).toBe("S256");
    expect(location.searchParams.get("scope")).toBe(
      "openid profile email offline_access",
    );
    expect(location.searchParams.get("redirect_uri")).toBe(
      "http://localhost:3000/api/auth/inon/callback",
    );
    expect(response.headers.get("set-cookie")).toContain(
      "inon_oauth=",
    );
    expect(response.headers.get("set-cookie")).not.toContain("Secure");
  });
});
