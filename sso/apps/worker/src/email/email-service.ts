import type { VerificationOTPMessage } from "../auth/create-auth";
import type { SecurityNotificationEvent } from "./templates/security-notification";

export interface SecurityNotificationMessage {
  email: string;
  event: SecurityNotificationEvent;
}

export interface EmailService {
  sendVerificationOTP(message: VerificationOTPMessage): Promise<void>;
  sendSecurityNotification(
    message: SecurityNotificationMessage,
  ): Promise<void>;
}
