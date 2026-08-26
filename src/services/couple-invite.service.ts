import type { PrismaClient } from "@/generated/prisma/client";
import { getAppUrl } from "@/config/env";
import { normalizeEmail } from "@/lib/email";
import {
  generateInviteToken,
  getCoupleInviteExpiration,
  hashInviteToken,
  validateInviteTokenFormat,
} from "@/lib/couple-invite-token";
import type { CoupleInvitePreviewDto, CreatedCoupleInviteDto } from "@/types/couple";
import { CoupleDomainError } from "./couple.errors";

type AuthenticatedCoupleUser = { id: string; email: string };
type CoupleInviteServiceOptions = {
  now?: () => Date;
  generateToken?: () => string;
  appUrl?: string;
};

function maskEmail(email: string) {
  const [local, domain] = email.split("@");
  return `${local.slice(0, 1)}***@${domain}`;
}

function prismaErrorCode(error: unknown) {
  return typeof error === "object" && error !== null && "code" in error ? String(error.code) : "";
}

export class CoupleInviteService {
  private readonly now: () => Date;
  private readonly generateToken: () => string;
  private readonly configuredAppUrl?: string;

  constructor(private readonly client: PrismaClient, options: CoupleInviteServiceOptions = {}) {
    this.now = options.now ?? (() => new Date());
    this.generateToken = options.generateToken ?? generateInviteToken;
    this.configuredAppUrl = options.appUrl;
  }

