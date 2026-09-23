import "server-only";

import { db } from "@/lib/db";
import { hashPassword } from "@/lib/password";
import type { UserRole, CoupleStatus } from "@/generated/prisma/enums";
import type { Prisma } from "@/generated/prisma/client";

export interface AdminUserListItem {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
  partner: {
    id: string;
    name: string;
    email: string;
    role: string;
    joinedAt: Date;
  } | null;
  pendingInvite: {
    id: string;
    whatsappPhone: string | null;
    email: string | null;
    expiresAt: Date;
    createdAt: Date;
  } | null;
  coupleStatus: CoupleStatus | null;
  admissionStatus: {
    status: string;
    totalScore: number | null;
    completedAt: Date | null;
    startedAt: Date;
    attemptId: string;
  } | null;
  contractStatus: string;
}

export interface AdminDashboardStats {
  totalUsers: number;
  totalAdmins: number;
  activeCouples: number;
  completedAttempts: number;
  contractWorkspaces: number;
}

export interface UpdateAdminUserInput {
  name: string;
  email: string;
  role: UserRole;
  password?: string;
}

export async function getAdminDashboardStats(): Promise<AdminDashboardStats> {
  const [totalUsers, totalAdmins, activeCouples, completedAttempts, contractWorkspaces] = await Promise.all([
    db.user.count(),
    db.user.count({ where: { role: "ADMIN" } }),
    db.couple.count({ where: { status: "ACTIVE" } }),
    db.questionnaireAttempt.count({ where: { status: "COMPLETED" } }),
    db.contractWorkspace.count(),
  ]);

  return {
    totalUsers,
    totalAdmins,
    activeCouples,
    completedAttempts,
    contractWorkspaces,
  };
}

export async function getAdminUsersList(search?: string, roleFilter?: UserRole): Promise<AdminUserListItem[]> {
  const where: Prisma.UserWhereInput = {};

  if (search && search.trim()) {
    const term = search.trim();
    where.OR = [
      { name: { contains: term } },
      { email: { contains: term } },
    ];
  }

  if (roleFilter) {
    where.role = roleFilter;
  }

  const users = await db.user.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      coupleMemberships: {
        include: {
          couple: {
            include: {
              members: {
                include: {
                  user: {
                    select: { id: true, name: true, email: true },
                  },
                },
              },
              invites: {
                where: { status: "PENDING" },
                orderBy: { createdAt: "desc" },
                take: 1,
              },
            },
          },
        },
      },
      attempts: {
        orderBy: { startedAt: "desc" },
        take: 1,
        select: {
          id: true,
          status: true,
          totalScore: true,
          startedAt: true,
          completedAt: true,
        },
      },
      contractPurchase: {
        select: { status: true, acquiredAt: true },
      },
      contractSessions: {
        orderBy: { updatedAt: "desc" },
        take: 1,
        select: { status: true, submittedAt: true },
      },
    },
  });

  return users.map((user) => {
    // Buscar parceiro e convite pendente
    let partner = null;
    let pendingInvite = null;
    let coupleStatus: CoupleStatus | null = null;

    const membership = user.coupleMemberships[0];
    if (membership?.couple) {
      coupleStatus = membership.couple.status;

      const otherMember = membership.couple.members.find((m) => m.userId !== user.id);
      if (otherMember?.user) {
        partner = {
          id: otherMember.user.id,
          name: otherMember.user.name,
          email: otherMember.user.email,
          role: otherMember.role,
          joinedAt: otherMember.joinedAt,
        };
      }

      const invite = membership.couple.invites[0];
      if (invite) {
        pendingInvite = {
          id: invite.id,
          whatsappPhone: invite.whatsappPhone,
          email: invite.email,
          expiresAt: invite.expiresAt,
          createdAt: invite.createdAt,
        };
      }
    }

    // Status do Questionário de Admissão (40 perguntas)
    const latestAttempt = user.attempts[0];
    const admissionStatus = latestAttempt
      ? {
          status: latestAttempt.status,
          totalScore: latestAttempt.totalScore ? Number(latestAttempt.totalScore) : null,
          completedAt: latestAttempt.completedAt,
          startedAt: latestAttempt.startedAt,
          attemptId: latestAttempt.id,
        }
      : null;

    // Status da Jornada do Contrato
    let contractStatus = "Não iniciado";
    if (user.contractSessions.length > 0) {
      const session = user.contractSessions[0];
      if (session.status === "SUBMITTED" || session.submittedAt) {
        contractStatus = "Respostas enviadas";
      } else {
        contractStatus = "Questionário em andamento";
      }
    } else if (user.contractPurchase) {
      contractStatus = "Comprado (Liberado)";
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      partner,
      pendingInvite,
      coupleStatus,
      admissionStatus,
      contractStatus,
    };
  });
}

