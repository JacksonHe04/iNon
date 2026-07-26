import { getInonProjectSso } from "./project-client";

export function handleInonPublicSsoRoute(
  request: Request,
  action: "login" | "logout" | "refresh",
): Response {
  const sso = getInonProjectSso();
  return sso.transition(request, action);
}
