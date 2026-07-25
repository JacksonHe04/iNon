import { env } from "cloudflare:test";
import { expect, it } from "vitest";
import {
  PROJECT_CLAIM,
  PROJECT_ROLE_CLAIM,
  resolveProjectIdentityClaims,
} from "../../src/oauth/claims";

it("creates only an ordinary project membership from immutable client metadata", async () => {
  const claims = await resolveProjectIdentityClaims(
    env.DB,
    { id: "user_first_treez_visit", username: "新用户" },
    { project: "treez" },
  );

  expect(claims).toEqual({
    preferred_username: "新用户",
    [PROJECT_CLAIM]: "treez",
    [PROJECT_ROLE_CLAIM]: "member",
  });

  const membership = await env.DB.prepare(
    `SELECT role
     FROM project_memberships
     WHERE project_id = 'treez' AND user_id = 'user_first_treez_visit'`,
  ).first<{ role: string }>();
  expect(membership?.role).toBe("member");
});
