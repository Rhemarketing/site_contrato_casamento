import type { Prisma } from "@/generated/prisma/client";
import { CoupleDomainError } from "./couple.errors";

// Called only inside the serializable transaction that changes the membership.
// Session/record/review ciphertext is scoped to stable IDs and owners, not couples.
export async function moveIndividualContractData(tx: Prisma.TransactionClient, userId: string, sourceCoupleId: string, targetCoupleId: string, memberId: string) {
  const source = await tx.couple.findUniqueOrThrow({ where: { id: sourceCoupleId }, include: { members: true } });
  if (source.status !== "PENDING" || source.members.length !== 1 || source.members[0].userId !== userId) {
    throw new CoupleDomainError("USER_ALREADY_COUPLED");
  }
  const workspaces = await tx.contractWorkspace.findMany({ where: { coupleId: sourceCoupleId }, include: { sessions: true, records: true, reviews: true, _count: { select: { decisions: true, documents: true, evaluations: true } } } });
  for (const workspace of workspaces) {
    if (workspace.sessions.some(s => s.userId !== userId) || workspace.records.some(r => r.userId !== userId)
      || workspace.reviews.some(r => r.ownerId !== userId) || Object.values(workspace._count).some(count => count > 0)) {
      throw new CoupleDomainError("COUPLE_CONFIGURATION_ERROR");
    }
    const target = await tx.contractWorkspace.findUnique({ where: { coupleId_editionId: { coupleId: targetCoupleId, editionId: workspace.editionId } } });
    if (!target) {
      await tx.contractWorkspace.update({ where: { id: workspace.id }, data: { coupleId: targetCoupleId, revision: { increment: 1 } } });
      await tx.contractSession.updateMany({ where: { workspaceId: workspace.id, userId }, data: { memberId, consentedAt: null, revision: { increment: 1 } } });
    } else {
      await tx.contractWorkspace.update({ where: { id: target.id }, data: { revision: { increment: 1 } } });
      await tx.contractSession.updateMany({ where: { workspaceId: workspace.id, userId }, data: { workspaceId: target.id, memberId, consentedAt: null, revision: { increment: 1 } } });
      await tx.contractRecord.updateMany({ where: { workspaceId: workspace.id, userId }, data: { workspaceId: target.id } });
      await tx.contractPrivateReview.updateMany({ where: { workspaceId: workspace.id, ownerId: userId }, data: { workspaceId: target.id } });
      await tx.contractWorkspace.delete({ where: { id: workspace.id } });
    }
  }
}
