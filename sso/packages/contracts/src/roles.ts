import { z } from "zod";

export const projectRoleSchema = z.enum(["member", "admin"]);

export type ProjectRole = z.infer<typeof projectRoleSchema>;

export const globalRoleSchema = z.literal("super_admin");

export type GlobalRole = z.infer<typeof globalRoleSchema>;
