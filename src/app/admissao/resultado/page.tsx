import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { IndividualAdmissionReport } from "@/features/admission/report/components/individual-report";
import { requireUser } from "@/lib/auth/current-user";
import { db } from "@/lib/db";
import { AdmissionIndividualReportService } from "@/services/admission-individual-report.service";
import { AdmissionResultService } from "@/services/admission-result.service";
import type { AdmissionIndividualReportState } from "@/types/admission-report";

export const metadata: Metadata = {
  title: "Seu resultado",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdmissionResultPage() {
  const user = await requireUser("/admissao/resultado");

  let state: AdmissionIndividualReportState | null = null;
  let redirectUrl: string | null = null;

  try {
    const reportService = new AdmissionIndividualReportService(db);
    state = await reportService.getForUser(user.id);

    if (state.kind === "NOT_STARTED" || state.kind === "IN_PROGRESS") {
      redirectUrl = "/admissao/questionario";
    } else if (state.kind === "RESULT_PENDING") {
      // Tentar reprocessar para verificar se a nota pode ser calculada agora
      try {
        const attempt = await db.questionnaireAttempt.findFirst({
          where: { userId: user.id },
          orderBy: { createdAt: "desc" },
          select: { id: true },
        });

        if (attempt) {
          await new AdmissionResultService(db).reprocessForUser(user.id, attempt.id);
          state = await reportService.getForUser(user.id);
        }
      } catch (reprocessErr: unknown) {
        const code = (typeof reprocessErr === "object" && reprocessErr !== null && "code" in reprocessErr)
          ? String((reprocessErr as { code: unknown }).code)
          : "RESULT_PENDING";
        redirectUrl = `/admissao/questionario?errorCode=${encodeURIComponent(code)}&review=1`;
      }

      if (state.kind === "RESULT_PENDING") {
        redirectUrl = "/admissao/questionario?errorCode=RESULT_PENDING&review=1";
      }
    }
  } catch (error: unknown) {
    const code = (typeof error === "object" && error !== null && "code" in error)
      ? String((error as { code: unknown }).code)
      : "REPORT_ERROR";
    redirectUrl = `/admissao/questionario?errorCode=${encodeURIComponent(code)}&review=1`;
  }

  if (redirectUrl) {
    redirect(redirectUrl);
  }

  if (!state || state.kind !== "READY") {
    redirect("/admissao/questionario?errorCode=RESULT_NOT_AVAILABLE&review=1");
  }

  return (
    <div className="bg-[#f4f6f9] sm:px-6 sm:py-12">
      <IndividualAdmissionReport report={state.report} />
    </div>
  );
}
