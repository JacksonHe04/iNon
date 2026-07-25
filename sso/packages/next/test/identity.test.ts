import {
  INON_PROJECT_CLAIM,
  INON_PROJECT_ROLE_CLAIM,
} from "@inon/sso-contracts";
import { describe, expect, it } from "vitest";
import { identityFromClaims } from "../src/identity";

const validClaims = {
  sub: "user_1",
  email: "member@example.com",
  email_verified: true,
  preferred_username: "成员-one",
  [INON_PROJECT_CLAIM]: "treez",
  [INON_PROJECT_ROLE_CLAIM]: "admin",
};

describe("project identity validation", () => {
  it("accepts only an email-verified identity issued for this project", () => {
    expect(identityFromClaims(validClaims, "treez")).toEqual({
      id: "user_1",
      email: "member@example.com",
      emailVerified: true,
      username: "成员-one",
      project: "treez",
      projectRole: "admin",
    });

    expect(() => identityFromClaims(validClaims, "leaf")).toThrow(
      "different project",
    );
    expect(() =>
      identityFromClaims(
        { ...validClaims, email_verified: false },
        "treez",
      ),
    ).toThrow("email-verified");
  });
});
