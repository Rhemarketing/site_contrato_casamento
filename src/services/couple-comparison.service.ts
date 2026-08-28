import { ADMISSION_QUESTIONNAIRE_VERSION } from "@/config/admission-questionnaire";
import { calculateCoupleComparison } from "@/features/couple-comparison/domain/couple-comparison";
import type { CoupleComparisonRepository } from "@/repositories/couple-comparison.repository";
import type { CoupleComparisonPageDto } from "@/types/couple-comparison";
import { CoupleComparisonDomainError } from "./couple-comparison.errors";

export class CoupleComparisonService {
  constructor(private readonly repository: CoupleComparisonRepository) {}

  private async requireActiveContext(userId: string) {
    const context = await this.repository.findCurrentCoupleForUser(userId);
    if (!context || context.status !== "ACTIVE" || !context.memberUserIds.includes(userId)) {
      throw new CoupleComparisonDomainError("COMPARISON_COUPLE_NOT_ACTIVE");
    }
    if (context.memberUserIds.length !== 2 || new Set(context.memberUserIds).size !== 2) {
      throw new CoupleComparisonDomainError("COMPARISON_CONFIGURATION_ERROR");
    }
    return context;
  }

  async consent(userId: string) {
    const context = await this.requireActiveContext(userId);
    const attempt = await this.repository.findLatestCompletedAttempt(userId, ADMISSION_QUESTIONNAIRE_VERSION);
    if (!attempt) throw new CoupleComparisonDomainError("COMPARISON_ADMISSION_NOT_COMPLETED");
    await this.repository.consent(context.coupleId, userId, ADMISSION_QUESTIONNAIRE_VERSION, new Date());
  }

  async revoke(userId: string) {
    const context = await this.requireActiveContext(userId);
    await this.repository.revoke(context.coupleId, userId, ADMISSION_QUESTIONNAIRE_VERSION, new Date());
  }

  async getForUser(userId: string): Promise<CoupleComparisonPageDto> {
    const context = await this.repository.findCurrentCoupleForUser(userId);
    if (!context || context.status !== "ACTIVE") return { state: "PARTNER_NOT_CONNECTED" };
    if (
      !context.memberUserIds.includes(userId) ||
      context.memberUserIds.length !== 2 ||
      new Set(context.memberUserIds).size !== 2
    ) {
      throw new CoupleComparisonDomainError("COMPARISON_CONFIGURATION_ERROR");
    }

    const partnerUserId = context.memberUserIds.find((memberUserId) => memberUserId !== userId)!;
    const [ownAttempt, partnerAttempt] = await Promise.all([
      this.repository.findLatestCompletedAttempt(userId, ADMISSION_QUESTIONNAIRE_VERSION),
      this.repository.findLatestCompletedAttempt(partnerUserId, ADMISSION_QUESTIONNAIRE_VERSION),
    ]);
    if (!ownAttempt || !partnerAttempt) return { state: "WAITING_COMPLETION" };

    const consents = await this.repository.findConsentStatuses(
      context.coupleId,
      ADMISSION_QUESTIONNAIRE_VERSION,
    );
    const ownConsent = consents.find(({ userId: consentUserId }) => consentUserId === userId);
    const partnerConsent = consents.find(({ userId: consentUserId }) => consentUserId === partnerUserId);
    if (ownConsent?.status !== "CONSENTED") return { state: "WAITING_OWN_CONSENT" };
    if (partnerConsent?.status !== "CONSENTED") return { state: "WAITING_PARTNER_CONSENT", canRevoke: true };

    return {
      state: "AVAILABLE",
      canRevoke: true,
      comparison: calculateCoupleComparison(
        ownAttempt.answers,
        partnerAttempt.answers,
        ADMISSION_QUESTIONNAIRE_VERSION,
      ),
    };
  }
}
