// @vitest-environment node
import { randomBytes } from "node:crypto";
import { afterAll, expect, it, vi } from "vitest";
import { createTestPrismaClient } from "@/test/create-test-prisma";
import { contractCatalog } from "@/features/contract/server/catalog";
import { seal } from "@/features/contract/server/privacy";
import type { DecisionColumn, DecisionField, SessionData } from "@/features/contract/domain/types";
import { ContractService } from "./contract.service";

const db = createTestPrismaClient();
const catalog = structuredClone(contractCatalog);
catalog.version = `alerts-${randomBytes(6).toString("hex")}`;
const service = new ContractService(db, catalog, () => {});
const ids: string[] = [];
let coupleId: string;
const sample = (field: DecisionColumn | DecisionField): string => field.options?.[0] ?? ({ member: "1", date: "2027-01-15", time: "08:00", money: "100", percent: "5", number: "20", amountOrPercent: "5%" } as Record<string, string>)[field.type] ?? "Acordo de teste";

afterAll(async () => {
  if (coupleId) {
    const workspaces = await db.contractWorkspace.findMany({ where: { coupleId } });
    const workspaceId = { in: workspaces.map(w => w.id) };
    await db.contractRecord.deleteMany({ where: { workspaceId } });
    await db.contractDocument.deleteMany({ where: { workspaceId } });
    await db.contractDecision.deleteMany({ where: { workspaceId } });
    await db.contractEvaluation.deleteMany({ where: { workspaceId } });
    await db.contractSession.deleteMany({ where: { workspaceId } });
    await db.contractWorkspace.deleteMany({ where: { coupleId } });
    await db.coupleMember.deleteMany({ where: { coupleId } });
    await db.couple.delete({ where: { id: coupleId } });
  }
  await db.contractEdition.deleteMany({ where: { version: catalog.version } });
  await db.user.deleteMany({ where: { id: { in: ids } } });
  await db.$disconnect(); vi.unstubAllEnvs();
});

it("sessões já concluídas com alertas críticos geram contrato e aceites sem revisor ou exposição das respostas", async () => {
  vi.stubEnv("CONTRACT_DATA_KEY", randomBytes(32).toString("base64"));
  vi.stubEnv("CONTRACT_REVIEWER_USER_IDS", "");
  for (const name of ["Alice", "Bruno"]) {
    const user = await db.user.create({ data: { name, email: `alerts-${randomBytes(6).toString("hex")}@teste.local` } }); ids.push(user.id);
  }
  const couple = await db.couple.create({ data: { status: "ACTIVE", members: { create: ids.map((userId, i) => ({ userId, activeMembershipKey: userId, role: i === 0 ? "CREATOR" : "PARTNER" })) } } });
  coupleId = couple.id;
  for (const userId of ids) {
    await service.start(userId);
    const own = (await service.getOwn(userId))!;
    // Existing encrypted sessions and original edition snapshots are retained.
    const data: SessionData = { context: { ...Object.fromEntries(Object.keys(catalog.contextDefinitions!).map(k => [k, false])), KNOWN_TRUST_BREACH: true, REBUILDING_CHOSEN: true, HAS_CHILDREN_OR_DEPENDENTS: true },
      answers: { ...Object.fromEntries(catalog.questions.map(q => [q.id, "A" as const])), Q101: "B", Q103: "C", Q104: "C", Q105: "C", Q110: "C", Q119: "C", Q162: "C", Q151: userId === ids[0] ? "C" : "A" }, privateAnswers: {}, neckCompressionReport: true };
    for (const m of catalog.privateModules) if (m.trigger.includes(data.answers[m.questionId])) data.privateAnswers[m.id] = "A";
    await db.contractSession.update({ where: { id: own.id }, data: { payload: seal(data, `${own.id}:${userId}`), status: "SUBMITTED", submittedAt: new Date(), consentedAt: new Date(), revision: 7 } });
    const area = await service.privateArea(userId);
    expect(area.safety.critical).toBe(true);
    expect(area.blockers.filter(b => b.id.endsWith("-critical"))).toHaveLength(4);
    expect(area.blockers.every(b => !b.blocking)).toBe(true);
    expect((await service.getOwn(userId))!.questions.find(q => q.id === "Q181")).toMatchObject({ state: "A", privateReviewRequired: false });
  }
  for (const userId of ids) {
    const shared = await service.getShared(userId);
    expect(shared.state).toBe("AVAILABLE");
    await service.saveJointFacts(userId, shared.facts!.revision, { ...Object.fromEntries(shared.facts!.fields.map(f => [f.id, false])), Q151_voluntary_agreement_requested: true });
  }
  const shared = await service.getShared(ids[0]);
  expect(shared.modules.some(m => m.id === "ND-Q151-01")).toBe(true);
  expect(JSON.stringify(shared)).not.toContain("neckCompressionReport");
  for (const definition of shared.modules) {
    const option = definition.options[0];
    const parameters = Object.fromEntries(option.fields.map(key => {
      const field = definition.fieldDefinitions![key];
      return [key, [field.type === "table" ? JSON.stringify(field.columns!.map(sample)) : sample(field)]];
    }));
    await service.propose(ids[0], { moduleId: definition.id, revision: definition.revision, choice: option.code, parameters });
    const proposal = (await service.getShared(ids[0])).modules.find(m => m.id === definition.id)!;
    for (const userId of ids) await service.confirm(userId, definition.id, proposal.hash!, true);
  }
  expect(await service.generate(ids[0])).toMatchObject({ state: "DRAFT" });
  const draft = (await service.getDraft(ids[1]))!;
  expect(draft.engineVersion).toBe("1.4.0-engine.3");
  expect(draft.sections.length).toBeGreaterThan(5);
  expect(draft.provenance.some(p => /^OUT-(?:PAIR-)?Q10[1-9]/.test(p.componentId))).toBe(false);
  for (const userId of ids) await service.acceptDocument(userId, draft.contentHash);
  expect(await service.documentAcceptances(ids[0], draft.contentHash)).toHaveLength(2);
  expect(await service.documentHistory(ids[1])).toHaveLength(1);
  expect(await db.contractPrivateReview.count({ where: { workspace: { coupleId } } })).toBe(0);
  for (const userId of ids) expect((await service.getOwn(userId))!.revision).toBe(7);
}, 120000);
