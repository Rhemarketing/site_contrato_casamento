import type { PrismaClient } from "@/generated/prisma/client";
import type { CoupleOverviewDto } from "@/types/couple";
import { CoupleDomainError } from "./couple.errors";
import { moveIndividualContractData } from "./contract-connection";

export class CoupleService {
  constructor(private readonly client: PrismaClient) {}

  async getOverview(userId: string): Promise<CoupleOverviewDto> {
    const membership = await this.client.coupleMember.findUnique({
      where: { activeMembershipKey: userId },
      select: {
        userId: true,
        role: true,
        joinedAt: true,
        couple: {
          select: {
            status: true,
            members: {
              orderBy: { joinedAt: "asc" },
              select: { userId: true, role: true, user: { select: { name: true, email: true } } },
            },
            invites: {
              where: { status: "PENDING" },
              orderBy: { createdAt: "desc" },
              take: 1,
              select: { email: true, whatsappPhone: true, status: true, expiresAt: true },
            },
          },
        },
      },
    });

    if (!membership) return { state: "NONE" };

    if (membership.couple.status === "PENDING") {
      if (membership.role !== "CREATOR" || membership.couple.members.some(({ role }) => role === "PARTNER")) {
        throw new CoupleDomainError("COUPLE_CONFIGURATION_ERROR");
      }
      const invite = membership.couple.invites[0];
      if (!invite) return { state: "NONE" };
      return {
        state: "PENDING",
        role: "CREATOR",
        invite: invite
          ? { email: invite.email, whatsappPhone: invite.whatsappPhone, status: "PENDING", expiresAt: invite.expiresAt.toISOString() }
          : null,
      };
    }

    if (membership.couple.status === "ACTIVE") {
      const partner = membership.couple.members.find(({ userId }) => userId !== membership.userId);
      const roles = new Set(membership.couple.members.map(({ role }) => role));
      if (membership.couple.members.length !== 2 || roles.size !== 2 || !partner) {
        throw new CoupleDomainError("COUPLE_CONFIGURATION_ERROR");
      }
      return {
        state: "ACTIVE",
        role: membership.role,
        partner: { name: partner.user.name, email: partner.user.email },
        joinedAt: membership.joinedAt.toISOString(),
      };
    }

    throw new CoupleDomainError("COUPLE_CONFIGURATION_ERROR");
  }

  async cancelPendingCouple(userId: string) {
    return this.client.$transaction(async (transaction) => {
      const membership = await transaction.coupleMember.findUnique({
        where: { activeMembershipKey: userId },
        select: {
          id: true,
          role: true,
          couple: { select: { id: true, status: true, members: { select: { role: true } } } },
        },
      });
      if (!membership) throw new CoupleDomainError("COUPLE_NOT_FOUND");
      if (
        membership.role !== "CREATOR" ||
        membership.couple.status !== "PENDING" ||
        membership.couple.members.some(({ role }) => role === "PARTNER")
      ) {
        throw new CoupleDomainError("COUPLE_NOT_PENDING");
      }

      await transaction.coupleInvite.updateMany({
        where: { coupleId: membership.couple.id, status: "PENDING" },
        data: { status: "CANCELLED", activeInviteKey: null },
      });
      // Cancelling a pending invitation must not strand the owner's questionnaire.
      if (await transaction.contractWorkspace.count({ where: { coupleId: membership.couple.id } })) {
        await transaction.coupleMember.update({ where: { id: membership.id }, data: { activeMembershipKey: null } });
        const solo = await transaction.couple.create({ data: { status: "PENDING", members: { create: { userId, role: "CREATOR", activeMembershipKey: userId } } }, include: { members: true } });
        await moveIndividualContractData(transaction, userId, membership.couple.id, solo.id, solo.members[0].id);
      }
      const deactivated = await transaction.couple.updateMany({
        where: { id: membership.couple.id, status: "PENDING" },
        data: { status: "INACTIVE" },
      });
      if (deactivated.count !== 1) throw new CoupleDomainError("COUPLE_NOT_PENDING");
      await transaction.coupleMember.update({
        where: { id: membership.id },
        data: { activeMembershipKey: null },
      });
      return { state: "INACTIVE" as const };
    }, { isolationLevel: "Serializable" });
  }
}
