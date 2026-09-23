"use client";

import { useState, useTransition } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { updateUserAction } from "../actions";
import type { UserRole } from "@/generated/prisma/enums";

interface EditUserModalProps {
  user: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
  } | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function EditUserModal({ user, isOpen, onClose, onSuccess }: EditUserModalProps) {
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!user) return null;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const formData = new FormData(e.currentTarget);
    formData.set("userId", user!.id);

    startTransition(async () => {
      const result = await updateUserAction(null, formData);
      if (result.success) {
        setSuccessMessage(result.message || "Usuário atualizado com sucesso!");
        setTimeout(() => {
          setSuccessMessage(null);
          onClose();
          if (onSuccess) onSuccess();
        }, 1200);
      } else {
        setErrorMessage(result.error || "Ocorreu um erro ao atualizar o usuário.");
      }
    });
  }

  return (
    <Modal isOpen={isOpen} title="Editar Usuário" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMessage && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {errorMessage}
          </div>
        )}

        {successMessage && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
            {successMessage}
          </div>
        )}

        <div>
          <label htmlFor="edit-name" className="block text-xs font-bold uppercase tracking-wider text-muted">
            Nome Completo
          </label>
          <input
            id="edit-name"
            name="name"
            type="text"
            defaultValue={user.name}
            required
            className="mt-1.5 flex h-11 w-full rounded-xl border border-line bg-surface px-3 py-2 text-sm text-foreground shadow-sm transition placeholder:text-muted/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
            placeholder="Nome do usuário"
          />
        </div>

        <div>
          <label htmlFor="edit-email" className="block text-xs font-bold uppercase tracking-wider text-muted">
            Endereço de E-mail
          </label>
          <input
            id="edit-email"
            name="email"
            type="email"
            defaultValue={user.email}
            required
            className="mt-1.5 flex h-11 w-full rounded-xl border border-line bg-surface px-3 py-2 text-sm text-foreground shadow-sm transition placeholder:text-muted/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
            placeholder="exemplo@email.com"
          />
        </div>

        <div>
          <label htmlFor="edit-role" className="block text-xs font-bold uppercase tracking-wider text-muted">
            Papel no Sistema
          </label>
          <select
            id="edit-role"
            name="role"
            defaultValue={user.role}
            className="mt-1.5 flex h-11 w-full rounded-xl border border-line bg-surface px-3 py-2 text-sm text-foreground shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
          >
            <option value="USER">USER — Usuário Padrão</option>
            <option value="ADMIN">ADMIN — Administrador do Sistema</option>
          </select>
        </div>

        <div className="border-t border-line pt-4">
          <label htmlFor="edit-password" className="block text-xs font-bold uppercase tracking-wider text-muted">
            Redefinir Senha <span className="text-[11px] font-normal lowercase text-muted">(opcional)</span>
          </label>
          <input
            id="edit-password"
            name="password"
            type="password"
            className="mt-1.5 flex h-11 w-full rounded-xl border border-line bg-surface px-3 py-2 text-sm text-foreground shadow-sm transition placeholder:text-muted/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
            placeholder="Nova senha (deixe vazio para não alterar)"
            minLength={6}
          />
          <p className="mt-1 text-xs text-muted">
            Preencha apenas se desejar cadastrar uma nova senha de acesso para este usuário.
          </p>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3 border-t border-line pt-4">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isPending}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? "Salvando..." : "Salvar Alterações"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
