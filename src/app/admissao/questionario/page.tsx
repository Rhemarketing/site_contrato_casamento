import type { Metadata } from "next";
import Link from "next/link";
import { startAdmissionAttemptAction } from "@/app/actions/admission.actions";
import { Alert, Badge, Button, Card, PageContainer } from "@/components/ui";
import { QuestionnaireRunner } from "@/features/admission/components/questionnaire-runner";
import { requireUser } from "@/lib/auth/current-user";
import { db } from "@/lib/db";
import { AdmissionAttemptService } from "@/services/admission-attempt.service";

export const metadata: Metadata = { title: "Questionário de admissão" };

export default async function QuestionnairePage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const user = await requireUser("/admissao/questionario");
  const state = await new AdmissionAttemptService(db).getState(user.id);
  const { error } = await searchParams;

  if (state.kind === "OPEN") {
    return (
      <PageContainer className="py-8 sm:py-14">
        <div className="mx-auto max-w-3xl">
          <QuestionnaireRunner attemptId={state.attemptId} questions={state.questions} initialAnswers={state.answers} initialQuestionIndex={state.currentQuestionIndex} />
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer className="py-12 sm:py-16">
      <div className="mx-auto max-w-2xl">
        {error ? <Alert variant="error" className="mb-6">{error}</Alert> : null}
        <Badge>Prova de Admissão</Badge>
        <h1 className="mt-5 font-serif text-4xl text-brand-strong sm:text-5xl">
          {state.kind === "COMPLETED" ? "Você já concluiu esta Prova de Admissão." : "Pronto para começar?"}
        </h1>
        <Card className="mt-8">
          {state.kind === "COMPLETED" ? (
            <>
              <p className="text-muted">Suas 40 respostas foram registradas. Uma futura política definirá quando uma nova tentativa poderá ser realizada.</p>
              <Link href="/admissao/resultado" className="mt-6 inline-flex min-h-11 items-center rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-strong">Ver resultado</Link>
            </>
          ) : (
            <>
              <p className="text-muted">A prova possui 40 perguntas, apresentadas uma por vez. Suas respostas são salvas no banco e você poderá continuar mais tarde.</p>
              <form action={startAdmissionAttemptAction} className="mt-6"><Button type="submit">Iniciar Prova de Admissão</Button></form>
            </>
          )}
        </Card>
      </div>
    </PageContainer>
  );
}
