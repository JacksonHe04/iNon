import { describe, expect, it } from "vitest";
import {
  decryptPayload,
  deriveEncryptionKey,
  encryptPayload,
} from "../src/crypto";

describe("encrypted project state", () => {
  it("binds the payload to its issuer, audience, type, and expiry", async () => {
    const key = await deriveEncryptionKey("s".repeat(32));
    const expiresAt = Math.floor(Date.now() / 1000) + 60;
    const token = await encryptPayload(
      { state: "expected" },
      {
        key,
        type: "test+jwt",
        issuer: "https://treez.inon.space",
        audience: "treez-client",
        expiresAt,
      },
    );

    await expect(
      decryptPayload(token, {
        key,
        type: "test+jwt",
        issuer: "https://treez.inon.space",
        audience: "treez-client",
      }),
    ).resolves.toMatchObject({ state: "expected" });

    await expect(
      decryptPayload(token, {
        key,
        type: "test+jwt",
        issuer: "https://treez.inon.space",
        audience: "another-client",
      }),
    ).rejects.toThrow();
  });
});
