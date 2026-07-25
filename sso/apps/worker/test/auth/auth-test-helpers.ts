import { AUTH_BASE_URL, CANONICAL_ORIGIN } from "../../src/auth/constants";

export function authRequest(path: string, body: Record<string, unknown>) {
  return new Request(`${AUTH_BASE_URL}${path}`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      origin: CANONICAL_ORIGIN,
    },
    body: JSON.stringify(body),
  });
}

export function cookieFrom(response: Response): string {
  const setCookie = response.headers.get("set-cookie");
  if (!setCookie) {
    throw new Error("Expected an authentication cookie.");
  }

  return setCookie.split(";", 1)[0]!;
}
