import type { Metadata } from "next";
import Link from "next/link";
import { PageHeading } from "@/components/layout/page-heading";
import { Alert } from "@/components/ui/alert";
import { PageContainer } from "@/components/ui/page-container";
import { AdmissionOverview } from "@/features/admission/components/admission-overview";

export const metadata: Metadata = { title: "Prova de Admissão" };

export default function AdmissionPage() {
  return (
    <>
      <PageHeading eyebrow="Prova de Admissão" title="Antes do “sim”, existe espaço para perguntar." description="Uma experiência individual de reflexão sobre valores, expectativas e escolhas importantes para a vida a dois." />
      <PageContainer className="py-12 sm:py-16">
        <AdmissionOverview />
        <Alert title="Seu espaço continua sendo seu" className="mt-8">
          São 40 perguntas respondidas individualmente. Respostas privadas não são exibidas automaticamente ao parceiro, mesmo quando as duas contas estiverem conectadas.
        </Alert>
        <div className="mt-8 flex justify-center">
          <Link href="/admissao/questionario" className="inline-flex min-h-12 items-center justify-center rounded-full bg-brand px-6 py-3 font-semibold text-white transition hover:bg-brand-strong">Começar</Link>
        </div>
      </PageContainer>
    </>
  );
}
