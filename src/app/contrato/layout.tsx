import type { Metadata } from "next";
import { requireUser } from "@/lib/auth/current-user";
import { WorkspacePage } from "@/components/layout/workspace-page";

export const metadata: Metadata = { title: "Meu contrato", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";
export const revalidate = 0;
export default async function ContractLayout({ children }: { children: React.ReactNode }) {
  await requireUser("/contrato");
  return (
    <WorkspacePage
      eyebrow="Contrato de Casamento"
      title="Questionário do Contrato"
      description="Responda as perguntas -> Aguarde seu parceiro responder -> Baixe o Contrato"
    >
      {children}
    </WorkspacePage>
  );
}