  private async withConflictRetry<T>(operation: () => Promise<T>) {
    let lastError: unknown;
    for (let attempt = 0; attempt < 5; attempt += 1) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        if (!['P2002', 'P2034'].includes(prismaErrorCode(error))) throw error;
      }
    }
    throw lastError instanceof CoupleDomainError
      ? lastError
      : new CoupleDomainError("INVITE_OPERATION_CONFLICT");
  }

  async createInvite(user: AuthenticatedCoupleUser, recipientEmail: string): Promise<CreatedCoupleInviteDto> {
    const normalizedRecipientEmail = normalizeEmail(recipientEmail);
    if (normalizedRecipientEmail === normalizeEmail(user.email)) {
      throw new CoupleDomainError("SELF_INVITE_NOT_ALLOWED");
    }
    const token = this.generateToken();
    const tokenHash = hashInviteToken(token);
    const now = this.now();
    const expiresAt = getCoupleInviteExpiration(now);

    await this.withConflictRetry(() => this.client.$transaction(async (transaction) => {
      const currentMembership = await transaction.coupleMember.findUnique({
        where: { activeMembershipKey: user.id },
        select: { role: true, couple: { select: { id: true, status: true } } },
      });

      let coupleId: string;
      if (currentMembership) {
        if (currentMembership.couple.status === "ACTIVE") throw new CoupleDomainError("COUPLE_ALREADY_ACTIVE");
        if (currentMembership.couple.status !== "PENDING" || currentMembership.role !== "CREATOR") {
          throw new CoupleDomainError("USER_ALREADY_COUPLED");
        }
        coupleId = currentMembership.couple.id;
      } else {
        const couple = await transaction.couple.create({ data: { status: "PENDING" }, select: { id: true } });
        await transaction.coupleMember.create({
          data: { coupleId: couple.id, userId: user.id, role: "CREATOR", activeMembershipKey: user.id },
        });
        coupleId = couple.id;
      }

      await transaction.coupleInvite.updateMany({
        where: { coupleId, status: "PENDING" },
        data: { status: "CANCELLED", activeInviteKey: null },
      });
      await transaction.coupleInvite.create({
        data: {
          coupleId,
          createdByUserId: user.id,
          email: normalizedRecipientEmail,
          tokenHash,
          activeInviteKey: coupleId,
          status: "PENDING",
          expiresAt,
        },
      });
    }, { isolationLevel: "Serializable" }));

    const appUrl = this.configuredAppUrl ?? getAppUrl();
    return { inviteUrl: `${appUrl}/convite/${token}`, expiresAt: expiresAt.toISOString() };
  }

  async cancelInvite(userId: string) {
    return this.client.$transaction(async (transaction) => {
      const membership = await transaction.coupleMember.findUnique({
        where: { activeMembershipKey: userId },
        select: { role: true, couple: { select: { id: true, status: true } } },
      });
      if (!membership || membership.role !== "CREATOR" || membership.couple.status !== "PENDING") {
        throw new CoupleDomainError("INVITE_FORBIDDEN");
      }
      const cancelled = await transaction.coupleInvite.updateMany({
        where: { coupleId: membership.couple.id, status: "PENDING" },
        data: { status: "CANCELLED", activeInviteKey: null },
      });
      if (cancelled.count !== 1) throw new CoupleDomainError("INVITE_NOT_FOUND");
      return { status: "CANCELLED" as const };
    }, { isolationLevel: "Serializable" });
  }

  async getInvitePreview(token: string): Promise<CoupleInvitePreviewDto> {
    if (!validateInviteTokenFormat(token)) return { state: "UNAVAILABLE" };
    const invite = await this.client.coupleInvite.findUnique({
      where: { tokenHash: hashInviteToken(token) },
      select: {
        status: true,
        email: true,
        expiresAt: true,
        createdBy: { select: { name: true } },
      },
    });
    if (!invite) return { state: "UNAVAILABLE" };
    if (invite.status === "CANCELLED") return { state: "CANCELLED" };
    if (invite.status === "ACCEPTED") return { state: "ACCEPTED" };
    if (invite.status === "EXPIRED" || invite.expiresAt <= this.now()) return { state: "EXPIRED" };
    return {
      state: "AVAILABLE",
      creatorName: invite.createdBy.name,
      recipientEmail: maskEmail(invite.email),
      expiresAt: invite.expiresAt.toISOString(),
    };
  }

  async acceptInvite(user: AuthenticatedCoupleUser, token: string) {
    if (!validateInviteTokenFormat(token)) throw new CoupleDomainError("INVITE_NOT_FOUND");
    const tokenHash = hashInviteToken(token);

    return this.withConflictRetry(() => this.client.$transaction(async (transaction) => {
      const now = this.now();
      const invite = await transaction.coupleInvite.findUnique({
        where: { tokenHash },
        select: {
          id: true,
          coupleId: true,
          createdByUserId: true,
          email: true,
          status: true,
          expiresAt: true,
          couple: { select: { status: true } },
        },
      });
      if (!invite) throw new CoupleDomainError("INVITE_NOT_FOUND");
      if (invite.status === "CANCELLED") throw new CoupleDomainError("INVITE_CANCELLED");
      if (invite.status === "ACCEPTED") throw new CoupleDomainError("INVITE_ALREADY_USED");
      if (invite.status === "EXPIRED" || invite.expiresAt <= now) throw new CoupleDomainError("INVITE_EXPIRED");
      if (invite.createdByUserId === user.id) throw new CoupleDomainError("INVITE_FORBIDDEN");
      if (normalizeEmail(invite.email) !== normalizeEmail(user.email)) {
        throw new CoupleDomainError("INVITE_EMAIL_MISMATCH");
      }
      if (invite.couple.status !== "PENDING") throw new CoupleDomainError("INVITE_ALREADY_USED");

      const currentMembership = await transaction.coupleMember.findUnique({
        where: { activeMembershipKey: user.id },
        select: { coupleId: true },
      });
      if (currentMembership) throw new CoupleDomainError("USER_ALREADY_COUPLED");

      const claimed = await transaction.coupleInvite.updateMany({
        where: {
          id: invite.id,
          status: "PENDING",
          acceptedAt: null,
          expiresAt: { gt: now },
          activeInviteKey: invite.coupleId,
        },
        data: { status: "ACCEPTED", acceptedAt: now, activeInviteKey: null },
      });
      if (claimed.count !== 1) throw new CoupleDomainError("INVITE_ALREADY_USED");

      await transaction.coupleMember.create({
        data: {
          coupleId: invite.coupleId,
          userId: user.id,
          role: "PARTNER",
          activeMembershipKey: user.id,
          joinedAt: now,
        },
      });
      const activated = await transaction.couple.updateMany({
        where: { id: invite.coupleId, status: "PENDING" },
        data: { status: "ACTIVE" },
      });
      if (activated.count !== 1) throw new CoupleDomainError("INVITE_ALREADY_USED");
      return { state: "ACTIVE" as const };
    }, { isolationLevel: "Serializable" }));
  }
}
