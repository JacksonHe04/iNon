import type { ApiErrorCode } from "@inon/sso-contracts";

export class AuthorizationError extends Error {
  readonly code: ApiErrorCode;

  constructor(code: ApiErrorCode, message: string) {
    super(message);
    this.name = "AuthorizationError";
    this.code = code;
  }
}
