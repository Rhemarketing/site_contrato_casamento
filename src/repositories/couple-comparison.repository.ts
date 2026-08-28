import type { CoupleComparisonAnswer } from "@/features/couple-comparison/domain/couple-comparison";

export type CoupleComparisonContext = {
  coupleId: string;
  status: "PENDING" | "ACTIVE" | "INACTIVE";
  memberUserIds: string[];
};

export type CompletedComparisonAttempt = {
  userId: string;
  answers: CoupleComparisonAnswer[];
};

export interface CoupleComparisonRepository {
  findCurrentCoupleForUser(userId: string): Promise<CoupleComparisonContext | null>;
  findLatestCompletedAttempt(userId: string, questionnaireVersion: string): Promise<CompletedComparisonAttempt | null>;
  findConsentStatuses(
    coupleId: string,
    questionnaireVersion: string,
  ): Promise<Array<{ userId: string; status: "PENDING" | "CONSENTED" | "REVOKED" }>>;
  consent(coupleId: string, userId: string, questionnaireVersion: string, now: Date): Promise<void>;
  revoke(coupleId: string, userId: string, questionnaireVersion: string, now: Date): Promise<void>;
}
