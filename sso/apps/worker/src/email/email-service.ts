import type { VerificationOTPMessage } from "../auth/create-auth";

export interface EmailService {
  sendVerificationOTP(message: VerificationOTPMessage): Promise<void>;
}
