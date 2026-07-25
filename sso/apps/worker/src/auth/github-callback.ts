import { AUTH_BASE_URL } from "./constants";

export interface AuthRequestHandler {
  handler(request: Request): Promise<Response>;
}

export function rewriteGitHubCallbackRequest(request: Request): Request {
  const source = new URL(request.url);
  const target = new URL(`${AUTH_BASE_URL}/callback/github`);
  target.search = source.search;

  return new Request(target, request);
}

export function handleGitHubCallback(
  auth: AuthRequestHandler,
  request: Request,
): Promise<Response> {
  return auth.handler(rewriteGitHubCallbackRequest(request));
}
