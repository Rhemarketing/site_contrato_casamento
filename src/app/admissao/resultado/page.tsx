import type { Metadata } from "next";
import Link from "next/link";
import { Alert, Card, PageContainer } from "@/components/ui";
import { AdmissionReportConfigurationError } from "@/features/admission/report/admission-report-content";
import { IndividualAdmissionReport } from "@/features/admission/report/components/individual-report";
import { PrivateAnswerAccessError } from "@/features/admission/security/private-answer-policy";
import { requireUser } from "@/lib/auth/current-user";
import { db } from "@/lib/db";
import { AdmissionAttemptError } from "@/services/admission-attempt.errors";
import { AdmissionIndividualReportService } from "@/services/admission-individual-report.service";
import type { AdmissionIndividualReportState } from "@/types/admission-report";

export const metadata: Metadata = {
  title: "Seu resultado",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";
export const revalidate = 0;

function ResultStateCard({ title, description, href, action }: { title: string; description: string; href?: string; action?: string }) {
  return (
    <PageContainer className="py-12 sm:py-16">
      <Card className="mx-auto max-w-2xl p-6 sm:p-9">
        <h1 className="font-serif text-3xl text-brand-strong sm:text-4xl">{title}</h1>
        <p className="mt-4 text-muted">{description}</p>
        {href && action ? <Link href={href} className="mt-6 inline-flex min-h-12 items-center rounded-full bg-brand px-6 font-semibold text-white hover:bg-brand-strong">{action}</Link> : null}
      </Card>
    </PageContainer>
  );
}

export default async function AdmissionResultPage() {
  const user = await requireUser("/admissao/resultado");
  let state: AdmissionIndividualReportState;
  try {
    state = await new AdmissionIndividualReportService(db).getForUser(user.id);
  } catch (error) {
    const controlled = error instanceof AdmissionReportConfigurationError ||
      (error instanceof AdmissionAttemptError && ["RESULT_NOT_FOUND", "RESULT_CONFIGURATION_ERROR"].includes(error.code)) ||
      (error instanceof PrivateAnswerAccessError && ["PRIVATE_RESULT_NOT_AVAILABLE", "PRIVATE_SAFETY_CONFIGURATION_ERROR"].includes(error.code));
    if (!controlled) throw error;
    state = { kind: "RESULT_PENDING" };
  }

  if (state.kind === "NOT_STARTED") {
    return <ResultStateCard title="Você ainda não realizou sua Prova de Admissão." description="Inicie a avaliação para registrar suas percepções sobre o relacionamento." href="/admissao/questionario" action="Iniciar Prova de Admissão" />;
  }
  if (state.kind === "IN_PROGRESS") {
    return <ResultStateCard title="Sua Prova de Admissão ainda não foi concluída." description={`${state.answerCount} de 40 respostas estão registradas. Continue de onde parou para gerar seu relatório.`} href="/admissao/questionario" action="Continuar minha prova" />;
  }
  if (state.kind === "RESULT_PENDING") {
    return (
      <PageContainer className="py-12 sm:py-16">
        <div className="mx-auto max-w-2xl">
          <h1 className="font-serif text-3xl text-brand-strong sm:text-4xl">Seu resultado ainda não está disponível.</h1>
          <Alert variant="warning" className="mt-6">As respostas permanecem registradas. Nenhum cálculo ou correção foi executado ao abrir esta página.</Alert>
          <Link href="/dashboard" className="mt-6 inline-flex min-h-12 items-center rounded-full bg-brand px-6 font-semibold text-white hover:bg-brand-strong">Voltar ao dashboard</Link>
        </div>
      </PageContainer>
    );
  }

  return <PageContainer className="py-10 sm:py-16"><div className="mx-auto max-w-7xl"><IndividualAdmissionReport report={state.report} /></div></PageContainer>;
}
