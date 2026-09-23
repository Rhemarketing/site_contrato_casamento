"use client";

import { useState, useTransition } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { deleteUserAction } from "../actions";

interface DeleteUserModalProps {
  user: {
    id: string;
    name: string;
    email: string;
  } | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function DeleteUserModal({ user, isOpen, onClose, onSuccess }: DeleteUserModalProps) {
  const [confirmationInput, setConfirmationInput] = useState("");
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!user) return null;

  const isConfirmed = confirmationInput.trim().toLowerCase() === user.email.trim().toLowerCase();

  async function handleDelete() {
    if (!isConfirmed) return;
    setErrorMessage(null);

    startTransition(async () => {
      const result = await deleteUserAction(user!.id, confirmationInput);
      if (result.success) {
        setConfirmationInput("");
        onClose();
        if (onSuccess) onSuccess();
      } else {
        setErrorMessage(result.error || "Erro ao excluir o usuário.");
      }
    });
  }

  function handleClose() {
    setConfirmationInput("");
    setErrorMessage(null);
    onClose();
  }

  return (
    <Modal isOpen={isOpen} title="Excluir Usuário e Dados Vinculados" onClose={handleClose}>
      <div className="space-y-4">
        <div className="rounded-xl border border-red-300 bg-red-50 p-4 text-xs leading-relaxed text-red-800">
          <p className="font-bold text-sm text-red-900">
            ⚠️ Atenção: Esta ação é definitiva e irreversível!
          </p>
          <p className="mt-2">
            Ao excluir a conta de <strong>{user.name}</strong> ({user.email}), todos os dados e registros serão eliminados em cascata:
          </p>
          <ul className="mt-2 list-disc list-inside space-y-1 text-red-700">
            <li>Questionários de admissão e todas as respostas individuais registradas.</li>
            <li>Resultados de notas, avaliações diagnósticas e flags de risco.</li>
            <li>Vínculo conjugal e convites de WhatsApp/e-mail criados.</li>
            <li>Sessões, decisões e registros da jornada do contrato.</li>
            <li>Acesso e credenciais de login.</li>
          </ul>
        </div>

        {errorMessage && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {errorMessage}
          </div>
        )}

        <div>
          <label htmlFor="confirm-email" className="block text-xs font-bold uppercase tracking-wider text-muted">
            Para confirmar, digite o e-mail do usuário:
          </label>
          <p className="mt-1 text-xs text-brand-strong font-semibold select-all">
            {user.email}
          </p>
          <input
            id="confirm-email"
            type="text"
            value={confirmationInput}
            onChange={(e) => setConfirmationInput(e.target.value)}
            className="mt-2 min-h-11 w-full rounded-xl border border-line bg-surface px-3 py-2 text-sm text-foreground shadow-sm transition placeholder:text-muted/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
            placeholder={user.email}
            disabled={isPending}
            autoFocus
          />
        </div>

        <div className="mt-6 flex items-center justify-end gap-3 border-t border-line pt-4">
          <Button type="button" variant="ghost" onClick={handleClose} disabled={isPending}>
            Cancelar
          </Button>
          <Button
            type="button"
            className="bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
            onClick={handleDelete}
            disabled={!isConfirmed || isPending}
          >
            {isPending ? "Excluindo..." : "Confirmar Exclusão Definitiva"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
