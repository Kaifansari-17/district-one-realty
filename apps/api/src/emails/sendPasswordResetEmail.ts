import { logger } from "@/utils/logger";
import { isDevelopment } from "@/config/env";

interface SendPasswordResetEmailInput {
  to: string;
  name: string;
  resetUrl: string;
}

/**
 * No email transport (SMTP/SES/Postmark) is wired up yet — this is the single
 * choke point services call so swapping in a real provider later doesn't touch
 * any calling code. In development the reset link is logged so the flow is
 * testable end-to-end without sending real email.
 */
export async function sendPasswordResetEmail({ to, name, resetUrl }: SendPasswordResetEmailInput): Promise<void> {
  if (isDevelopment) {
    logger.info(`[dev email] Password reset for ${name} <${to}>: ${resetUrl}`);
    return;
  }

  logger.warn(`Email transport not configured — password reset email to ${to} was not sent.`);
}
