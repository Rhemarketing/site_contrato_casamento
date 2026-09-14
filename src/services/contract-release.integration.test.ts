// @vitest-environment node
import { randomBytes, randomUUID } from "node:crypto";
import { afterAll, beforeAll, expect, it, vi } from "vitest";
import { createTestPrismaClient } from "@/test/create-test-prisma";
import { contractCatalog } from "@/features/contract/server/catalog";
import { ContractService, NEUTRAL_SHARED_STATE } from "./contract.service";
import type { DecisionColumn, DecisionField, Facts } from "@/features/contract/domain/types";
import { maintainContracts } from "./contract-maintenance.service";

const db = createTestPrismaClient();
const catalog = structuredClone(contractCatalog);
catalog.version = `release-test-${randomBytes(4).toString("hex")}`;
// Exercise the actual release rules before enabling the deployment gate.
catalog.productionReady = true;
const service = new ContractService(db, catalog, () => {});
const ids: string[] = [];
let coupleId: string;
const sample = (field: DecisionColumn | DecisionField): string => field.options?.[0] ?? ({ member: "1", date: "2027-01-15", time: "08:00", money: "100", percent: "5", number: "20", amountOrPercent: "5%" } as Record<string, string>)[field.type] ?? "Acordo de teste";
beforeAll(async () => {
  vi.stubEnv("CONTRACT_DATA_KEY", randomBytes(32).toString("base64"));
  for (const name of ["Alice", "Bruno", "Revisor", "Admin externo"]) {
    const user = await db.user.create({ data: { name, email: `rel-${randomBytes(6).toString("hex")}@teste.local`, role: name === "Admin externo" ? "ADMIN" : "USER" } }); ids.push(user.id);
  }
  const couple = await db.couple.create({ data: { status: "ACTIVE", members: { create: [{ userId: ids[0], activeMembershipKey: ids[0], role: "CREATOR" }, { userId: ids[1], activeMembershipKey: ids[1], role: "PARTNER" }] } } });
  coupleId = couple.id;
  vi.stubEnv("CONTRACT_REVIEWER_USER_IDS", ids[2]);
});
afterAll(async () => {
  const workspaces = await db.contractWorkspace.findMany({ where: { coupleId } });
  const ws = { in: workspaces.map(w => w.id) };
  await db.contractPrivateReview.deleteMany({ where: { workspaceId: ws } });
  await db.contractRecord.deleteMany({ where: { workspaceId: ws } });
  await db.contractDocument.deleteMany({ where: { workspaceId: ws } });
  await db.contractDecision.deleteMany({ where: { workspaceId: ws } });
  await db.contractEvaluation.deleteMany({ where: { workspaceId: ws } });
  await db.contractSession.deleteMany({ where: { workspaceId: ws } });
  await db.contractWorkspace.deleteMany({ where: { id: ws } });
  await db.contractEdition.deleteMany({ where: { version: catalog.version } });
  if (coupleId) { await db.coupleMember.deleteMany({ where: { coupleId } }); await db.couple.delete({ where: { id: coupleId } }); }
  await db.user.deleteMany({ where: { id: { in: ids } } });
  await db.$disconnect(); vi.unstubAllEnvs();
});

