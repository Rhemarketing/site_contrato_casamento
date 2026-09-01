import { getAppUrl } from "@/config/env";
import { normalizeEmail } from "@/lib/email";
import { hashPassword } from "@/lib/password";
import {
  generatePasswordResetToken,
  getPasswordResetExpiration,
  hashPasswordResetToken,
  validatePasswordResetTokenFormat,
} from "@/lib/password-reset-token";
import type { PasswordResetRepository, PasswordResetTokenState } from "@/repositories/password-reset.repository";
import { passwordResetRequestSchema, passwordResetSubmissionSchema } from "@/validations/auth";
import type { EmailService } from "./email.service";

export const PASSWORD_RESET_PUBLIC_MESSAGE =
  "Se existir uma conta com este e-mail, enviaremos instruções para redefinir sua senha.";

type PasswordResetServiceOptions = {
  now?: () => Date;
  generateToken?: () => string;
  appUrl?: string;
};

export class PasswordResetService {
  private readonly now: () => Date;
  private readonly generateToken: () => string;
  private readonly configuredAppUrl?: string;

  constructor(
    private readonly repository: PasswordResetRepository,
    private readonly emailService: EmailService,
    options: PasswordResetServiceOptions = {},
  ) {
    this.now = options.now ?? (() => new Date());
    this.generateToken = options.generateToken ?? generatePasswordResetToken;
    this.configuredAppUrl = options.appUrl;
  }

  async request(input: unknown) {
    const parsed = passwordResetRequestSchema.parse(input);
    const email = normalizeEmail(parsed.email);
    const user = await this.repository.findUserByEmail(email);
    if (!user) return { message: PASSWORD_RESET_PUBLIC_MESSAGE } as const;

    const token = this.generateToken();
    const now = this.now();
    await this.repository.replacePendingToken({
      userId: user.id,
      tokenHash: hashPasswordResetToken(token),
      expiresAt: getPasswordResetExpiration(now),
      now,
    });
    const appUrl = this.configuredAppUrl ?? getAppUrl();
    try {
      await this.emailService.sendPasswordReset(user.email, `${appUrl}/redefinir-senha/${token}`);
    } catch {
      // The public response remains generic. A later request invalidates this token and retries delivery.
    }
    return { message: PASSWORD_RESET_PUBLIC_MESSAGE } as const;
  }

  async preview(token: string): Promise<PasswordResetTokenState> {
    if (!validatePasswordResetTokenFormat(token)) return "INVALID";
    return this.repository.getTokenState(hashPasswordResetToken(token), this.now());
  }

  async reset(input: unknown) {
    const parsed = passwordResetSubmissionSchema.parse(input);
    const state = await this.preview(parsed.token);
    if (state !== "VALID") return state;
    const passwordHash = await hashPassword(parsed.password);
    return this.repository.consumeToken({
      tokenHash: hashPasswordResetToken(parsed.token),
      passwordHash,
      now: this.now(),
    });
  }
}
