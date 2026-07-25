import { z } from "zod";

export const projectKeys = [
  "inon",
  "leaf",
  "pine",
  "sayless",
  "treez",
] as const;

export const projectKeySchema = z.enum(projectKeys);

export type ProjectKey = z.infer<typeof projectKeySchema>;
