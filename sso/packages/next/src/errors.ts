export type InonSsoErrorCode =
  | "UNAUTHENTICATED"
  | "REFRESH_REQUIRED"
  | "FORBIDDEN"
  | "OAUTH_ERROR";

export class InonSsoError extends Error {
  constructor(
    readonly code: InonSsoErrorCode,
    message: string,
    options?: ErrorOptions,
  ) {
    super(message, options);
    this.name = "InonSsoError";
  }
}
