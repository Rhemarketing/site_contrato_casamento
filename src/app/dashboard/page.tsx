import type { Metadata } from "next";
import Link from "next/link";
import { WorkspacePage } from "@/components/layout/workspace-page";
import { Card, EmptyState } from "@/components/ui";
import { requireUser } from "@/lib/auth/current-user";

export const metadata: Metadata = { title: "Painel" };

export default async function DashboardPage() {
  const user = await requireUser("/dashboard");
  return (
    <WorkspacePage eyebrow="Área pessoal" title={`Olá, ${user.name}`} description="Acompanhe sua jornada e suas atividades em um só lugar.">
      <Card className="mb-6"><p className="text-sm text-muted">Sua conta</p><p className="mt-1 font-semibold text-brand-strong">{user.email}</p></Card>
      <EmptyState title="Você ainda não iniciou sua Prova de Admissão" description="A próxima etapa tornará o questionário funcional." action={<Link href="/admissao/questionario" className="font-semibold text-brand hover:underline">Iniciar Prova de Admissão</Link>} />
    </WorkspacePage>
  );
}
