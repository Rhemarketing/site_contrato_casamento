import type { Metadata } from "next";
import Link from "next/link";
import { WorkspacePage } from "@/components/layout/workspace-page";
import { Badge, Card } from "@/components/ui";
import { requireUser } from "@/lib/auth/current-user";
import { db } from "@/lib/db";
import { AdmissionAttemptService } from "@/services/admission-attempt.service";
import { CoupleService } from "@/services/couple.service";

export const metadata: Metadata = { title: "Dashboard", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function DashboardPage() {
  const user = await requireUser("/dashboard");
  const [summary, couple] = await Promise.all([
    new AdmissionAttemptService(db).getSummary(user.id),
    new CoupleService(db).getOverview(user.id),
  ]);
  const content = {
    NOT_STARTED: { badge: "Não iniciada", title: "Minha Prova de Admissão", description: "Reserve um momento tranquilo para responder às 40 perguntas individualmente.", action: "Iniciar Prova de Admissão", href: "/admissao/questionario" },
    OPEN: { badge: "Em andamento", title: "Minha Prova de Admissão", description: `${summary.answerCount} de ${summary.questionCount} respostas registradas.`, action: "Continuar Prova de Admissão", href: "/admissao/questionario" },
    COMPLETED: { badge: "Avaliação concluída", title: "Meu resultado", description: "Seu relatório individual está disponível com áreas, prioridades e orientações privadas.", action: "Ver meu resultado", href: "/admissao/resultado" },
  }[summary.state];
  const coupleContent = {
    NONE: { badge: "Sem vínculo", description: "Convide seu cônjuge sem compartilhar automaticamente respostas individuais.", action: "Conectar meu cônjuge" },
    PENDING: { badge: "Convite pendente", description: "O convite está aguardando o aceite do seu cônjuge.", action: "Ver convite aguardando aceite" },
    ACTIVE: { badge: "Conectado", description: "As duas contas estão conectadas. Os dados individuais continuam protegidos.", action: "Ver cônjuge conectado" },
  }[couple.state];

  return (
    <WorkspacePage eyebrow="Área pessoal" title={`Olá, ${user.name}`} description="Acompanhe sua prova e seu vínculo de relacionamento em um só lugar.">
      <Card className="mb-6"><p className="text-sm text-muted">Sua conta</p><p className="mt-1 break-all font-semibold text-brand-strong">{user.email}</p></Card>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="flex h-full flex-col">
          <div><Badge>{content.badge}</Badge><h2 className="mt-4 text-xl font-semibold text-brand-strong">{content.title}</h2><p className="mt-2 text-muted">{content.description}</p></div>
          <Link href={content.href} className="mt-6 inline-flex min-h-11 w-fit items-center rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-strong">{content.action}</Link>
        </Card>
        <Card className="flex h-full flex-col">
          <div><Badge>{coupleContent.badge}</Badge><h2 className="mt-4 text-xl font-semibold text-brand-strong">Meu relacionamento</h2><p className="mt-2 text-muted">{coupleContent.description}</p></div>
          <Link href="/casal" className="mt-6 inline-flex min-h-11 w-fit items-center rounded-full border border-line bg-surface px-5 py-2.5 text-sm font-semibold text-brand hover:border-brand">{coupleContent.action}</Link>
        </Card>
      </div>
    </WorkspacePage>
  );
}
