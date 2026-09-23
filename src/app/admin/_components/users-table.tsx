"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { EditUserModal } from "./edit-user-modal";
import { DeleteUserModal } from "./delete-user-modal";
import type { AdminUserListItem } from "@/services/admin-users.service";
import type { UserRole } from "@/generated/prisma/enums";

interface UsersTableProps {
  users: AdminUserListItem[];
}

export function UsersTable({ users }: UsersTableProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const [editingUser, setEditingUser] = useState<{
    id: string;
    name: string;
    email: string;
    role: UserRole;
  } | null>(null);

  const [deletingUser, setDeletingUser] = useState<{
    id: string;
    name: string;
    email: string;
  } | null>(null);

  const filteredUsers = users.filter((user) => {
    // Busca por nome ou e-mail ou nome do parceiro
    if (search.trim()) {
      const term = search.toLowerCase();
      const matchName = user.name.toLowerCase().includes(term);
      const matchEmail = user.email.toLowerCase().includes(term);
      const matchPartner = user.partner?.name.toLowerCase().includes(term) || false;
      if (!matchName && !matchEmail && !matchPartner) return false;
    }

    // Filtro por papel
    if (roleFilter !== "ALL" && user.role !== roleFilter) {
      return false;
    }

    // Filtro por status
    if (statusFilter === "WITH_PARTNER" && !user.partner) {
      return false;
    }
    if (statusFilter === "COMPLETED_40Q" && user.admissionStatus?.status !== "COMPLETED") {
      return false;
    }
    if (statusFilter === "IN_PROGRESS" && user.admissionStatus?.status !== "IN_PROGRESS") {
      return false;
    }

    return true;
  });

  function handleActionSuccess() {
    router.refresh();
  }

  return (
    <div className="space-y-6">
      {/* Barra de Filtros e Busca */}
      <div className="flex flex-col gap-3 rounded-2xl border border-line bg-surface p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <svg
            className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            id="admin-search-users"
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome, e-mail ou parceiro..."
            className="min-h-10 w-full rounded-xl border border-line bg-surface pl-10 pr-4 text-sm text-foreground shadow-sm transition placeholder:text-muted/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="h-10 rounded-xl border border-line bg-surface px-3 text-xs font-semibold text-foreground shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
          >
            <option value="ALL">Todos os Papéis</option>
            <option value="ADMIN">Apenas Administradores</option>
            <option value="USER">Apenas Usuários Padrão</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 rounded-xl border border-line bg-surface px-3 text-xs font-semibold text-foreground shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
          >
            <option value="ALL">Todos os Status</option>
            <option value="WITH_PARTNER">Com Parceiro Conectado</option>
            <option value="COMPLETED_40Q">Questionário Concluído</option>
            <option value="IN_PROGRESS">Questionário Em Andamento</option>
          </select>
        </div>
      </div>

      {/* Indicador de Quantidade */}
      <div className="flex items-center justify-between px-1 text-xs text-muted">
        <p>
          Exibindo <strong>{filteredUsers.length}</strong> de <strong>{users.length}</strong> usuários cadastrados
        </p>
      </div>

      {/* Tabela de Usuários */}
      <div className="overflow-hidden rounded-2xl border border-line bg-surface shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-line bg-background/70 text-xs font-bold uppercase tracking-wider text-muted">
              <tr>
                <th className="px-5 py-4">Usuário</th>
                <th className="px-4 py-4">Papel</th>
                <th className="px-4 py-4">Parceiro / Casal</th>
                <th className="px-4 py-4">Questionário (40Q)</th>
                <th className="px-4 py-4">Contrato</th>
                <th className="px-5 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted">
                    Nenhum usuário encontrado com os filtros aplicados.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const initials = user.name
                    .split(" ")
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join("")
                    .toUpperCase();

                  return (
                    <tr key={user.id} className="transition-colors hover:bg-background/40">
                      {/* Usuário (Nome, e-mail e data) */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand/10 font-bold text-brand">
                            {initials || "U"}
                          </span>
                          <div>
                            <Link
                              href={`/admin/usuarios/${user.id}`}
                              className="font-semibold text-brand-strong hover:underline"
                            >
                              {user.name}
                            </Link>
                            <p className="text-xs text-muted">{user.email}</p>
                            <p className="mt-0.5 text-[11px] text-muted">
                              Cadastrado em {new Date(user.createdAt).toLocaleDateString("pt-BR")}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Papel */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        {user.role === "ADMIN" ? (
                          <Badge className="bg-amber-100 text-amber-800 border-amber-300">
                            ADMIN
                          </Badge>
                        ) : (
                          <Badge className="bg-surface text-muted border border-line">USER</Badge>
                        )}
                      </td>

                      {/* Parceiro */}
                      <td className="px-4 py-4">
                        {user.partner ? (
                          <div className="flex flex-col gap-1">
                            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
                              <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <circle cx="8" cy="12" r="5" />
                                <circle cx="16" cy="12" r="5" />
                              </svg>
                              {user.partner.name}
                            </span>
                            <span className="text-[11px] text-muted">
                              {user.partner.email} • {user.partner.role === "CREATOR" ? "Criador" : "Convidado"}
                            </span>
                          </div>
                        ) : user.pendingInvite ? (
                          <div className="flex flex-col gap-1">
                            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-700">
                              <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10" />
                                <polyline points="12 6 12 12 16 14" />
                              </svg>
                              Convite Pendente
                            </span>
                            <span className="text-[11px] text-muted">
                              {user.pendingInvite.whatsappPhone || user.pendingInvite.email || "WhatsApp"}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-muted italic">Sem vínculo</span>
                        )}
                      </td>

                      {/* Questionário de Admissão */}
                      <td className="px-4 py-4">
                        {user.admissionStatus ? (
                          user.admissionStatus.status === "COMPLETED" ? (
                            <div className="flex flex-col gap-0.5">
                              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700">
                                <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                  <polyline points="20 6 9 17 4 12" />
                                </svg>
                                Concluído
                              </span>
                              {user.admissionStatus.totalScore !== null && (
                                <span className="text-xs font-medium text-brand-strong">
                                  Nota: {user.admissionStatus.totalScore} pts
                                </span>
                              )}
                              {user.admissionStatus.completedAt && (
                                <span className="text-[11px] text-muted">
                                  em {new Date(user.admissionStatus.completedAt).toLocaleDateString("pt-BR")}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700">
                              <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10" />
                              </svg>
                              Em andamento
                            </span>
                          )
                        ) : (
                          <span className="text-xs text-muted italic">Não iniciado</span>
                        )}
                      </td>

                      {/* Contrato */}
                      <td className="px-4 py-4 whitespace-nowrap text-xs">
                        <span
                          className={`rounded-full px-2.5 py-1 font-medium ${
                            user.contractStatus.includes("enviadas") || user.contractStatus.includes("Comprado")
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : user.contractStatus.includes("andamento")
                              ? "bg-amber-50 text-amber-700 border border-amber-200"
                              : "bg-surface text-muted border border-line"
                          }`}
                        >
                          {user.contractStatus}
                        </span>
                      </td>

                      {/* Ações */}
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/admin/usuarios/${user.id}`}
                            className="inline-flex items-center gap-1 rounded-lg border border-line bg-surface px-2.5 py-1.5 text-xs font-semibold text-brand transition hover:bg-brand/5 hover:border-brand/40"
                            title="Ver histórico e respostas do questionário"
                          >
                            <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                              <circle cx="12" cy="12" r="3" />
                            </svg>
                            Raio-X
                          </Link>

                          <button
                            onClick={() =>
                              setEditingUser({
                                id: user.id,
                                name: user.name,
                                email: user.email,
                                role: user.role,
                              })
                            }
                            className="rounded-lg border border-line bg-surface p-1.5 text-muted transition hover:text-brand-strong hover:bg-background"
                            title="Editar dados cadastrais"
                          >
                            <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M12 20h9" />
                              <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
                            </svg>
                          </button>

                          <button
                            onClick={() =>
                              setDeletingUser({
                                id: user.id,
                                name: user.name,
                                email: user.email,
                              })
                            }
                            className="rounded-lg border border-line bg-surface p-1.5 text-muted transition hover:text-red-600 hover:bg-red-50 hover:border-red-200"
                            title="Excluir usuário e todos os registros vinculados"
                          >
                            <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M3 6h18" />
                              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modais de Edição e Exclusão */}
      <EditUserModal
        user={editingUser}
        isOpen={!!editingUser}
        onClose={() => setEditingUser(null)}
        onSuccess={handleActionSuccess}
      />

      <DeleteUserModal
        user={deletingUser}
        isOpen={!!deletingUser}
        onClose={() => setDeletingUser(null)}
        onSuccess={handleActionSuccess}
      />
    </div>
  );
}
