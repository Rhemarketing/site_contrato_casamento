import type { Metadata } from "next";
import { WorkspacePage } from "@/components/layout/workspace-page";
import { EmptyState } from "@/components/ui/empty-state";

export const metadata: Metadata = { title: "Administração" };

export default function AdminPage() {
  return <WorkspacePage eyebrow="Acesso restrito" title="Administração" description="Gestão operacional da plataforma, sujeita a autenticação e autorização específicas."><EmptyState title="Módulos administrativos ainda não configurados" description="Nenhuma operação administrativa está disponível nesta etapa inicial." /></WorkspacePage>;
}
