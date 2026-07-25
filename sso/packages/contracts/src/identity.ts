import { z } from "zod";

import { projectKeySchema } from "./projects";
import { projectRoleSchema } from "./roles";

export const inonIdentityClaimsSchema = z.object({
  sub: z.string().min(1),
  email: z.string().email(),
  emailVerified: z.boolean(),
  username: z.string().nullable(),
  project: projectKeySchema,
  projectRole: projectRoleSchema,
});

export type InonIdentityClaims = z.infer<typeof inonIdentityClaimsSchema>;
