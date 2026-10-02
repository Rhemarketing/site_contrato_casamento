import type { Metadata } from "next";
import Link from "next/link";
import { WorkspacePage } from "@/components/layout/workspace-page";
import { Badge, Card } from "@/components/ui";
import { requireUser } from "@/lib/auth/current-user";
import { db } from "@/lib/db";
import { AdmissionAttemptService } from "@/services/admission-attempt.service";
import { CoupleService } from "@/services/couple.service";
import { ContractService } from "@/services/contract.service";
import { CoupleInviteForm } from "@/features/couple/components/couple-invite-form";

export const metadata: Metadata = { title: "Dashboard", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function DashboardPage() {
  const user = await requireUser("/dashboard");
  const [summary, couple] = await Promise.all([
    new AdmissionAttemptService(db).getSummary(user.id),
    new CoupleService(db).getOverview(user.id),
  ]);

  let contractSession = null;
  try {
    contractSession = await new ContractService(db).getOwn(user.id);
  } catch {}

  const admissionContent = {
    NOT_STARTED: {
      badge: "Não iniciado",
      description: "Reserve um momento tranquilo para responder às 40 perguntas individualmente.",
      action: "Iniciar Exame de Admissão",
      href: "/admissao/questionario",
    },
    OPEN: {
      badge: "Em andamento",
      description: `${summary.answerCount} de ${summary.questionCount} respostas registradas.`,
      action: "Continuar Exame de Admissão",
      href: "/admissao/questionario",
    },
    COMPLETED: {
      badge: "Avaliação concluída",
      description: "Seu relatório individual está disponível com áreas, prioridades e orientações privadas.",
      action: "Ver meu resultado",
      href: "/admissao/resultado",
    },
  }[summary.state];

  const contractContent = contractSession?.status === "SUBMITTED"
    ? {
        badge: "Concluído",
        description: "Suas 200 respostas foram salvas. O contrato está pronto para visualização e download em PDF.",
        action: "Ver Nosso Contrato",
        href: "/contrato/documento",
      }
    : contractSession?.status === "IN_PROGRESS"
    ? {
        badge: "Em andamento",
        description: `${contractSession.answered} de 200 respostas registradas.`,
        action: "Continuar questionário",
        href: "/contrato/questionario",
      }
    : {
        badge: "Disponível",
        description: "Questionário completo para gerar os acordos e cláusulas personalizadas do casal.",
        action: "Iniciar questionário",
        href: "/contrato/questionario",
      };

  const coupleContent = {
    NONE: {
      badge: "Sem vínculo",
      description: "Envie um convite direto pelo WhatsApp para conectar seu cônjuge à sua conta.",
    },
    PENDING: {
      badge: "Convite pendente",
      description: `Convite enviado para ${couple.state === "PENDING" && couple.invite?.whatsappPhone ? couple.invite.whatsappPhone : "seu parceiro"}. Você pode reenviar pelo WhatsApp ou alterar o número.`,
    },
    ACTIVE: {
      badge: "Conectado",
      description: "As duas contas estão conectadas. Os dados individuais continuam protegidos.",
    },
  }[couple.state];

  return (
    <WorkspacePage eyebrow="Área pessoal" title={`Olá, ${user.name}`} description="Acompanhe seu exame e seu vínculo de relacionamento em um só lugar.">
      <Card className="mb-6">
        <p className="text-sm text-muted">Sua conta</p>
        <p className="mt-1 break-all font-semibold text-brand-strong">{user.email}</p>
      </Card>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Card 1: Exame de Admissão */}
        <Card className="flex h-full flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2">
              <Badge>{admissionContent.badge}</Badge>
            </div>
            <h2 className="mt-4 text-xl font-semibold text-brand-strong">Exame de Admissão</h2>
            <p className="mt-0.5 text-xs font-medium text-muted">40 perguntas</p>
            <p className="mt-3 text-sm text-muted">{admissionContent.description}</p>
          </div>
          <div className="mt-6 pt-2">
            <Link
              href={admissionContent.href}
              className="inline-flex min-h-11 w-full items-center justify-center rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-strong"
            >
              {admissionContent.action}
            </Link>
          </div>
        </Card>

        {/* Card 2: Contrato de Casamento */}
        <Card className="flex h-full flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2">
              <Badge>{contractContent.badge}</Badge>
            </div>
            <h2 className="mt-4 text-xl font-semibold text-brand-strong">Contrato de Casamento</h2>
            <p className="mt-0.5 text-xs font-medium text-muted">200 perguntas</p>
            <p className="mt-3 text-sm text-muted">{contractContent.description}</p>
          </div>
          <div className="mt-6 pt-2">
            <Link
              href={contractContent.href}
              className="inline-flex min-h-11 w-full items-center justify-center rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-strong"
            >
              {contractContent.action}
            </Link>
          </div>
        </Card>

        {/* Card 3: Conectar parceiro */}
        <Card className="flex h-full flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2">
              <Badge>{coupleContent.badge}</Badge>
            </div>
            <h2 className="mt-4 text-xl font-semibold text-brand-strong">Conectar parceiro</h2>
            <p className="mt-0.5 text-xs font-medium text-muted">Vínculo do casal</p>
            <p className="mt-3 text-sm text-muted">{coupleContent.description}</p>

            {couple.state === "ACTIVE" ? (
              <div className="mt-4 rounded-xl border border-line bg-surface p-4">
                <p className="text-xs text-muted">Cônjuge conectado:</p>
                <p className="font-semibold text-brand-strong">{couple.partner?.name}</p>
                <p className="text-xs text-muted">{couple.partner?.email}</p>
              </div>
            ) : couple.state === "PENDING" ? (
              <div className="mt-4">
                <CoupleInviteForm defaultPhone={couple.invite?.whatsappPhone} regenerate fullWidthButton />
              </div>
            ) : (
              <div className="mt-4">
                <CoupleInviteForm fullWidthButton />
              </div>
            )}
          </div>

          {couple.state === "ACTIVE" ? (
            <div className="mt-6 pt-2">
              <Link
                href="/casal"
                className="inline-flex min-h-11 w-full items-center justify-center rounded-full border border-line bg-surface px-5 py-2.5 text-sm font-semibold text-brand hover:border-brand"
              >
                Ver detalhes do casal
              </Link>
            </div>
          ) : null}
        </Card>
      </div>
    </WorkspacePage>
  );
}
