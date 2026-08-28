import "server-only";

import { Prisma, type PrismaClient } from "@/generated/prisma/client";
import { ADMISSION_QUESTIONNAIRE_CODE } from "@/config/admission-questionnaire";
import { COUPLE_COMPARISON_QUESTION_CODES } from "@/features/couple-comparison/domain/couple-comparison";
import type { CoupleComparisonRepository } from "../couple-comparison.repository";

export class PrismaCoupleComparisonRepository implements CoupleComparisonRepository {
  constructor(private readonly client: PrismaClient) {}

  async findCurrentCoupleForUser(userId: string) {
    const membership = await this.client.coupleMember.findUnique({
      where: { activeMembershipKey: userId },
      select: {
        couple: {
          select: {
            id: true,
            status: true,
            members: { orderBy: { joinedAt: "asc" }, select: { userId: true } },
          },
        },
      },
    });
    if (!membership) return null;
    return {
      coupleId: membership.couple.id,
      status: membership.couple.status,
      memberUserIds: membership.couple.members.map(({ userId: memberUserId }) => memberUserId),
    };
  }

  async findLatestCompletedAttempt(userId: string, questionnaireVersion: string) {
    const attempt = await this.client.questionnaireAttempt.findFirst({
      where: {
        userId,
        status: "COMPLETED",
        questionnaireVersion,
        questionnaire: { code: ADMISSION_QUESTIONNAIRE_CODE, version: questionnaireVersion },
      },
      orderBy: [{ completedAt: "desc" }, { createdAt: "desc" }],
      select: {
        userId: true,
        answers: {
          where: {
            question: {
              code: { in: COUPLE_COMPARISON_QUESTION_CODES },
              isPrivate: false,
              isScored: true,
            },
          },
          orderBy: { question: { order: "asc" } },
          select: { score: true, question: { select: { code: true, area: true } } },
        },
      },
    });
    if (!attempt) return null;
    return {
      userId: attempt.userId,
      answers: attempt.answers.map(({ question, score }) => ({
        questionCode: question.code,
        area: question.area,
        score: score === null ? Number.NaN : Number(score),
      })),
    };
  }

  findConsentStatuses(coupleId: string, questionnaireVersion: string) {
    return this.client.coupleComparisonConsent.findMany({
      where: { coupleId, questionnaireVersion },
      select: { userId: true, status: true },
    });
  }

  async consent(coupleId: string, userId: string, questionnaireVersion: string, now: Date) {
    const where = { coupleId_userId_questionnaireVersion: { coupleId, userId, questionnaireVersion } };
    try {
      await this.client.coupleComparisonConsent.upsert({
        where,
        create: { coupleId, userId, questionnaireVersion, status: "CONSENTED", consentedAt: now },
        update: { status: "CONSENTED", consentedAt: now, revokedAt: null },
      });
    } catch (error) {
      if (!(error instanceof Prisma.PrismaClientKnownRequestError) || error.code !== "P2002") throw error;
      await this.client.coupleComparisonConsent.update({
        where,
        data: { status: "CONSENTED", consentedAt: now, revokedAt: null },
      });
    }
  }

  async revoke(coupleId: string, userId: string, questionnaireVersion: string, now: Date) {
    const where = { coupleId_userId_questionnaireVersion: { coupleId, userId, questionnaireVersion } };
    try {
      await this.client.coupleComparisonConsent.upsert({
        where,
        create: { coupleId, userId, questionnaireVersion, status: "REVOKED", revokedAt: now },
        update: { status: "REVOKED", revokedAt: now },
      });
    } catch (error) {
      if (!(error instanceof Prisma.PrismaClientKnownRequestError) || error.code !== "P2002") throw error;
      await this.client.coupleComparisonConsent.update({ where, data: { status: "REVOKED", revokedAt: now } });
    }
  }
}
