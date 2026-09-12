// @vitest-environment node
import { randomBytes } from "node:crypto";
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { createTestPrismaClient } from "@/test/create-test-prisma";
import { contractCatalog } from "@/features/contract/server/catalog";
import * as engine from "@/features/contract/domain/engine";
import { proposalHash, seal } from "@/features/contract/server/privacy";
import type { Catalog, SessionData } from "@/features/contract/domain/types";
import { ContractService, NEUTRAL_SHARED_STATE } from "./contract.service";

const db = createTestPrismaClient();
const suffix = randomBytes(5).toString("hex");
const userIds: string[] = [], coupleIds: string[] = [], editionIds: string[] = [];
const catalog = structuredClone(contractCatalog);
catalog.version = `test-source-${suffix}`;
const service = new ContractService(db, catalog, () => {});
let people: Awaited<ReturnType<typeof createCouple>>;
let outsider: string;
async function createCouple() {
  const a = await db.user.create({ data: { name: "Pessoa Um", email: `${randomBytes(5).toString("hex")}@contract-test.local` } });
  const b = await db.user.create({ data: { name: "Pessoa Dois", email: `${randomBytes(5).toString("hex")}@contract-test.local` } });
  userIds.push(a.id, b.id);
  const couple = await db.couple.create({ data: { status: "ACTIVE", members: { create: [{ userId: a.id, role: "CREATOR", activeMembershipKey: a.id }, { userId: b.id, role: "PARTNER", activeMembershipKey: b.id }] } } });
  coupleIds.push(couple.id);
  return { a, b, couple };
}
beforeAll(async () => {
  vi.stubEnv("CONTRACT_DATA_KEY", randomBytes(32).toString("base64"));
  people = await createCouple();
  const admin = await db.user.create({ data: { name: "Admin externo", email: `outsider-${suffix}@contract-test.local`, role: "ADMIN" } });
  outsider = admin.id; userIds.push(admin.id);
});
afterEach(() => vi.restoreAllMocks());
afterAll(async () => {
  const workspaces = await db.contractWorkspace.findMany({ where: { coupleId: { in: coupleIds } } });
  const workspaceIds = workspaces.map(w => w.id);
  editionIds.push(...workspaces.map(w => w.editionId));
  await db.contractDocument.deleteMany({ where: { workspaceId: { in: workspaceIds } } });
  await db.contractDecision.deleteMany({ where: { workspaceId: { in: workspaceIds } } });
  await db.contractEvaluation.deleteMany({ where: { workspaceId: { in: workspaceIds } } });
  await db.contractSession.deleteMany({ where: { workspaceId: { in: workspaceIds } } });
  await db.contractWorkspace.deleteMany({ where: { id: { in: workspaceIds } } });
  await db.contractEdition.deleteMany({ where: { id: { in: editionIds } } });
  await db.coupleMember.deleteMany({ where: { coupleId: { in: coupleIds } } });
  await db.couple.deleteMany({ where: { id: { in: coupleIds } } });
  await db.user.deleteMany({ where: { id: { in: userIds } } });
  await db.$disconnect(); vi.unstubAllEnvs();
});

