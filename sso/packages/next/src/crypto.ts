import { base64url, EncryptJWT, jwtDecrypt } from "jose";

const textEncoder = new TextEncoder();

export async function deriveEncryptionKey(secret: string): Promise<Uint8Array> {
  if (secret.length < 32) {
    throw new TypeError("iNon SSO sessionSecret must be at least 32 characters.");
  }

  return new Uint8Array(
    await crypto.subtle.digest("SHA-256", textEncoder.encode(secret)),
  );
}

export function randomValue(byteLength = 32): string {
  return base64url.encode(crypto.getRandomValues(new Uint8Array(byteLength)));
}

export async function createPkceChallenge(
  verifier: string,
): Promise<string> {
  return base64url.encode(
    new Uint8Array(
      await crypto.subtle.digest("SHA-256", textEncoder.encode(verifier)),
    ),
  );
}

export async function encryptPayload(
  payload: Record<string, string | number | boolean | null>,
  options: {
    key: Uint8Array;
    type: string;
    issuer: string;
    audience: string;
    expiresAt: number;
  },
): Promise<string> {
  return new EncryptJWT(payload)
    .setProtectedHeader({
      alg: "dir",
      enc: "A256GCM",
      typ: options.type,
    })
    .setIssuedAt()
    .setIssuer(options.issuer)
    .setAudience(options.audience)
    .setExpirationTime(options.expiresAt)
    .encrypt(options.key);
}

export async function decryptPayload(
  token: string,
  options: {
    key: Uint8Array;
    type: string;
    issuer: string;
    audience: string;
  },
) {
  const result = await jwtDecrypt(token, options.key, {
    issuer: options.issuer,
    audience: options.audience,
    keyManagementAlgorithms: ["dir"],
    contentEncryptionAlgorithms: ["A256GCM"],
  });

  if (result.protectedHeader.typ !== options.type) {
    throw new TypeError("Unexpected iNon SSO token type.");
  }

  return result.payload;
}