export async function getAdminUserDetails(userId: string) {
  const user = await db.user.findUnique({
    where: { id: userId },
    include: {
      coupleMemberships: {
        include: {
          couple: {
            include: {
              members: {
                include: {
                  user: {
                    select: { id: true, name: true, email: true, role: true, createdAt: true },
                  },
                },
              },
              invites: {
                orderBy: { createdAt: "desc" },
              },
              comparisonConsents: true,
              contractWorkspaces: {
                include: {
                  sessions: true,
                  decisions: { orderBy: { revision: "desc" } },
                  documents: { orderBy: { createdAt: "desc" }, take: 1 },
                },
              },
            },
          },
        },
      },
      attempts: {
        orderBy: { startedAt: "desc" },
        include: {
          areaResults: {
            orderBy: { area: "asc" },
          },
          resultFlags: true,
          answers: {
            include: {
              question: true,
              option: true,
            },
            orderBy: { question: { order: "asc" } },
          },
        },
      },
      contractPurchase: true,
      contractSessions: true,
    },
  });

  if (!user) return null;

  // Extrair detalhes do parceiro e casal
  let partner = null;
  let couple = null;
  type CoupleData = NonNullable<typeof user>["coupleMemberships"][number]["couple"];
  let invites: CoupleData["invites"] = [];
  let workspaces: CoupleData["contractWorkspaces"] = [];

  const membership = user.coupleMemberships[0];
  if (membership?.couple) {
    couple = {
      id: membership.couple.id,
      status: membership.couple.status,
      createdAt: membership.couple.createdAt,
      myRole: membership.role,
      joinedAt: membership.joinedAt,
    };

    const otherMember = membership.couple.members.find((m) => m.userId !== user.id);
    if (otherMember?.user) {
      partner = {
        id: otherMember.user.id,
        name: otherMember.user.name,
        email: otherMember.user.email,
        role: otherMember.role,
        joinedAt: otherMember.joinedAt,
      };
    }

    invites = membership.couple.invites;
    workspaces = membership.couple.contractWorkspaces;
  }

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    },
    couple,
    partner,
    invites,
    attempts: user.attempts.map((attempt) => ({
      id: attempt.id,
      status: attempt.status,
      version: attempt.questionnaireVersion,
      totalScore: attempt.totalScore ? Number(attempt.totalScore) : null,
      startedAt: attempt.startedAt,
      completedAt: attempt.completedAt,
      areaResults: attempt.areaResults.map((area) => ({
        id: area.id,
        area: area.area,
        score: Number(area.score),
        maxScore: Number(area.maxScore),
        averageScore: Number(area.averageScore),
        classification: area.classification,
      })),
      resultFlags: attempt.resultFlags.map((flag) => ({
        id: flag.id,
        code: flag.code,
        severity: flag.severity,
      })),
      answers: attempt.answers.map((answer) => ({
        id: answer.id,
        questionOrder: answer.question.order,
        questionCode: answer.question.code,
        questionArea: answer.question.area,
        questionStage: answer.question.stage,
        questionText: answer.question.text,
        chosenLetter: answer.option.letter,
        chosenText: answer.option.text,
        score: answer.score ? Number(answer.score) : 0,
        answeredAt: answer.answeredAt,
      })),
    })),
    contract: {
      purchase: user.contractPurchase,
      sessions: user.contractSessions,
      workspaces: workspaces.map((w) => ({
        id: w.id,
        revision: w.revision,
        decisionsCount: w.decisions.length,
        hasDocument: w.documents.length > 0,
        latestDocumentStatus: w.documents[0]?.status ?? null,
      })),
    },
  };
}

