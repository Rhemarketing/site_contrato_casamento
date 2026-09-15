import "server-only";
import type { Prisma } from "@/generated/prisma/client";

// Resolve access on every request: sharing follows the current active couple,
// without creating a second purchase that would survive a revoked entitlement.
export async function getContractPurchaseAccess(userId: string, client: Prisma.TransactionClient) {
  const own = await client.contractPurchase.findUnique({ where: { userId } });
  const isActive = (purchase: typeof own) => purchase?.productCode === "CONTRATO_CASAMENTO"
    && purchase.status === "PAID" && !purchase.revokedAt;
  if (isActive(own)) return own;

  const membership = await client.coupleMember.findUnique({
    where: { activeMembershipKey: userId },
    include: { couple: { include: { members: { include: { user: { select: { contractPurchase: true } } } } } } },
  });
  if (membership?.userId === userId && membership.couple.status === "ACTIVE") {
    const partner = membership.couple.members.find(member => member.userId !== userId
      && member.activeMembershipKey === member.userId && isActive(member.user.contractPurchase));
    if (partner) return partner.user.contractPurchase;
  }
  return null;
}
