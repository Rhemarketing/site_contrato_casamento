import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth/current-user";
import { ContractWhiteboardService } from "@/services/contract-whiteboard.service";
import { AdminNav } from "../../_components/admin-nav";
import { WhiteboardCanvas } from "./_components/whiteboard-canvas";

export const metadata: Metadata = {
  title: "Whiteboard das 200 Questões — Painel Administrativo",
};

export const dynamic = "force-dynamic";

export default async function ContractWhiteboardPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  await requireAdmin();
  const { q } = await searchParams;

  const service = new ContractWhiteboardService();
  const overview = await service.getOverview();

  return (
    <div className="mx-auto max-w-[1700px] px-4 py-8 sm:px-6 lg:px-8">
      {/* Navegação do Painel Administrativo */}
      <AdminNav />

      {/* Cabeçalho da Seção */}
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-brand">
            Visualizador e Editor de Fluxos
          </span>
          <h1 className="mt-1 font-serif text-3xl font-bold text-brand-strong sm:text-4xl">
            Whiteboard & Mapa Mental das 200 Questões
          </h1>
          <p className="mt-1 text-sm text-muted">
            Navegue pelas 200 questões do contrato, examine a árvore de combinações dos cônjuges e edite as perguntas e os módulos do Nós Decidimos diretamente pelo mapa.
          </p>
        </div>
      </div>

      {/* Canvas Interativo do Whiteboard */}
      <WhiteboardCanvas overview={overview} initialQuestionId={q ?? "Q001"} />
    </div>
  );
}