describe("sessões individuais do contrato no banco", () => {
  it("inicia sem duplicar, fixa edição e não dá acesso ao administrador externo", async () => {
    await Promise.all([service.start(people.a.id), service.start(people.a.id)]);
    await service.start(people.b.id);
    const own = (await service.getOwn(people.a.id))!;
    expect(own.questions).toHaveLength(200);
    expect(own.questions[0]).toMatchObject({ state: "BLOCKED_BY_POLICY", prompt: null, options: [] });
    expect(await db.contractSession.count({ where: { userId: people.a.id } })).toBe(1);
    await expect(service.getOwn(outsider)).rejects.toThrow("COUPLE_UNAVAILABLE");
    const changed = structuredClone(catalog); changed.questions[0].prompt = "Alteração da mesma edição";
    await expect(new ContractService(db, changed, () => {}).start(people.a.id)).rejects.toThrow("CATALOG_VERSION_IMMUTABLE");
  });
  it("salva somente para o dono, aplica contexto e protege contra gravações concorrentes", async () => {
    let own = (await service.getOwn(people.a.id))!;
    const input = { sessionId: own.id, revision: own.revision, questionId: "Q110", answer: "C" };
    await expect(service.saveAnswer(people.a.id, input)).rejects.toThrow("QUESTION_UNAVAILABLE");
    await expect(service.saveAnswer(people.b.id, input)).rejects.toThrow("SESSION_UNAVAILABLE");
    await service.saveContext(people.a.id, { sessionId: own.id, revision: own.revision, context: { HAS_CHILDREN_OR_DEPENDENTS: true } });
    own = (await service.getOwn(people.a.id))!;
    const saves = await Promise.allSettled(["B", "C"].map(answer => service.saveAnswer(people.a.id, { ...input, revision: own.revision, answer })));
    expect(saves.filter(s => s.status === "fulfilled")).toHaveLength(1);
    expect(saves.filter(s => s.status === "rejected")).toHaveLength(1);
    const partner = (await service.getOwn(people.b.id))!;
    expect(partner.questions.find(q => q.id === "Q110")?.state).toBe("BLOCKED_BY_POLICY");
    const stored = await db.contractSession.findUniqueOrThrow({ where: { id: own.id } });
    expect(stored.payload).not.toContain("Q110"); expect(stored.payload).not.toContain("HAS_CHILDREN");
    own = (await service.getOwn(people.a.id))!;
    await service.saveContext(people.a.id, { sessionId: own.id, revision: own.revision, context: { HAS_CHILDREN_OR_DEPENDENTS: false } });
    expect((await service.getOwn(people.a.id))!.questions.find(q => q.id === "Q110")?.state).toBe("NOT_APPLICABLE");
  });
  it("nega fatos de liberação enviados pelo navegador e mantém projeção neutra", async () => {
    const own = (await service.getOwn(people.a.id))!;
    await expect(service.saveContext(people.a.id, { sessionId: own.id, revision: own.revision, context: { safety_cleared: true } })).rejects.toThrow("INVALID_CONTEXT");
    await expect(service.submit(people.a.id, own.id, own.revision)).rejects.toThrow("SUBMISSION_INCOMPLETE");
    await expect(service.consent(people.a.id, own.id, own.revision, true)).rejects.toThrow("SESSION_NOT_SUBMITTED");
    expect(await service.getShared(people.a.id)).toEqual(NEUTRAL_SHARED_STATE);
    expect(await service.getShared(people.b.id)).toEqual(NEUTRAL_SHARED_STATE);
    expect(await service.generate(people.a.id)).toEqual({ state: "UNAVAILABLE", message: NEUTRAL_SHARED_STATE.message });
    expect(await db.contractDocument.count({ where: { workspace: { coupleId: people.couple.id } } })).toBe(0);
    await expect(service.propose(people.a.id, { moduleId: "ND-Q041-01", revision: 0, choice: "A", parameters: {} })).rejects.toThrow("SHARED_UNAVAILABLE");
  });
});

