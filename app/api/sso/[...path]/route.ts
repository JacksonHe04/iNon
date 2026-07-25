import { proxySsoRequest } from "@/lib/sso/backend-proxy";

interface SsoProxyContext {
  params: Promise<{ path: string[] }>;
}

async function handler(
  request: Request,
  context: SsoProxyContext,
): Promise<Response> {
  const { path } = await context.params;
  return proxySsoRequest(request, path);
}

export const GET = handler;
export const HEAD = handler;
export const OPTIONS = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
