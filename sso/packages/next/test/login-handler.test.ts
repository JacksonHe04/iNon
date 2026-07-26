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

  it("exposes only the public project session shape", async () => {
    const client = createInonSso({
      project: "inon",
      clientId: "inon-client",
      clientSecret: "inon-secret",
      appOrigin: "http://localhost:3000",
      sessionSecret: "s".repeat(32),
      secureCookies: false,
    });

    const response = await client.handler(
      new Request("http://localhost:3000/api/auth/inon/session"),
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ session: null });
    expect(response.headers.get("cache-control")).toBe("no-store");
  });

  it("keeps a branded transition visible before entering OAuth", async () => {
    const client = createInonSso({
      project: "leaf",
      clientId: "leaf-client",
      clientSecret: "leaf-secret",
      appOrigin: "http://localhost:3000",
      sessionSecret: "s".repeat(32),
      secureCookies: false,
    });

    const response = client.transition(
      new Request(
        "http://localhost:3000/sso/start?returnTo=%2Fmine",
      ),
      "login",
    );
    const html = await response.text();

    expect(response.headers.get("content-type")).toContain("text/html");
    expect(response.headers.get("cache-control")).toContain("no-store");
    expect(html).toContain("正在连接 iNon");
    expect(html).toContain("正在安全地将你从 Leaf 送往统一账号服务");
    expect(html).toContain(
      "/api/auth/inon/login?returnTo=%2Fmine",
    );
    expect(html).toContain('role="status"');
  });
});
