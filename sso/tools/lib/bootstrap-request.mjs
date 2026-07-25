export function createBootstrapHeaders(additionalHeaders = {}) {
  const headers = new Headers(additionalHeaders);
  const internalToken = process.env.INON_SSO_INTERNAL_TOKEN;
  if (!internalToken) {
    throw new Error("INON_SSO_INTERNAL_TOKEN is required.");
  }

  headers.set("authorization", `Bearer ${internalToken}`);

  const proxySecret = process.env.INON_SSO_PROXY_SECRET;
  if (proxySecret) {
    headers.set("x-forwarded-host", "inon.space");
    headers.set("x-forwarded-proto", "https");
    headers.set("x-inon-proxy-secret", proxySecret);
  }

  return headers;
}
