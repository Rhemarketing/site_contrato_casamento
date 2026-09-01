import "server-only";

import type { PrismaClient } from "@/generated/prisma/client";
import type {
  PasswordResetConsumeResult,
  PasswordResetRepository,
  PasswordResetTokenState,
} from "../password-reset.repository";

function prismaErrorCode(error: unknown) {
  return typeof error === "object" && error !== null && "code" in error ? String(error.code) : "";
}

function tokenState(token: { expiresAt: Date; usedAt: Date | null } | null, now: Date): PasswordResetTokenState {
  if (!token) return "INVALID";
  if (token.usedAt) return "USED";
  if (token.expiresAt <= now) return "EXPIRED";
  return "VALID";
}

export class PrismaPasswordResetRepository implements PasswordResetRepository {
  constructor(private readonly client: PrismaClient) {}

  findUserByEmail(email: string) {
    return this.client.user.findUnique({ where: { email }, select: { id: true, email: true } });
  }

  async replacePendingToken(input: { userId: string; tokenHash: string; expiresAt: Date; now: Date }) {
    await this.client.$transaction(async (transaction) => {
      await transaction.passwordResetToken.updateMany({
        where: { userId: input.userId, usedAt: null },
        data: { usedAt: input.now },
      });
      await transaction.passwordResetToken.create({
        data: {
          userId: input.userId,
          tokenHash: input.tokenHash,
          expiresAt: input.expiresAt,
        },
      });
    }, { isolationLevel: "Serializable" });
  }

  async getTokenState(tokenHash: string, now: Date) {
    const token = await this.client.passwordResetToken.findUnique({
      where: { tokenHash },
      select: { expiresAt: true, usedAt: true },
    });
    return tokenState(token, now);
  }

  async consumeToken(input: { tokenHash: string; passwordHash: string; now: Date }): Promise<PasswordResetConsumeResult> {
    for (let attempt = 0; attempt < 3; attempt += 1) {
      try {
        return await this.client.$transaction(async (transaction) => {
          const token = await transaction.passwordResetToken.findUnique({
            where: { tokenHash: input.tokenHash },
            select: { id: true, userId: true, expiresAt: true, usedAt: true },
          });
          const currentState = tokenState(token, input.now);
          if (currentState !== "VALID" || !token) return currentState;

          const claimed = await transaction.passwordResetToken.updateMany({
            where: { id: token.id, usedAt: null, expiresAt: { gt: input.now } },
            data: { usedAt: input.now },
          });
          if (claimed.count !== 1) return "USED";

          await transaction.user.update({
            where: { id: token.userId },
            data: { passwordHash: input.passwordHash },
          });
          await transaction.passwordResetToken.updateMany({
            where: { userId: token.userId, usedAt: null },
            data: { usedAt: input.now },
          });
          return "SUCCESS";
        }, { isolationLevel: "Serializable" });
      } catch (error) {
        if (prismaErrorCode(error) !== "P2034" || attempt === 2) throw error;
      }
    }
    return "USED";
  }
}
