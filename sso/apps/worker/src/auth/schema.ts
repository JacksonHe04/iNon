import type { DBFieldAttribute } from "better-auth";
import { SESSION_ABSOLUTE_TTL_SECONDS } from "./constants";

export const USER_ADDITIONAL_FIELDS = {
  status: {
    type: ["active", "disabled"],
    required: true,
    input: false,
    defaultValue: "active",
  },
  usernameChangedAt: {
    type: "date",
    required: false,
    input: false,
  },
  migrationSource: {
    type: "string",
    required: false,
    input: false,
    returned: false,
  },
  migrationSubject: {
    type: "string",
    required: false,
    input: false,
    returned: false,
  },
} as const satisfies Record<string, DBFieldAttribute>;

export const SESSION_ADDITIONAL_FIELDS = {
  absoluteExpiresAt: {
    type: "date",
    required: true,
    input: false,
    returned: false,
    defaultValue: () =>
      new Date(Date.now() + SESSION_ABSOLUTE_TTL_SECONDS * 1_000),
  },
  revokedAt: {
    type: "date",
    required: false,
    input: false,
    returned: false,
  },
  revokeReason: {
    type: "string",
    required: false,
    input: false,
    returned: false,
  },
} as const satisfies Record<string, DBFieldAttribute>;
