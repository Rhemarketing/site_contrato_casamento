import type { Metadata } from "next";
import { WorkspacePage } from "@/components/layout/workspace-page";
import { Card } from "@/components/ui/card";
import { AdminNav } from "./_components/admin-nav";
import { UsersTable } from "./_components/users-table";
import { getAdminDashboardStats, getAdminUsersList } from "@/services/admin-users.service";

export const metadata: Metadata = {
  title: "Gestão de Usuários | Administração",
};

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const [stats, users] = await Promise.all([
    getAdminDashboardStats(),
    getAdminUsersList(),
  ]);

  return (
    <WorkspacePage
      eyebrow="Painel de Controle"
      title="Gestão de Usuários"
      description="Acompanhamento detalhado de contas cadastradas, vínculos de casais, questionários e acordos."
    >
      <AdminNav />

      {/* Grid de Métricas Principais */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="flex flex-col justify-between p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted">
              Total de Usuários
            </span>
            <span className="flex size-8 items-center justify-center rounded-lg bg-brand/10 text-brand">
              <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </span>
          </div>
          <div className="mt-3">
            <span className="font-serif text-3xl font-bold text-brand-strong">
              {stats.totalUsers}
            </span>
            <p className="mt-1 text-xs text-muted">
              {stats.totalAdmins} {stats.totalAdmins === 1 ? "administrador" : "administradores"}
            </p>
          </div>
        </Card>

        <Card className="flex flex-col justify-between p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted">
              Casais Ativos
            </span>
            <span className="flex size-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600">
              <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="8" cy="12" r="5" />
                <circle cx="16" cy="12" r="5" />
              </svg>
            </span>
          </div>
          <div className="mt-3">
            <span className="font-serif text-3xl font-bold text-brand-strong">
              {stats.activeCouples}
            </span>
            <p className="mt-1 text-xs text-muted">Vínculos bilaterais conectados</p>
          </div>
        </Card>

        <Card className="flex flex-col justify-between p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted">
              Questionários Concluídos
            </span>
            <span className="flex size-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600">
              <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 11l3 3L22 4" />
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
              </svg>
            </span>
          </div>
          <div className="mt-3">
            <span className="font-serif text-3xl font-bold text-brand-strong">
              {stats.completedAttempts}
            </span>
            <p className="mt-1 text-xs text-muted">Avaliações de 40 perguntas finalizadas</p>
          </div>
        </Card>

        <Card className="flex flex-col justify-between p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted">
              Workspaces de Contrato
            </span>
            <span className="flex size-8 items-center justify-center rounded-lg bg-purple-500/10 text-purple-600">
              <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
            </span>
          </div>
          <div className="mt-3">
            <span className="font-serif text-3xl font-bold text-brand-strong">
              {stats.contractWorkspaces}
            </span>
            <p className="mt-1 text-xs text-muted">Processos de contrato iniciados</p>
          </div>
        </Card>
      </div>

      {/* Tabela de Gestão de Usuários */}
      <UsersTable users={users} />
    </WorkspacePage>
  );
}
