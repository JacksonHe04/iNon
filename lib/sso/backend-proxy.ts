const HOP_BY_HOP_HEADERS = [
  "connection",
  "host",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade",
] as const;

function requiredServerEnvironment(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`${name} is required for the iNon SSO proxy.`);
  }
  return value;
}

function clientIpFromVercel(request: Request): string | null {
  const value = request.headers.get("x-forwarded-for")?.trim();
  if (!value) {
    return null;
  }

  const clientIp = value.split(",", 1)[0]?.trim() ?? "";
  return clientIp.length > 0 && clientIp.length <= 64
    ? clientIp
    : null;
}

export async function proxySsoRequest(
  request: Request,
  pathSegments: readonly string[],
): Promise<Response> {
  const backendOrigin = new URL(
    requiredServerEnvironment("INON_SSO_BACKEND_URL"),
  );
  const publicOrigin = new URL(
    process.env.INON_SSO_PUBLIC_ORIGIN ?? "https://inon.space",
  );
  if (backendOrigin.protocol !== "https:") {
    throw new Error("INON_SSO_BACKEND_URL must use HTTPS.");
  }

  const incomingUrl = new URL(request.url);
  const upstreamUrl = new URL(
    `/api/sso/${pathSegments.map(encodeURIComponent).join("/")}`,
    backendOrigin,
  );
  upstreamUrl.search = incomingUrl.search;

  const upstreamRequest = new Request(upstreamUrl, request);
  for (const name of HOP_BY_HOP_HEADERS) {
    upstreamRequest.headers.delete(name);
  }
  upstreamRequest.headers.set(
    "x-inon-proxy-secret",
    requiredServerEnvironment("INON_SSO_PROXY_SECRET"),
  );
  upstreamRequest.headers.set("x-forwarded-host", publicOrigin.host);
  upstreamRequest.headers.set(
    "x-forwarded-proto",
    publicOrigin.protocol.slice(0, -1),
  );
  const clientIp = clientIpFromVercel(request);
  if (clientIp) {
    upstreamRequest.headers.set("x-inon-client-ip", clientIp);
  } else {
    upstreamRequest.headers.delete("x-inon-client-ip");
  }

  try {
    const upstreamResponse = await fetch(upstreamRequest, {
      cache: "no-store",
      redirect: "manual",
    });
    const responseHeaders = new Headers(upstreamResponse.headers);
    responseHeaders.delete("content-encoding");
    responseHeaders.delete("content-length");
    responseHeaders.delete("transfer-encoding");

    const hasBody =
      request.method !== "HEAD" &&
      upstreamResponse.status !== 204 &&
      upstreamResponse.status !== 304;
    const body = hasBody
      ? await upstreamResponse.arrayBuffer()
      : null;

    return new Response(body, {
      status: upstreamResponse.status,
      statusText: upstreamResponse.statusText,
      headers: responseHeaders,
    });
  } catch {
    return Response.json(
      {
        error: {
          code: "UPSTREAM_UNAVAILABLE",
          message: "The iNon account service is temporarily unavailable.",
        },
      },
      {
        status: 502,
        headers: { "cache-control": "no-store" },
      },
    );
  }
}
