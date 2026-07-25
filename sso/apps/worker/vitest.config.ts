import path from "node:path";
import {
  cloudflareTest,
  readD1Migrations,
} from "@cloudflare/vitest-pool-workers";
import { defineConfig } from "vitest/config";

export default defineConfig(async () => {
  const migrations = await readD1Migrations(
    path.join(__dirname, "migrations"),
  );

  return {
    plugins: [
      cloudflareTest({
        wrangler: { configPath: "./wrangler.jsonc" },
        miniflare: {
          d1Databases: ["DB"],
          bindings: {
            ENVIRONMENT: "development",
            CANONICAL_ORIGIN: "https://inon.space",
            BETTER_AUTH_SECRET:
              "test-only-better-auth-secret-at-least-thirty-two-characters",
            GITHUB_CLIENT_ID: "test-github-client-id",
            GITHUB_CLIENT_SECRET: "test-github-client-secret",
            INTERNAL_API_TOKEN: "test-internal-token",
            RESEND_API_KEY: "test-resend-api-key",
            RESEND_FROM: "iNon <account@inon.space>",
            TURNSTILE_HOSTNAMES: "inon.space",
            TURNSTILE_SECRET_KEY: "test-turnstile-secret-key",
            VERCEL_PROXY_SECRET: "test-vercel-proxy-secret",
            TEST_MIGRATIONS: migrations,
          },
        },
      }),
    ],
    test: {
      setupFiles: ["./test/apply-migrations.ts"],
    },
  };
});
