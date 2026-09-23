"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { EditUserModal } from "@/app/admin/_components/edit-user-modal";
import { DeleteUserModal } from "@/app/admin/_components/delete-user-modal";
import type { UserRole } from "@/generated/prisma/enums";

interface UserActionsProps {
  user: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
  };
}

export function UserActions({ user }: UserActionsProps) {
  const router = useRouter();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="secondary"
        onClick={() => setIsEditOpen(true)}
        className="flex items-center gap-1.5"
      >
        <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 20h9" />
          <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
        </svg>
        Editar Dados
      </Button>

      <Button
        variant="ghost"
        onClick={() => setIsDeleteOpen(true)}
        className="flex items-center gap-1.5 text-red-600 hover:bg-red-50 hover:text-red-700"
      >
        <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 6h18" />
          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
        </svg>
        Excluir Usuário
      </Button>

      <EditUserModal
        user={user}
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onSuccess={() => router.refresh()}
      />

      <DeleteUserModal
        user={user}
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onSuccess={() => router.push("/admin")}
      />
    </div>
  );
}
