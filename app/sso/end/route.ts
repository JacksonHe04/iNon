import { handleInonPublicSsoRoute } from "@/lib/sso/public-route";

export function GET(request: Request): Response {
  return handleInonPublicSsoRoute(request, "logout");
}
