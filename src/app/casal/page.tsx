import type { Metadata } from "next";
import { WorkspacePage } from "@/components/layout/workspace-page";
import { EmptyState } from "@/components/ui/empty-state";

export const metadata: Metadata = { title: "Casal" };

export default function CouplePage() {
  return <WorkspacePage eyebrow="Espaço compartilhado" title="Área do casal" description="Um espaço futuro para conteúdos que ambos escolherem compartilhar."><EmptyState title="Nenhum vínculo criado" description="Convites e vínculos entre parceiros serão implementados em uma próxima etapa, sempre com consentimento e validação no servidor." /></WorkspacePage>;
}
