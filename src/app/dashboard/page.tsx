import type { Metadata } from "next";
import Link from "next/link";
import { WorkspacePage } from "@/components/layout/workspace-page";
import { EmptyState } from "@/components/ui/empty-state";

export const metadata: Metadata = { title: "Painel" };

export default function DashboardPage() {
  return <WorkspacePage eyebrow="Área pessoal" title="Seu painel" description="Acompanhe sua jornada, convites e atividades em um só lugar."><EmptyState title="Sua jornada começa aqui" description="Ainda não há atividades registradas neste painel." action={<Link href="/admissao" className="font-semibold text-brand hover:underline">Conhecer a Prova de Admissão</Link>} /></WorkspacePage>;
}
