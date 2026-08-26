import type { Metadata } from "next";
import Link from "next/link";
import { Alert, Badge, Card, PageContainer } from "@/components/ui";
import { requireUser } from "@/lib/auth/current-user";
import { db } from "@/lib/db";
import { AdmissionAttemptError } from "@/services/admission-attempt.errors";
import { AdmissionResultService } from "@/services/admission-result.service";
import type { AdmissionCalculatedResult } from "@/types/admission-result";

export const metadata: Metadata = { title: "Resultado individual" };

export default async function AdmissionResultPage() {
  const user = await requireUser("/admissao/resultado");
  let result: AdmissionCalculatedResult | null = null;
  try {
    result = await new AdmissionResultService(db).getAdmissionResultForUser(user.id);
  } catch (error) {
    if (!(error instanceof AdmissionAttemptError) || error.code !== "RESULT_NOT_FOUND") throw error;
  }

  return (
    <PageContainer className="py-12 sm:py-16">
      <div className="mx-auto max-w-3xl">
        <Badge>{result ? "Resultado processado" : "Resultado pendente"}</Badge>
        <h1 className="mt-5 font-serif text-4xl text-brand-strong sm:text-5xl">
          {result ? "Seu resultado foi processado com sucesso." : "Seu resultado ainda não foi processado."}
        </h1>
        {result ? (
          <Card className="mt-8">
            <p className="text-sm text-muted">Pontuação da Prova de Admissão</p>
            <p className="mt-2 text-3xl font-semibold text-brand-strong">{result.totalScore} de {result.maxScore}</p>
            <p className="mt-3 text-sm text-muted">Esta é uma classificação interna do método, não um diagnóstico clínico.</p>
          </Card>
        ) : (
          <Alert variant="warning" className="mt-8">Nenhum cálculo foi executado ao abrir esta página. Resultados pendentes exigem uma operação interna explícita.</Alert>
        )}
        <Alert className="mt-6" title="Privacidade preservada">As respostas privadas não fazem parte da pontuação, das áreas ou das flags conjugais.</Alert>
        <Link href="/dashboard" className="mt-8 inline-flex min-h-12 items-center rounded-full bg-brand px-6 font-semibold text-white hover:bg-brand-strong">Ir para o painel</Link>
      </div>
    </PageContainer>
  );
}
