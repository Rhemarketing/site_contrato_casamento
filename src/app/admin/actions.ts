"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/current-user";
import { updateAdminUser, deleteAdminUserCascade } from "@/services/admin-users.service";
import type { UserRole } from "@/generated/prisma/enums";

const updateUserSchema = z.object({
  userId: z.string().uuid("ID de usuário inválido"),
  name: z.string().min(2, "O nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("Endereço de e-mail inválido"),
  role: z.enum(["USER", "ADMIN"] as const),
  password: z.string().optional(),
});

export async function updateUserAction(
  _prevState: unknown,
  formData: FormData
): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    await requireAdmin();

    const rawData = {
      userId: formData.get("userId") as string,
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      role: formData.get("role") as UserRole,
      password: (formData.get("password") as string) || undefined,
    };

    const parsed = updateUserSchema.parse(rawData);

    await updateAdminUser(parsed.userId, {
      name: parsed.name,
      email: parsed.email,
      role: parsed.role,
      password: parsed.password && parsed.password.trim() ? parsed.password.trim() : undefined,
    });

    revalidatePath("/admin");
    revalidatePath(`/admin/usuarios/${parsed.userId}`);

    return {
      success: true,
      message: "Dados do usuário atualizados com sucesso!",
    };
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return {
        success: false,
        error: err.issues[0]?.message || "Dados inválidos",
      };
    }
    const message = err instanceof Error ? err.message : "Erro ao atualizar usuário.";
    return {
      success: false,
      error: message,
    };
  }
}

export async function deleteUserAction(
  userId: string,
  confirmationEmail: string
): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const admin = await requireAdmin();

    if (!confirmationEmail || !confirmationEmail.trim()) {
      return {
        success: false,
        error: "Por favor, digite o e-mail do usuário para confirmar a exclusão.",
      };
    }

    await deleteAdminUserCascade(userId, admin.id);

    revalidatePath("/admin");

    return {
      success: true,
      message: "Usuário e todos os seus registros foram excluídos permanentemente.",
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erro ao excluir usuário.";
    return {
      success: false,
      error: message,
    };
  }
}

export async function toggleUserRoleAction(
  userId: string,
  targetRole: UserRole
): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const admin = await requireAdmin();

    if (userId === admin.id && targetRole === "USER") {
      return {
        success: false,
        error: "Você não pode revogar o próprio papel de administrador.",
      };
    }

    const { db } = await import("@/lib/db");
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true },
    });

    if (!user) {
      return { success: false, error: "Usuário não encontrado." };
    }

    await updateAdminUser(userId, {
      name: user.name,
      email: user.email,
      role: targetRole,
    });

    revalidatePath("/admin");
    revalidatePath(`/admin/usuarios/${userId}`);

    return {
      success: true,
      message: `Papel do usuário alterado para ${targetRole} com sucesso!`,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erro ao alterar papel do usuário.";
    return {
      success: false,
      error: message,
    };
  }
}
