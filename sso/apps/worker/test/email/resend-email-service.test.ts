import { describe, expect, it, vi } from "vitest";
import { ResendEmailService } from "../../src/email/resend-email-service";

describe("ResendEmailService", () => {
  it("uses the iNon sender and surfaces delivery failures", async () => {
    const send = vi
      .fn()
      .mockResolvedValueOnce({ data: { id: "email_1" }, error: null })
      .mockResolvedValueOnce({
        data: null,
        error: { message: "rejected by provider" },
      });
    const service = new ResendEmailService(
      "iNon <account@inon.space>",
      { send },
    );

    await service.sendVerificationOTP({
      email: "member@example.com",
      otp: "123456",
      type: "sign-in",
    });

    expect(send).toHaveBeenCalledWith(
      expect.objectContaining({
        from: "iNon <account@inon.space>",
        to: "member@example.com",
        subject: expect.stringContaining("iNon"),
        html: expect.not.stringContaining("<script"),
        text: expect.stringContaining("123456"),
      }),
    );

    await expect(
      service.sendVerificationOTP({
        email: "member@example.com",
        otp: "654321",
        type: "sign-in",
      }),
    ).rejects.toThrow("rejected by provider");
  });
});
