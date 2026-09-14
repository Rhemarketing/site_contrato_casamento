import "server-only";
import type { PrismaClient } from "@/generated/prisma/client";
import { seal, unseal } from "@/features/contract/server/privacy";
export async function maintainContracts(client: PrismaClient, { apply = false, rotate = false, workspaceIds }: { apply?: boolean; rotate?: boolean; workspaceIds?: string[] } = {}) {
  if (rotate && !process.env.CONTRACT_DATA_KEYS) throw new Error("Keyring obrigatório para rotação");
  let workspaces = 0, payloads = 0;
  let cursor: string | undefined;
  const cutoff = new Date(Date.now() - 180 * 86400000);
  while (true) {
    const batch = await client.contractWorkspace.findMany({ where: { ...(workspaceIds ? { id: { in: workspaceIds, ...(cursor ? { gt: cursor } : {}) } } : {}), ...(!workspaceIds && cursor ? { id: { gt: cursor } } : {}), ...(!rotate ? { updatedAt: { lt: cutoff }, documents: { none: { status: { in: ["ACKNOWLEDGED", "ARCHIVED_ACKNOWLEDGED"] } } } } : {}) }, orderBy: { id: "asc" }, take: 25 });
    if (!batch.length) break;
    for (const workspace of batch) {
      await client.$transaction(async tx => {
        const fresh = await tx.contractWorkspace.findUniqueOrThrow({ where: { id: workspace.id }, include: { sessions: true, decisions: true, documents: true, evaluations: true, records: true, reviews: true } });
        if (!rotate && (fresh.documents.some(d => ["ACKNOWLEDGED", "ARCHIVED_ACKNOWLEDGED"].includes(d.status)) || fresh.updatedAt >= cutoff)) return;
        // All application mutations take the same workspace lock. Recheck above
        // before the lock itself updates the activity timestamp.
        if (apply) await tx.contractWorkspace.update({ where: { id: workspace.id }, data: { revision: { increment: 1 }, updatedAt: fresh.updatedAt } });
        if (rotate) {
          const collections = [
            { rows: fresh.sessions, scope: (row: (typeof fresh.sessions)[number]) => `${row.id}:${row.userId}`, update: (id: string, payload: string) => tx.contractSession.update({ where: { id }, data: { payload, updatedAt: fresh.sessions.find(r => r.id === id)!.updatedAt } }) },
            { rows: fresh.decisions, scope: (row: (typeof fresh.decisions)[number]) => row.id, update: (id: string, payload: string) => tx.contractDecision.update({ where: { id }, data: { payload } }) },
            { rows: fresh.documents, scope: (row: (typeof fresh.documents)[number]) => `${row.workspaceId}:${row.basisHash}`, update: (id: string, payload: string) => tx.contractDocument.update({ where: { id }, data: { payload } }) },
            { rows: fresh.evaluations, scope: (row: (typeof fresh.evaluations)[number]) => `${row.workspaceId}:${row.basisHash}`, update: (id: string, payload: string) => tx.contractEvaluation.update({ where: { id }, data: { payload } }) },
            { rows: fresh.records, scope: (row: (typeof fresh.records)[number]) => `record:${row.id}:${row.userId}`, update: (id: string, payload: string) => tx.contractRecord.update({ where: { id }, data: { payload, updatedAt: fresh.records.find(r => r.id === id)!.updatedAt } }) },
            { rows: fresh.reviews, scope: (row: (typeof fresh.reviews)[number]) => `review:${row.id}:${row.ownerId}:${row.reviewerId}`, update: (id: string, payload: string) => tx.contractPrivateReview.update({ where: { id }, data: { payload } }) },
          ];
          for (const collection of collections) for (const row of collection.rows) {
            // Scope callbacks are paired with their own collection above.
            const scope = (collection.scope as (row: unknown) => string)(row);
            const decrypted = unseal(row.payload, scope);
            if (apply) await collection.update(row.id, seal(decrypted, scope));
            payloads++;
          }
        } else if (apply) {
          const where = { workspaceId: workspace.id };
          await tx.contractPrivateReview.deleteMany({ where }); await tx.contractRecord.deleteMany({ where });
          await tx.contractDocument.deleteMany({ where }); await tx.contractEvaluation.deleteMany({ where });
          await tx.contractDecision.deleteMany({ where }); await tx.contractSession.deleteMany({ where });
          await tx.contractWorkspace.delete({ where: { id: workspace.id } });
        }
        workspaces++;
      }, { isolationLevel: "Serializable", timeout: 60000 });
    }
    cursor = batch.at(-1)!.id;
  }
  return { workspaces, payloads };
}
