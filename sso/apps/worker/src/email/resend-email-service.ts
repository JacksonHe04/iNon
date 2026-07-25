import { Resend } from "resend";
import type { VerificationOTPMessage } from "../auth/create-auth";
import type { EmailService } from "./email-service";
import { verificationCodeTemplate } from "./templates/verification-code";

export interface ResendMessage {
  from: string;
  to: string;
  subject: string;
  html: string;
  text: string;
}

export interface ResendTransport {
  send(message: ResendMessage): Promise<{
    data: unknown | null;
    error: { message: string } | null;
  }>;
}

export class ResendEmailService implements EmailService {
  constructor(
    private readonly from: string,
    private readonly transport: ResendTransport,
  ) {}

  async sendVerificationOTP(
    message: VerificationOTPMessage,
  ): Promise<void> {
    const template = verificationCodeTemplate(message);
    const result = await this.transport.send({
      from: this.from,
      to: message.email,
      ...template,
    });

    if (result.error) {
      throw new Error(result.error.message);
    }
  }
}

export function createResendEmailService(
  apiKey: string,
  from: string,
): ResendEmailService {
  const resend = new Resend(apiKey);

  return new ResendEmailService(from, {
    send: async (message) => {
      const result = await resend.emails.send(message);
      return {
        data: result.data,
        error: result.error
          ? {
              message: result.error.message,
            }
          : null,
      };
    },
  });
}
