import { getInonProjectSso } from "./project-client";

export function handleInonPublicSsoRoute(
  request: Request,
  action: "login" | "logout" | "refresh",
): Promise<Response> {
  const sso = getInonProjectSso();
  const url = new URL(request.url);
  url.pathname = `${sso.basePath}/${action}`;
  return sso.handler(new Request(url, request));
}
