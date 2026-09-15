// @vitest-environment node
import { randomBytes, randomUUID } from "node:crypto";
import { afterAll, beforeAll, expect, it, vi } from "vitest";
import { createTestPrismaClient } from "@/test/create-test-prisma";
import { contractCatalog } from "@/features/contract/server/catalog";
import { ContractService, NEUTRAL_SHARED_STATE } from "./contract.service";
import { CoupleInviteService } from "./couple-invite.service";
import { CoupleService } from "./couple.service";

const db = createTestPrismaClient();
const catalog = structuredClone(contractCatalog);
catalog.version = `solo-${randomBytes(6).toString("hex")}`;
const service = new ContractService(db, catalog, () => {});
const invites = new CoupleInviteService(db, { appUrl: "https://example.test" });
const couples = new CoupleService(db);
const ids: string[] = [];
async function person() {
  const user = await db.user.create({ data: { name: "Pessoa de teste", email: `solo-${randomUUID()}@example.test` } });
  ids.push(user.id);
  return user;
}
beforeAll(() => { vi.stubEnv("CONTRACT_DATA_KEY", randomBytes(32).toString("base64")); });
afterAll(async () => {
  const members = await db.coupleMember.findMany({ where: { userId: { in: ids } } });
  const coupleIds = { in: members.map(m => m.coupleId) };
  const workspaces = await db.contractWorkspace.findMany({ where: { coupleId: coupleIds } });
  const workspaceId = { in: workspaces.map(w => w.id) };
  await db.contractPrivateReview.deleteMany({ where: { workspaceId } });
  await db.contractRecord.deleteMany({ where: { workspaceId } });
  await db.contractDocument.deleteMany({ where: { workspaceId } });
  await db.contractDecision.deleteMany({ where: { workspaceId } });
  await db.contractEvaluation.deleteMany({ where: { workspaceId } });
  await db.contractSession.deleteMany({ where: { workspaceId } });
  await db.contractWorkspace.deleteMany({ where: { id: workspaceId } });
  await db.contractEdition.deleteMany({ where: { version: catalog.version } });
  await db.coupleInvite.deleteMany({ where: { coupleId: coupleIds } });
  await db.coupleMember.deleteMany({ where: { coupleId: coupleIds } });
  await db.couple.deleteMany({ where: { id: coupleIds } });
  await db.user.deleteMany({ where: { id: { in: ids } } });
  await db.$disconnect(); vi.unstubAllEnvs();
});

async function complete(userId: string) {
  let own = (await service.getOwn(userId))!;
  await service.saveContext(userId, { sessionId: own.id, revision: own.revision, context: Object.fromEntries(Object.keys(catalog.contextDefinitions!).map(k => [k, false])) });
  own = (await service.getOwn(userId))!;
  for (const q of own.questions.filter(q => q.state === "NOT_ANSWERED")) {
    await service.saveAnswer(userId, { sessionId: own.id, revision: own.revision++, questionId: q.id, answer: "A", ...(q.id === "Q103" ? { neckCompressionReport: false } : {}) });
  }
  await service.submit(userId, own.id, own.revision);
  return (await service.getOwn(userId))!;
}

it("cada pessoa conclui antes do vínculo; o aceite preserva ambas e exige consentimentos novos", async () => {
  const a = await person(), b = await person();
  expect(await service.getOwn(a.id)).toBeNull();
  expect(await db.coupleMember.count({ where: { userId: a.id } })).toBe(0);
  await Promise.all([service.start(a.id), service.start(a.id)]);
  await service.start(b.id);
  expect(await couples.getOverview(a.id)).toEqual({ state: "NONE" });
  const beforeA = await complete(a.id), beforeB = await complete(b.id);
  expect(beforeA).toMatchObject({ coupleConnected: false, status: "SUBMITTED", consented: false });
  expect(beforeA.questions).toHaveLength(200);
  await expect(service.consent(a.id, beforeA.id, beforeA.revision, true)).rejects.toThrow("COUPLE_UNAVAILABLE");
  await expect(service.generate(a.id)).rejects.toThrow("COUPLE_UNAVAILABLE");
  const ciphertext = (await db.contractSession.findUniqueOrThrow({ where: { id: beforeB.id } })).payload;
  const invite = await invites.createWhatsAppInvite(a, "11987654321");
  expect((await service.getOwn(a.id))?.id).toBe(beforeA.id);
  await invites.acceptInvite(b, invite.inviteUrl.split("/").pop()!);
  const afterA = (await service.getOwn(a.id))!, afterB = (await service.getOwn(b.id))!;
  expect(afterA).toMatchObject({ id: beforeA.id, status: "SUBMITTED", coupleConnected: true, consented: false });
  expect(afterB).toMatchObject({ id: beforeB.id, status: "SUBMITTED", coupleConnected: true, consented: false });
  expect(afterA.questions).toEqual(beforeA.questions);
  expect(afterB.questions).toEqual(beforeB.questions);
  expect((await db.contractSession.findUniqueOrThrow({ where: { id: beforeB.id } })).payload).toBe(ciphertext);
  expect(await db.contractSession.count({ where: { userId: b.id } })).toBe(1);
  expect(await service.getShared(a.id)).toEqual(NEUTRAL_SHARED_STATE);
  await expect(service.saveAnswer(a.id, { sessionId: afterB.id, revision: afterB.revision, questionId: "Q001", answer: "C" })).rejects.toThrow("SESSION_UNAVAILABLE");
  await service.consent(a.id, afterA.id, afterA.revision, true);
  expect(await service.getShared(a.id)).toEqual(NEUTRAL_SHARED_STATE);
  await service.consent(b.id, afterB.id, afterB.revision, true);
  expect((await service.getShared(a.id)).state).toBe("AVAILABLE");
}, 120000);

