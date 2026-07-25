import { z } from "zod";

export const apiErrorCodeSchema = z.enum([
  "INVALID_REQUEST",
  "UNAUTHENTICATED",
  "FORBIDDEN",
  "NOT_FOUND",
  "CONFLICT",
  "RATE_LIMITED",
  "INTERNAL_ERROR",
]);

export const apiErrorSchema = z.object({
  error: z.object({
    code: apiErrorCodeSchema,
    message: z.string(),
    requestId: z.string(),
  }),
});

export type ApiError = z.infer<typeof apiErrorSchema>;
export type ApiErrorCode = z.infer<typeof apiErrorCodeSchema>;