it("completa os dois questionários reais, confirma decisões e gera apenas textos registrados", async () => {
  for (const userId of ids.slice(0, 2)) {
    await service.start(userId);
    let own = (await service.getOwn(userId))!;
    await service.saveContext(userId, { sessionId: own.id, revision: own.revision, context: Object.fromEntries(Object.keys(catalog.contextDefinitions!).map(k => [k, false])) });
    own = (await service.getOwn(userId))!;
    for (const question of own.questions.filter(q => q.state === "NOT_ANSWERED")) {
      await service.saveAnswer(userId, { sessionId: own.id, revision: own.revision, questionId: question.id, answer: "A", ...(question.id === "Q103" ? { neckCompressionReport: false } : {}) });
      own.revision++;
    }
    await service.submit(userId, own.id, own.revision);
    await service.consent(userId, own.id, own.revision + 1, true);
  }
  for (const userId of ids.slice(0, 2)) {
    const shared = await service.getShared(userId);
    expect(shared.state).toBe("AVAILABLE");
    const facts: Facts = Object.fromEntries(shared.facts!.fields.map(f => [f.id, false]));
    await service.saveJointFacts(userId, shared.facts!.revision, facts);
  }
  const shared = await service.getShared(ids[0]);
  expect(shared.modules.length).toBeGreaterThan(5);
  for (const definition of shared.modules) {
    const option = definition.options[0];
    const parameters = Object.fromEntries(option.fields.map(key => {
      const field = definition.fieldDefinitions![key];
      return [key, [field.type === "table" ? JSON.stringify(field.columns!.map(sample)) : sample(field)]];
    }));
    await service.propose(ids[0], { moduleId: definition.id, revision: definition.revision, choice: option.code, parameters });
    const proposal = (await service.getShared(ids[0])).modules.find(m => m.id === definition.id)!;
    expect(proposal.preview?.join("\n")).not.toMatch(/[{}]|undefined|%%/);
    await service.confirm(ids[0], definition.id, proposal.hash!, true);
    await service.confirm(ids[1], definition.id, proposal.hash!, true);
  }
  expect(await service.generate(ids[0])).toMatchObject({ state: "DRAFT" });
  const draft = await service.getDraft(ids[1]);
  expect(draft?.sections.length).toBeGreaterThan(5);
  expect(draft?.sections.flatMap(s => s.paragraphs).join("\n")).not.toMatch(/[{}]|undefined|ALERTA_|MODO_DE/);
  expect(draft?.provenance.some(p => p.componentId === "OUT-Q154-FIXED")).toBe(true);
  const privateQuestions = new Set(catalog.questions.filter(q => q.options.some(o => o.privacy !== "COMMON")).map(q => q.id));
  expect(draft?.provenance.filter(p => /^OUT-(?:PAIR-)?Q/.test(p.componentId) && p.componentId !== "OUT-Q154-FIXED").some(p => privateQuestions.has(p.componentId.match(/Q\d{3}/)![0]))).toBe(false);
}, 90000);

it("vincula aceites ao documento e exige confirmação bilateral do cofrinho, com contestação", async () => {
  const draft = (await service.getDraft(ids[0]))!;
  await expect(service.acceptDocument(ids[3], draft.contentHash)).rejects.toThrow("COUPLE_UNAVAILABLE");
  await service.acceptDocument(ids[0], draft.contentHash);
  await service.acceptDocument(ids[0], draft.contentHash);
  expect(await service.documentAcceptances(ids[1], draft.contentHash)).toHaveLength(1);
  expect((await service.getFund(ids[0])).available).toBe(false);
  await service.acceptDocument(ids[1], draft.contentHash);
  expect(await service.documentAcceptances(ids[1], draft.contentHash)).toHaveLength(2);
  expect(await service.documentHistory(ids[1])).toHaveLength(1);
  const input = { documentHash: draft.contentHash, process: "CONVERSA_GERAL", reference: "Conversa acordada na segunda", refusalOfAgreedProcess: true, noLegitimateImpediment: true, noExcludedContext: true, voluntary: true };
  await expect(service.proposeFund(ids[0], { ...input, amountCents: 5000 })).rejects.toThrow();
  await expect(service.proposeFund(ids[0], { ...input, noExcludedContext: false })).rejects.toThrow();
  await service.proposeFund(ids[0], input); await service.proposeFund(ids[1], input);
  const fund = await service.getFund(ids[1]); expect(fund.entries).toHaveLength(1); expect(fund.totalCents).toBe(0);
  const entry = fund.entries[0];
  await service.confirmFund(ids[0], entry.id, entry.hash, true);
  expect((await service.getFund(ids[1])).totalCents).toBe(0);
  await service.confirmFund(ids[1], entry.id, entry.hash, true);
  expect((await service.getFund(ids[0])).totalCents).toBe(1000);
  await service.confirmFund(ids[1], entry.id, entry.hash, false);
  expect((await service.getFund(ids[0])).totalCents).toBe(0);
  await expect(service.confirmFund(ids[0], entry.id, entry.hash, true)).rejects.toThrow("CONFLICT");
});