it("preserva respostas ao cancelar um convite e ao aceitar convite de quem ainda não começou", async () => {
  const a = await person(), b = await person();
  await service.start(b.id);
  const own = (await service.getOwn(b.id))!;
  await service.saveAnswer(b.id, { sessionId: own.id, revision: own.revision, questionId: "Q001", answer: "B" });
  const cancelled = await invites.createWhatsAppInvite(b, "21987654321");
  await couples.cancelPendingCouple(b.id);
  expect(await invites.getInvitePreview(cancelled.inviteUrl.split("/").pop()!)).toEqual({ state: "CANCELLED" });
  expect(await couples.getOverview(b.id)).toEqual({ state: "NONE" });
  expect((await service.getOwn(b.id))?.questions[0].state).toBe("B");
  const invite = await invites.createWhatsAppInvite(a, "11987654321");
  await invites.acceptInvite(b, invite.inviteUrl.split("/").pop()!);
  expect(await service.getOwn(a.id)).toBeNull();
  const connected = (await service.getOwn(b.id))!;
  expect(connected.id).toBe(own.id);
  expect(connected.questions[0].state).toBe("B");
  await expect(service.saveAnswer(b.id, { sessionId: own.id, revision: own.revision, questionId: "Q001", answer: "C" })).rejects.toThrow("CONFLICT");
  await service.start(a.id);
  expect((await service.getOwn(a.id))?.questions[0].state).toBe("NOT_ANSWERED");
});

it("mantém a revisão privada disponível antes da conexão", async () => {
  const owner = await person(), reviewer = await person();
  vi.stubEnv("CONTRACT_REVIEWER_USER_IDS", reviewer.id);
  await service.start(owner.id);
  await service.requestPrivateReview(owner.id, reviewer.id, true);
  const reviews = await service.assignedReviews(reviewer.id);
  expect(reviews).toHaveLength(1);
  await service.decidePrivateReview(reviewer.id, reviews[0].id, "PAUSE");
  expect((await service.privateArea(owner.id)).reviews[0].status).toBe("PAUSE");
  expect((await service.getOperations(owner.id)).sharedEmergency).toEqual([]);
});

it("transfere registros privados sem recriptografar e revoga o revisor que se torna parceiro", async () => {
  const owner = await person(), partner = await person();
  vi.stubEnv("CONTRACT_REVIEWER_USER_IDS", partner.id);
  await service.start(owner.id);
  await service.start(partner.id);
  const own = (await service.getOwn(owner.id))!;
  const session = await db.contractSession.findUniqueOrThrow({ where: { id: own.id } });
  const data = { kind: "EMERGENCY", fields: Object.fromEntries(["contactName", "contactPhone", "careInstructions", "assistance"].map(key => [key, { value: "Somente o titular", shared: false }])) };
  await service.saveOwnRecord(owner.id, 0, data);
  const { id: recordId, payload } = await db.contractRecord.findFirstOrThrow({ where: { workspaceId: session.workspaceId, userId: owner.id, kind: "EMERGENCY" } });
  await service.requestPrivateReview(owner.id, partner.id, true);
  const [review] = await service.assignedReviews(partner.id);
  const invite = await invites.createWhatsAppInvite(partner, "11987654321");
  await invites.acceptInvite(owner, invite.inviteUrl.split("/").pop()!);
  const moved = await db.contractSession.findUniqueOrThrow({ where: { id: own.id } });
  expect(moved.workspaceId).not.toBe(session.workspaceId);
  expect(await db.contractRecord.findUniqueOrThrow({ where: { id: recordId } })).toMatchObject({ workspaceId: moved.workspaceId, payload });
  expect((await service.exportOwnData(owner.id)).records).toContainEqual({ kind: "EMERGENCY", data });
  expect((await service.exportOwnData(partner.id)).records).toEqual([]);
  expect(await service.assignedReviews(partner.id)).toEqual([]);
  await expect(service.decidePrivateReview(partner.id, review.id, "PAUSE")).rejects.toThrow("REVIEW_UNAVAILABLE");
  expect((await service.privateArea(owner.id)).reviews[0].status).toBe("REVOKED");
});
