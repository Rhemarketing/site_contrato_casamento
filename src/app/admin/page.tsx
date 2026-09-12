import type { Metadata } from "next";
import { WorkspacePage } from "@/components/layout/workspace-page";
import { EmptyState } from "@/components/ui/empty-state";
import Link from "next/link";

export const metadata: Metadata = { title: "Administração" };

export default function AdminPage() {
  return <WorkspacePage eyebrow="Acesso restrito" title="Administração" description="Revisão do catálogo, sem acesso às respostas individuais."><Link className="mb-6 inline-block text-brand underline" href="/admin/contrato">Revisar arquivo-mestre 1.4.0</Link><EmptyState title="Operações administrativas" description="O catálogo e as pendências do contrato estão disponíveis para revisão. Dados individuais permanecem restritos." /></WorkspacePage>;
}
