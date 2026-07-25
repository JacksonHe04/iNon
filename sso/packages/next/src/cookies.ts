export interface CookieNames {
  session: string;
  transaction: string;
}

export function cookieNames(secure: boolean): CookieNames {
  return secure
    ? {
        session: "__Host-inon_session",
        transaction: "__Host-inon_oauth",
      }
    : {
        session: "inon_session",
        transaction: "inon_oauth",
      };
}

export function readCookie(request: Request, name: string): string | null {
  const header = request.headers.get("cookie");
  if (header === null) {
    return null;
  }

  for (const part of header.split(";")) {
    const separator = part.indexOf("=");
    if (separator === -1) {
      continue;
    }

    const candidate = part.slice(0, separator).trim();
    if (candidate === name) {
      return part.slice(separator + 1).trim();
    }
  }

  return null;
}

export function serializeCookie(
  name: string,
  value: string,
  options: {
    maxAge: number;
    secure: boolean;
  },
): string {
  const attributes = [
    `${name}=${value}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    `Max-Age=${Math.max(0, Math.floor(options.maxAge))}`,
  ];

  if (options.secure) {
    attributes.push("Secure");
  }

  return attributes.join("; ");
}

export function expireCookie(name: string, secure: boolean): string {
  return serializeCookie(name, "", { maxAge: 0, secure });
}