describe("transações conjuntas em edição SINTÉTICA de teste", () => {
  it("exige dois aceites exatos, preserva histórico, gera deterministicamente e invalida após revogação", async () => {
    // This fixture is not imported by the application or the package compiler.
    // Product decisions remain blocked; mocking clearance tests the storage protocol only.
    vi.spyOn(engine, "assessSafety").mockReturnValue({ critical: false, reviewRequired: false, cleared: true });
    const fixture: Catalog = structuredClone(contractCatalog);
    fixture.version = `test-flow-${suffix}`; fixture.productionReady = true; fixture.crossRules = [];
    fixture.questions.forEach(q => { q.applicability = { context_equals: { TEST_APPLICABLE: true } }; q.clauseId = q.proposedClauseId; });
    fixture.rules.forEach(r => { r.active = true; if (r.questionId !== "Q041") { r.action = "NO_ADDITIONAL_OUTPUT"; r.dependencies = []; r.steps = []; } });
    fixture.components.forEach(c => { if (c.questionId === "Q041" || c.id === "OUT-Q154-FIXED") { c.active = true; c.template = c.editorialTemplate ?? (c.id === "OUT-Q154-FIXED" ? fixture.gamblingTemplate : null); } });
    const pair = await createCouple();
    const tested = new ContractService(db, fixture, () => {});
    for (const user of [pair.a, pair.b]) {
      await tested.start(user.id);
      const session = (await tested.getOwn(user.id))!;
      const data: SessionData = { ...engine.EMPTY_SESSION, context: { TEST_APPLICABLE: true }, answers: Object.fromEntries(fixture.questions.map(q => [q.id, "A"])) };
      await db.contractSession.update({ where: { id: session.id }, data: { payload: seal(data, `${session.id}:${user.id}`) } });
      await tested.submit(user.id, session.id, session.revision);
      const submitted = (await tested.getOwn(user.id))!;
      await tested.consent(user.id, submitted.id, submitted.revision, true);
    }
    const proposal = { moduleId: "ND-Q041-01", revision: 0, choice: "A", parameters: {} };
    await tested.propose(pair.a.id, proposal);
    let shared = await tested.getShared(pair.b.id);
    let decision = shared.modules.find(m => m.id === proposal.moduleId)!;
    const firstHash = decision.hash!;
    await tested.confirm(pair.a.id, proposal.moduleId, firstHash, true);
    expect((await tested.getShared(pair.a.id)).modules.find(m => m.id === proposal.moduleId)?.status).toBe("PROPOSED");
    await tested.confirm(pair.b.id, proposal.moduleId, firstHash, true);
    expect((await tested.getShared(pair.a.id)).modules.find(m => m.id === proposal.moduleId)?.status).toBe("CONFIRMED_BY_BOTH");
    await tested.propose(pair.b.id, { ...proposal, revision: 1, choice: "B" });
    await expect(tested.confirm(pair.a.id, proposal.moduleId, firstHash, true)).rejects.toThrow("CONFLICT");
    shared = await tested.getShared(pair.a.id); decision = shared.modules.find(m => m.id === proposal.moduleId)!;
    expect(decision.ownConfirmed).toBe(false);
    for (const user of [pair.a, pair.b]) await tested.confirm(user.id, proposal.moduleId, decision.hash!, true);
    await tested.propose(pair.a.id, { moduleId: "ND-Q041-02", revision: 0, choice: "B", parameters: {} });
    decision = (await tested.getShared(pair.b.id)).modules.find(m => m.id === "ND-Q041-02")!;
    for (const user of [pair.a, pair.b]) await tested.confirm(user.id, decision.id, decision.hash!, true);
    expect((await tested.generate(pair.a.id)).state).toBe("DRAFT");
    const draft = (await tested.getDraft(pair.b.id))!;
    expect(draft.sections.flatMap(s => s.paragraphs).join(" ")).toContain("modelo financeiro misto");
    expect(JSON.stringify(draft.sections)).not.toContain("Q103");
    await tested.generate(pair.b.id);
    expect((await tested.getDraft(pair.a.id))?.contentHash).toBe(draft.contentHash);
    const documents = await db.contractDocument.count({ where: { workspace: { coupleId: pair.couple.id } } });
    expect(documents).toBe(1);
    const session = (await tested.getOwn(pair.a.id))!;
    await tested.consent(pair.a.id, session.id, session.revision, false);
    expect(await tested.getDraft(pair.b.id)).toBeNull();
    expect(await tested.getShared(pair.b.id)).toEqual(NEUTRAL_SHARED_STATE);
    const revoked = (await tested.getOwn(pair.a.id))!;
    await tested.consent(pair.a.id, revoked.id, revoked.revision, true);
    expect((await tested.getShared(pair.b.id)).modules.every(m => !m.hash && !m.ownConfirmed)).toBe(true);
    expect(await tested.getDraft(pair.b.id)).toBeNull();
    const history = await db.contractDecision.findMany({ where: { workspace: { coupleId: pair.couple.id } } });
    expect(history.length).toBe(3); expect(history.every(d => d.status === "SUPERSEDED")).toBe(true);
    expect(history.some(d => d.contentHash === proposalHash({ moduleId: "ND-Q041-01", moduleVersion: fixture.modules.find(m => m.id === "ND-Q041-01")!.version, choice: "A", parameters: {} }, d.revision, d.basisHash))).toBe(true);
    const reopened = (await tested.getShared(pair.a.id)).modules.find(m => m.id === proposal.moduleId)!;
    await tested.propose(pair.a.id, { ...proposal, revision: reopened.revision });
    const repeated = (await tested.getShared(pair.b.id)).modules.find(m => m.id === proposal.moduleId)!;
    expect(repeated.hash).not.toBe(firstHash);
    await expect(tested.confirm(pair.b.id, proposal.moduleId, firstHash, true)).rejects.toThrow("CONFLICT");
    await tested.confirm(pair.b.id, proposal.moduleId, repeated.hash!, false);
    expect((await tested.getShared(pair.a.id)).modules.find(m => m.id === proposal.moduleId)?.status).toBe("NO_CONSENSUS");
    await expect(tested.confirm(pair.a.id, proposal.moduleId, repeated.hash!, true)).rejects.toThrow("CONFLICT");
  }, 30000);
});
