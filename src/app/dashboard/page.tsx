import type { Metadata } from "next";
import Link from "next/link";
import { WorkspacePage } from "@/components/layout/workspace-page";
import { Card } from "@/components/ui";
import { requireUser } from "@/lib/auth/current-user";
import { db } from "@/lib/db";
import { AdmissionAttemptService } from "@/services/admission-attempt.service";

export const metadata: Metadata = { title: "Painel" };

export default async function DashboardPage() {
  const user = await requireUser("/dashboard");
  const summary = await new AdmissionAttemptService(db).getSummary(user.id);
  const content = {
    NOT_STARTED: { title: "Você ainda não iniciou sua Prova de Admissão", action: "Iniciar Prova de Admissão", href: "/admissao/questionario" },
    OPEN: { title: "Sua Prova de Admissão está em andamento", action: "Continuar Prova de Admissão", href: "/admissao/questionario" },
    COMPLETED: { title: "Sua Prova de Admissão foi concluída", action: "Ver resultado", href: "/admissao/resultado" },
  }[summary.state];

  return (
    <WorkspacePage eyebrow="Área pessoal" title={`Olá, ${user.name}`} description="Acompanhe sua jornada e suas atividades em um só lugar.">
      <Card className="mb-6"><p className="text-sm text-muted">Sua conta</p><p className="mt-1 font-semibold text-brand-strong">{user.email}</p></Card>
      <Card>
        <h2 className="text-xl font-semibold text-brand-strong">{content.title}</h2>
        {summary.state === "OPEN" ? <p className="mt-2 text-muted">{summary.answerCount} de {summary.questionCount} respostas registradas.</p> : null}
        <Link href={content.href} className="mt-5 inline-flex min-h-11 items-center rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-strong">{content.action}</Link>
      </Card>
    </WorkspacePage>
  );
}
