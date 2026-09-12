import type { Metadata } from "next";
import Link from "next/link";
import { requireUser } from "@/lib/auth/current-user";
import { WorkspacePage } from "@/components/layout/workspace-page";

export const metadata: Metadata = { title: "Meu contrato", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";
export const revalidate = 0;
export default async function ContractLayout({ children }: { children: React.ReactNode }) {
  await requireUser("/contrato");
  return <WorkspacePage eyebrow="Vida a dois" title="Construindo nossos acordos" description="Um espaço individual para refletir e um espaço conjunto para decidir.">
    <nav aria-label="Etapas do contrato" className="mb-8 flex flex-wrap gap-4 text-sm font-semibold text-brand">
      <Link href="/contrato">Visão geral</Link><Link href="/contrato/questionario">Minhas respostas</Link><Link href="/contrato/decisoes">NÓS DECIDIMOS</Link><Link href="/contrato/documento">Nosso contrato</Link>
    </nav>{children}
  </WorkspacePage>;
}