it("isola registros operacionais e exportação e permite revogar cada campo compartilhado", async () => {
  const event = { kind: "EVENT", id: randomUUID(), topicId: randomUUID(), topic: "Assunto privado exclusivo", type: "ISSUE", at: new Date(Date.now() - 3600000).toISOString(), timeZone: "America/Sao_Paulo", impediment: false, outcome: "SEM_MELHORA", safeToDiscuss: true };
  await service.saveOwnRecord(ids[0], 0, event);
  await expect(service.saveOwnRecord(ids[0], 0, event)).rejects.toThrow("CONFLICT");
  const owner = await service.getOperations(ids[0]);
  const other = await service.getOperations(ids[1]);
  expect(owner.tasks).toHaveLength(1); expect(other.own).toHaveLength(0);
  expect(JSON.stringify(await service.exportOwnData(ids[1]))).not.toContain(event.topic);
  await expect(service.deleteOwnRecord(ids[1], owner.own[0].id, owner.own[0].revision)).rejects.toThrow();
  const fields = { contactName: { value: "Contato privado", shared: false }, contactPhone: { value: "11999990000", shared: true }, careInstructions: { value: "Auxílio privado", shared: false }, assistance: { value: "Apoio privado", shared: false } };
  await service.saveOwnRecord(ids[0], 0, { kind: "EMERGENCY", fields });
  expect((await service.getOperations(ids[1])).sharedEmergency).toEqual([{ label: "Telefone para emergência", value: "11999990000" }]);
  await service.saveOwnRecord(ids[0], 1, { kind: "EMERGENCY", fields: { ...fields, contactPhone: { ...fields.contactPhone, shared: false } } });
  expect((await service.getOperations(ids[1])).sharedEmergency).toEqual([]);
  const timing = { kind: "TIMING", anchor: "2026-01-31T12:00:00Z", timeZone: "America/Sao_Paulo" };
  await service.saveOwnRecord(ids[0], 0, timing);
  expect((await service.getOperations(ids[0])).calendar).toEqual([]);
  await service.saveOwnRecord(ids[1], 0, timing);
  expect((await service.getOperations(ids[0])).timingAgreed).toBe(true);
  expect((await service.getOperations(ids[1])).calendar.length).toBeGreaterThan(3);
});

it("revisão do acordo preserva texto anterior e invalida aceites sem substituição unilateral", async () => {
  const old = (await service.getDraft(ids[0]))!;
  const shared = await service.getShared(ids[0]);
  const decision = shared.modules.find(m => m.id === "ND-Q041-01")!;
  await service.propose(ids[0], { moduleId: decision.id, revision: decision.revision, choice: "B", parameters: {} });
  expect(await service.getDraft(ids[1])).toBeNull();
  expect((await service.documentHistory(ids[1]))[0].draft.contentHash).toBe(old.contentHash);
  expect(await service.documentAcceptances(ids[0], old.contentHash)).toEqual([]);
  const revised = (await service.getShared(ids[0])).modules.find(m => m.id === decision.id)!;
  await service.confirm(ids[0], decision.id, revised.hash!, true);
  await expect(service.generate(ids[0], "Mudança de organização financeira")).rejects.toThrow("SHARED_UNAVAILABLE");
  await service.confirm(ids[1], decision.id, revised.hash!, true);
  await expect(service.generate(ids[0])).rejects.toThrow("REVISION_REASON_REQUIRED");
  await service.generate(ids[0], "Mudança de organização financeira");
  const draft = (await service.getDraft(ids[1]))!;
  expect(draft.amendment).toMatchObject({ previousHash: old.contentHash, reason: "Mudança de organização financeira" });
  expect(draft.contentHash).not.toBe(old.contentHash);
  expect(await service.documentAcceptances(ids[0], draft.contentHash)).toEqual([]);
  await service.acceptDocument(ids[0], draft.contentHash); await service.acceptDocument(ids[1], draft.contentHash);
  expect(await service.documentHistory(ids[1])).toHaveLength(2);
});