export async function updateAdminUser(userId: string, input: UpdateAdminUserInput) {
  const existing = await db.user.findFirst({
    where: {
      email: input.email.trim().toLowerCase(),
      NOT: { id: userId },
    },
  });

  if (existing) {
    throw new Error("Este endereço de e-mail já está sendo utilizado por outro usuário.");
  }

  const updateData: Prisma.UserUpdateInput = {
    name: input.name.trim(),
    email: input.email.trim().toLowerCase(),
    role: input.role,
  };

  if (input.password && input.password.trim().length >= 6) {
    updateData.passwordHash = await hashPassword(input.password.trim());
  }

  return db.user.update({
    where: { id: userId },
    data: updateData,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      updatedAt: true,
    },
  });
}

export async function deleteAdminUserCascade(userId: string, currentAdminId: string) {
  if (userId === currentAdminId) {
    throw new Error("Você não pode excluir sua própria conta enquanto estiver conectado.");
  }

  return db.$transaction(async (tx) => {
    // 1. Obter todas as tentativas do usuário
    const attempts = await tx.questionnaireAttempt.findMany({
      where: { userId },
      select: { id: true },
    });
    const attemptIds = attempts.map((a) => a.id);

    if (attemptIds.length > 0) {
      await tx.answer.deleteMany({ where: { attemptId: { in: attemptIds } } });
      await tx.areaResult.deleteMany({ where: { attemptId: { in: attemptIds } } });
      await tx.resultFlag.deleteMany({ where: { attemptId: { in: attemptIds } } });
      await tx.questionnaireAttempt.deleteMany({ where: { id: { in: attemptIds } } });
    }

    // 2. Tokens de redefinição de senha
    await tx.passwordResetToken.deleteMany({ where: { userId } });

    // 3. Consentimentos de comparação
    await tx.coupleComparisonConsent.deleteMany({ where: { userId } });

    // 4. Convites criados pelo usuário
    await tx.coupleInvite.deleteMany({ where: { createdByUserId: userId } });

    // 5. Registros de contrato e revisões
    await tx.contractPrivateReview.deleteMany({
      where: { OR: [{ ownerId: userId }, { reviewerId: userId }] },
    });
    await tx.contractRecord.deleteMany({ where: { userId } });
    await tx.contractSession.deleteMany({ where: { userId } });
    await tx.contractPurchase.deleteMany({ where: { userId } });

    // 6. Membros de casal e integridade do casal
    const memberships = await tx.coupleMember.findMany({
      where: { userId },
      select: { id: true, coupleId: true },
    });

    for (const membership of memberships) {
      const remainingMembers = await tx.coupleMember.findMany({
        where: {
          coupleId: membership.coupleId,
          NOT: { id: membership.id },
        },
      });

      if (remainingMembers.length === 0) {
        // Casal não tem outros membros: remover workspaces e registros vinculados
        const workspaces = await tx.contractWorkspace.findMany({
          where: { coupleId: membership.coupleId },
          select: { id: true },
        });
        const workspaceIds = workspaces.map((w) => w.id);

        if (workspaceIds.length > 0) {
          await tx.contractDocument.deleteMany({ where: { workspaceId: { in: workspaceIds } } });
          await tx.contractDecision.deleteMany({ where: { workspaceId: { in: workspaceIds } } });
          await tx.contractEvaluation.deleteMany({ where: { workspaceId: { in: workspaceIds } } });
          await tx.contractSession.deleteMany({ where: { workspaceId: { in: workspaceIds } } });
          await tx.contractRecord.deleteMany({ where: { workspaceId: { in: workspaceIds } } });
          await tx.contractPrivateReview.deleteMany({ where: { workspaceId: { in: workspaceIds } } });
          await tx.contractWorkspace.deleteMany({ where: { id: { in: workspaceIds } } });
        }

        await tx.coupleInvite.deleteMany({ where: { coupleId: membership.coupleId } });
        await tx.coupleComparisonConsent.deleteMany({ where: { coupleId: membership.coupleId } });
        await tx.coupleMember.delete({ where: { id: membership.id } });
        await tx.couple.delete({ where: { id: membership.coupleId } });
      } else {
        // Outro membro permanece ativo: desvincular o usuário e deixar o casal em PENDING
        await tx.coupleMember.delete({ where: { id: membership.id } });
        await tx.couple.update({
          where: { id: membership.coupleId },
          data: { status: "PENDING" },
        });
      }
    }

    // 7. Finalmente, remover o usuário
    return tx.user.delete({ where: { id: userId } });
  });
}
