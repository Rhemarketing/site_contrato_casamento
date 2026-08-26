import type { PrismaClient } from "@/generated/prisma/client";
import { ADMISSION_QUESTIONNAIRE_CODE, ADMISSION_QUESTIONNAIRE_VERSION } from "@/config/admission-questionnaire";
import { buildAdmissionIndividualReportDto } from "@/features/admission/report/admission-report";
import type { AdmissionIndividualReportState } from "@/types/admission-report";
import { AdmissionResultService } from "./admission-result.service";
import { AdmissionSafetyService } from "./admission-safety.service";

export class AdmissionReportAccessError extends Error {
  readonly code = "REPORT_FORBIDDEN";

  constructor() {
    super("REPORT_FORBIDDEN");
    this.name = "AdmissionReportAccessError";
  }
}

export class AdmissionIndividualReportService {
  constructor(private readonly client: PrismaClient) {}

  async getForUser(userId: string, attemptId?: string): Promise<AdmissionIndividualReportState> {
    const attempt = await this.client.questionnaireAttempt.findFirst({
      where: {
        ...(attemptId ? { id: attemptId } : {}),
        userId,
        questionnaire: { code: ADMISSION_QUESTIONNAIRE_CODE, version: ADMISSION_QUESTIONNAIRE_VERSION },
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        status: true,
        completedAt: true,
        totalScore: true,
        questionnaireVersion: true,
        _count: { select: { answers: true } },
      },
    });
    if (!attempt) {
      if (attemptId) throw new AdmissionReportAccessError();
      return { kind: "NOT_STARTED" };
    }
    if (attempt.status !== "COMPLETED") return { kind: "IN_PROGRESS", answerCount: attempt._count.answers };
    if (attempt.totalScore === null || attempt.completedAt === null) return { kind: "RESULT_PENDING" };

    const [result, safety] = await Promise.all([
      new AdmissionResultService(this.client).getAdmissionResultForUser(userId, attempt.id),
      new AdmissionSafetyService(this.client).getPrivateSafetyResultForUser(userId, attempt.id),
    ]);
    return {
      kind: "READY",
      report: buildAdmissionIndividualReportDto({
        completedAt: attempt.completedAt,
        questionnaireVersion: attempt.questionnaireVersion,
        result,
        safety,
      }),
    };
  }
}
