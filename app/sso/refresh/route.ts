import { handleInonPublicSsoRoute } from "@/lib/sso/public-route";

export function GET(request: Request): Promise<Response> {
  return handleInonPublicSsoRoute(request, "refresh");
}
