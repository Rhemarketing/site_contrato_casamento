import "server-only";

import { SMTPClient } from "emailjs";
import { getSmtpConfig } from "@/config/env";
import { coupleInviteEmailTemplate, passwordResetEmailTemplate } from "./email/email.templates";

export type EmailMessage = {
  to: string;
  subject: string;
  text: string;
  html: string;
};

export interface EmailTransport {
  send(message: EmailMessage): Promise<void>;
}

export class EmailDeliveryError extends Error {
  constructor() {
    super("EMAIL_DELIVERY_FAILED");
    this.name = "EmailDeliveryError";
  }
}

export class SmtpEmailTransport implements EmailTransport {
  async send(message: EmailMessage) {
    const config = getSmtpConfig();
    const client = new SMTPClient({
      host: config.host,
      port: config.port,
      user: config.user,
      password: config.password,
      ssl: config.port === 465,
      tls: config.port !== 465,
      timeout: 15_000,
    });
    try {
      await client.sendAsync({
        from: config.from,
        to: message.to,
        subject: message.subject,
        text: message.text,
        attachment: [{ data: message.html, alternative: true, type: "text/html" }],
      });
    } catch {
      throw new EmailDeliveryError();
    } finally {
      client.smtp.close();
    }
  }
}

export class EmailService {
  constructor(private readonly transport: EmailTransport) {}

  sendPasswordReset(to: string, resetUrl: string) {
    return this.transport.send({ to, ...passwordResetEmailTemplate(resetUrl) });
  }

  sendCoupleInvite(to: string, creatorName: string, inviteUrl: string) {
    return this.transport.send({ to, ...coupleInviteEmailTemplate({ creatorName, inviteUrl }) });
  }
}

export function createEmailService() {
  return new EmailService(new SmtpEmailTransport());
}
