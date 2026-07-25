import type { ApiError, ApiErrorCode } from "@inon/sso-contracts";

export function createApiError(
  code: ApiErrorCode,
  message: string,
  requestId: string,
): ApiError {
  return {
    error: {
      code,
      message,
      requestId,
    },
  };
}