it("retoma Q151 só com pedido bilateral e revisão específica dos dois, sem liberar uso problemático ativo", async () => {
  for (const userId of ids.slice(0, 2)) {
    await service.requestPrivateReview(userId, ids[2], true, true);
    const reviews = await service.assignedReviews(ids[2]);
    const review = reviews.find(r => r.name === (userId === ids[0] ? "Alice" : "Bruno"))!;
    expect(review.q151).toBe(true); expect(review.questions.some(q => q.id === "Q151")).toBe(true);
    await service.decidePrivateReview(ids[2], review.id, "CONTINUE");
  }
  expect((await service.getShared(ids[0])).modules.some(m => m.id === "ND-Q151-01")).toBe(false);
  for (const userId of ids.slice(0, 2)) {
    const shared = await service.getShared(userId);
    await service.saveJointFacts(userId, shared.facts!.revision, { ...shared.facts!.own, Q151_voluntary_agreement_requested: true });
  }
  const shared = await service.getShared(ids[0]);
  const decision = shared.modules.find(m => m.id === "ND-Q151-01")!;
  await service.propose(ids[0], { moduleId: decision.id, revision: decision.revision, choice: "A", parameters: {} });
  const proposed = (await service.getShared(ids[1])).modules.find(m => m.id === decision.id)!;
  expect(proposed.preview?.join("\n")).not.toContain("reconhece que o consumo");
  let own = (await service.getOwn(ids[1]))!;
  await service.reopen(ids[1], own.id, own.revision);
  own = (await service.getOwn(ids[1]))!;
  await service.saveAnswer(ids[1], { sessionId: own.id, revision: own.revision, questionId: "Q151", answer: "C" });
  await service.requestPrivateReview(ids[1], ids[2], true, true);
  const review = (await service.assignedReviews(ids[2])).find(r => r.name === "Bruno")!;
  await expect(service.decidePrivateReview(ids[2], review.id, "CONTINUE")).rejects.toThrow("REVIEW_UNAVAILABLE");
  await service.revokePrivateReview(ids[1], review.id);
});

it("exige autorização nominal para revisão, libera Q181 pelo servidor e revogação invalida o compartilhamento", async () => {
  let own = (await service.getOwn(ids[0]))!;
  await service.reopen(ids[0], own.id, own.revision);
  own = (await service.getOwn(ids[0]))!;
  await service.saveContext(ids[0], { sessionId: own.id, revision: own.revision, context: { KNOWN_TRUST_BREACH: true, REBUILDING_CHOSEN: true } });
  own = (await service.getOwn(ids[0]))!;
  expect(own.questions.find(q => q.id === "Q181")?.state).toBe("BLOCKED_BY_POLICY");
  await expect(service.requestPrivateReview(ids[0], ids[2], false)).rejects.toThrow("REVIEW_CONSENT_REQUIRED");
  await expect(service.requestPrivateReview(ids[0], ids[1], true)).rejects.toThrow("REVIEWER_UNAVAILABLE");
  expect(await service.assignedReviews(ids[2])).toEqual([]);
  await service.requestPrivateReview(ids[0], ids[2], true);
  await expect(service.assignedReviews(ids[3])).rejects.toThrow("REVIEWER_UNAVAILABLE");
  const reviews = await service.assignedReviews(ids[2]);
  expect(reviews).toHaveLength(1);
  expect(reviews[0].questions.some(q => q.id === "Q030")).toBe(false);
  await service.decidePrivateReview(ids[2], reviews[0].id, "CONTINUE");
  own = (await service.getOwn(ids[0]))!;
  expect(own.questions.find(q => q.id === "Q181")?.state).toBe("NOT_ANSWERED");
  await service.saveAnswer(ids[0], { sessionId: own.id, revision: own.revision, questionId: "Q181", answer: "A" });
  await service.revokePrivateReview(ids[0], reviews[0].id);
  expect(await service.assignedReviews(ids[2])).toEqual([]);
  expect((await service.getOwn(ids[0]))?.questions.find(q => q.id === "Q181")?.state).toBe("BLOCKED_BY_POLICY");
  expect(await service.getShared(ids[1])).toEqual(NEUTRAL_SHARED_STATE);
  expect(await service.getDraft(ids[1])).toBeNull();
  expect(await service.documentHistory(ids[1])).toEqual([]);
});

