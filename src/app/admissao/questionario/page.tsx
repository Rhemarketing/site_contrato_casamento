import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Alert, FloatingErrorToast, PageContainer } from "@/components/ui";
import { QuestionnaireRunner } from "@/features/admission/components/questionnaire-runner";
import { requireUser } from "@/lib/auth/current-user";
import { db } from "@/lib/db";
import { AdmissionAttemptService } from "@/services/admission-attempt.service";
import { AdmissionAttemptError, ADMISSION_ERROR_MESSAGES } from "@/services/admission-attempt.errors";

export const metadata: Metadata = { title: "Questionário de admissão" };
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function QuestionnairePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; errorCode?: string; review?: string }>;
}) {
  const user = await requireUser("/admissao/questionario");
  const service = new AdmissionAttemptService(db);
  const { error, errorCode, review } = await searchParams;
  const isReviewMode = Boolean(review || errorCode);

  if (isReviewMode) {
    await service.reopenForReview(user.id);
  }

  let state = await service.getState(user.id);

  if (!isReviewMode && state.kind === "COMPLETED") {
    redirect("/admissao/resultado");
  }

  if (state.kind === "NOT_STARTED") {
    try {
      await service.startOrResume(user.id);
      state = await service.getState(user.id);
    } catch (err: unknown) {
      const message = err instanceof AdmissionAttemptError
        ? ADMISSION_ERROR_MESSAGES[err.code]
        : "Não foi possível iniciar o exame de admissão. Tente novamente.";
      return (
        <PageContainer className="py-12 sm:py-16">
          <div className="mx-auto max-w-2xl">
            <Alert variant="error">{message}</Alert>
          </div>
          {errorCode ? <FloatingErrorToast errorCode={errorCode} /> : null}
        </PageContainer>
      );
    }
  }

  if (state.kind === "OPEN") {
    return (
      <PageContainer className="py-8 sm:py-14">
        <div className="mx-auto max-w-3xl">
          {error ? <Alert variant="error" className="mb-6">{error}</Alert> : null}
          <QuestionnaireRunner
            attemptId={state.attemptId}
            questions={state.questions}
            initialAnswers={state.answers}
            initialQuestionIndex={isReviewMode ? 0 : state.currentQuestionIndex}
          />
        </div>
        {errorCode ? <FloatingErrorToast errorCode={errorCode} /> : null}
      </PageContainer>
    );
  }

  return (
    <PageContainer className="py-12 sm:py-16">
      <div className="mx-auto max-w-2xl">
        <Alert variant="error">Não foi possível carregar as perguntas do exame de admissão.</Alert>
      </div>
      {errorCode ? <FloatingErrorToast errorCode={errorCode} /> : null}
    </PageContainer>
  );
}

