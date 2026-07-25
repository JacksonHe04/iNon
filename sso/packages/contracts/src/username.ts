import { z } from "zod";

const usernamePattern = /^[\p{Script=Han}A-Za-z0-9_-]+$/u;

export const usernameSchema = z
  .string()
  .min(1)
  .max(30)
  .regex(usernamePattern);

export function normalizeUsername(value: string): string {
  return value.trim().normalize("NFKC").toLocaleLowerCase("en-US");
}

export function validateUsername(value: string) {
  return usernameSchema.safeParse(value);
}