it("rotaciona todos os tipos de conteúdo sem mudar aceites e retém versões já aceitas", async () => {
  const workspace = await db.contractWorkspace.findFirstOrThrow({ where: { coupleId, edition: { version: catalog.version } } });
  const before = await service.exportOwnData(ids[0]);
  vi.stubEnv("CONTRACT_DATA_KEYS", JSON.stringify({ next: randomBytes(32).toString("base64") }));
  vi.stubEnv("CONTRACT_DATA_ACTIVE_KEY_ID", "next");
  const original = await db.contractSession.findFirstOrThrow({ where: { workspaceId: workspace.id } });
  const dry = await maintainContracts(db, { rotate: true, workspaceIds: [workspace.id] });
  expect(dry.payloads).toBeGreaterThan(10);
  expect((await db.contractSession.findUniqueOrThrow({ where: { id: original.id } })).payload).toBe(original.payload);
  await maintainContracts(db, { apply: true, rotate: true, workspaceIds: [workspace.id] });
  expect((await db.contractSession.findUniqueOrThrow({ where: { id: original.id } })).payload).toMatch(/^v2\.next\./);
  const after = await service.exportOwnData(ids[0]);
  expect(after.sessions).toEqual(before.sessions); expect(after.records).toEqual(before.records);
  expect((await db.contractWorkspace.findUniqueOrThrow({ where: { id: workspace.id } })).updatedAt).toEqual(workspace.updatedAt);
  const oldDate = new Date(Date.now() - 181 * 86400000);
  const edition = await db.contractEdition.create({ data: { version: `retention-${randomBytes(4).toString("hex")}`, contentHash: "0".repeat(64), snapshot: {} } });
  const abandoned = await db.contractWorkspace.create({ data: { coupleId, editionId: edition.id, updatedAt: oldDate } });
  await db.contractWorkspace.update({ where: { id: workspace.id }, data: { updatedAt: oldDate } });
  const target = [workspace.id, abandoned.id];
  expect((await maintainContracts(db, { workspaceIds: target })).workspaces).toBe(1);
  expect(await db.contractWorkspace.count({ where: { id: { in: target } } })).toBe(2);
  expect((await maintainContracts(db, { apply: true, workspaceIds: target })).workspaces).toBe(1);
  expect(await db.contractWorkspace.count({ where: { id: { in: target } } })).toBe(1);
  expect(await db.contractDocument.count({ where: { workspaceId: workspace.id, status: "ARCHIVED_ACKNOWLEDGED" } })).toBe(2);
  await db.contractEdition.delete({ where: { id: edition.id } });
});

it("exclusão do titular remove derivados e preserva os dados privados do outro", async () => {
  const before = await service.exportOwnData(ids[1]);
  await expect(service.deleteOwnData(ids[0], "apagar")).rejects.toThrow("DELETE_CONFIRMATION_REQUIRED");
  await service.deleteOwnData(ids[0], "EXCLUIR MEUS DADOS");
  expect((await service.exportOwnData(ids[0])).sessions).toEqual([]);
  expect((await service.exportOwnData(ids[0])).records).toEqual([]);
  const after = await service.exportOwnData(ids[1]);
  expect(after.sessions).toEqual(before.sessions);
  expect(after.records.filter(r => r.kind === "TIMING")).toEqual(before.records.filter(r => r.kind === "TIMING"));
  expect(await service.getShared(ids[1])).toEqual(NEUTRAL_SHARED_STATE);
});
