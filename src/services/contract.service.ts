import "server-only";
import { randomUUID } from "node:crypto";
import { Prisma, type PrismaClient } from "@/generated/prisma/client";
import { z } from "zod";
import { applicability, applicabilityContextFields, assessSafety, ContractError, EMPTY_SESSION, planPair, responseState } from "@/features/contract/domain/engine";
import { bothConfirmed, renderDecision, renderRegisteredTemplate, validateDecision, type DecisionContent } from "@/features/contract/domain/decisions";
import { agreedFacts, JOINT_FACTS, type JointFactsDto } from "@/features/contract/domain/joint-facts";
import { calendarOffset, localDateTimeToInstant, EMERGENCY_FIELDS, evaluateEvents, eventReminders, ownRecordSchema, PLAN_LIMITS, type ContractEvent, type OwnRecord } from "@/features/contract/domain/operations";
import { fundProposalSchema, type FundEntry } from "@/features/contract/domain/fund";
import type { Catalog, Facts, OwnSessionDto, SessionData } from "@/features/contract/domain/types";
import { contractCatalog } from "@/features/contract/server/catalog";
import { requireContractAccess } from "@/features/contract/server/access";
import { contentHash, proposalHash, seal, unseal } from "@/features/contract/server/privacy";
import { generateRegisteredDraft, type ContractDraft } from "@/features/contract/server/generator";
import { configuredReviewers, reviewBasis, sessionPayload, withPrivateClearance, type ReviewSnapshot } from "@/features/contract/server/private-review";

const letter = z.enum(["A", "B", "C"]);
const revisionSchema = z.number().int().nonnegative();
const answerSchema = z.object({ sessionId: z.uuid(), revision: revisionSchema, questionId: z.string().regex(/^Q\d{3}$/), answer: letter, privateAnswer: letter.optional(), neckCompressionReport: z.boolean().optional() }).strict();
const contextSchema = z.object({ sessionId: z.uuid(), revision: revisionSchema, context: z.record(z.string(), z.boolean().nullable()) }).strict();
const decisionSchema = z.object({ moduleId: z.string().max(50), revision: revisionSchema, choice: letter, parameters: z.record(z.string().max(100), z.array(z.string().max(8000)).max(20)) }).strict();
type Tx = Prisma.TransactionClient;
type Confirmation = { memberId: string; hash: string; at: string };
export const NEUTRAL_SHARED_STATE = { state: "UNAVAILABLE" as const, message: "Esta etapa ainda não está disponível. Você pode continuar usando sua área individual.", modules: [] as JointDecisionDto[], facts: null as JointFactsDto | null };
export type JointDecisionDto = { id: string; title: string; prompt: string; repeatable?: boolean; options: Catalog["modules"][number]["options"]; fieldDefinitions?: Catalog["modules"][number]["fieldDefinitions"]; preview?: string[]; revision: number; proposal: DecisionContent | null; hash: string | null; status: string; ownConfirmed: boolean };
function moduleDefinition(catalog: Catalog, id: string) {
  const [base, instance, extra] = id.split(":");
  const definition = catalog.modules.find(m => m.id === base);
  if (!definition || extra || (instance && (!definition.repeatable || !z.uuid().safeParse(instance).success))) throw new ContractError("INVALID_DECISION");
  return definition;
}

export class ContractService {
  constructor(private readonly client: PrismaClient, private readonly catalog = contractCatalog,
    private readonly checkAccess: (userId: string, client: Tx) => void | Promise<void> = requireContractAccess) {}

  private async context(tx: Tx, userId: string) {
    await this.checkAccess(userId, tx);
    const member = await tx.coupleMember.findUnique({ where: { activeMembershipKey: userId }, include: { couple: { include: { members: { include: { user: { select: { name: true } } } } } } } });
    if (!member || member.userId !== userId || member.couple.status !== "ACTIVE") throw new ContractError("COUPLE_UNAVAILABLE");
    const members = member.couple.members.sort((a, b) => (a.role === "CREATOR" ? 0 : 1) - (b.role === "CREATOR" ? 0 : 1));
    if (members.length !== 2 || members.some(m => m.activeMembershipKey !== m.userId) || new Set(members.map(m => m.userId)).size !== 2) throw new ContractError("COUPLE_UNAVAILABLE");
    return { member, members };
  }
  private async transaction<T>(userId: string, operation: (tx: Tx, context: Awaited<ReturnType<ContractService["context"]>>) => Promise<T>) {
    for (let retry = 0; retry < 3; retry++) {
      try { return await this.client.$transaction(async tx => operation(tx, await this.context(tx, userId)), { isolationLevel: "Serializable", timeout: 20000 }); }
      catch (error) { if (!(error instanceof Prisma.PrismaClientKnownRequestError) || !["P2034", "P2002"].includes(error.code) || retry === 2) throw error; }
    }
    throw new ContractError("CONFLICT");
  }
  private async workspace(tx: Tx, coupleId: string, lock = false) {
    const workspace = await tx.contractWorkspace.findFirst({ where: { coupleId, edition: { version: this.catalog.version } }, include: { edition: true, sessions: true } });
    if (!workspace) throw new ContractError("SESSION_UNAVAILABLE");
    if (contentHash(workspace.edition.snapshot) !== workspace.edition.contentHash) throw new ContractError("CATALOG_INTEGRITY");
    if (lock) await tx.contractWorkspace.update({ where: { id: workspace.id }, data: { revision: { increment: 1 } } });
    return workspace;
  }
  private async own(tx: Tx, userId: string, coupleId: string, sessionId: string, revision: number) {
    const workspace = await this.workspace(tx, coupleId, true);
    const session = workspace.sessions.find(s => s.userId === userId && s.id === sessionId);
    if (!session) throw new ContractError("SESSION_UNAVAILABLE");
    if (session.revision !== revision) throw new ContractError("CONFLICT");
    return { session, workspace, catalog: workspace.edition.snapshot as unknown as Catalog };
  }
  async start(userId: string) {
    return this.transaction(userId, async (tx, { member }) => {
      const digest = contentHash(this.catalog);
      const edition = await tx.contractEdition.upsert({ where: { version: this.catalog.version }, create: { version: this.catalog.version, contentHash: digest, snapshot: this.catalog as unknown as Prisma.InputJsonValue }, update: {} });
      if (edition.contentHash !== digest) throw new ContractError("CATALOG_VERSION_IMMUTABLE");
      const workspace = await tx.contractWorkspace.upsert({ where: { coupleId_editionId: { coupleId: member.coupleId, editionId: edition.id } }, create: { coupleId: member.coupleId, editionId: edition.id }, update: {} });
      const existing = await tx.contractSession.findUnique({ where: { workspaceId_userId: { workspaceId: workspace.id, userId } } });
      if (existing) return;
      const id = randomUUID();
      await tx.contractSession.create({ data: { id, workspaceId: workspace.id, userId, memberId: member.id, payload: seal(EMPTY_SESSION, `${id}:${userId}`) } });
    });
  }
  async getOwn(userId: string): Promise<OwnSessionDto | null> {
    return this.transaction(userId, async (tx, { member }) => {
      const session = await tx.contractSession.findFirst({ where: { userId, memberId: member.id, workspace: { coupleId: member.coupleId, edition: { version: this.catalog.version } } }, include: { workspace: { include: { edition: true } } } });
      if (!session) return null;
      if (contentHash(session.workspace.edition.snapshot) !== session.workspace.edition.contentHash) throw new ContractError("CATALOG_INTEGRITY");
      const catalog = session.workspace.edition.snapshot as unknown as Catalog;
      const data = await withPrivateClearance(tx, session);
      const questions = catalog.questions.map(q => {
        const state = responseState(q, data);
        const displayable = !["BLOCKED_BY_POLICY", "NOT_APPLICABLE"].includes(state);
        const privateModule = displayable ? catalog.privateModules.find(m => m.questionId === q.id && m.trigger.includes(data.answers[q.id])) ?? null : null;
        return { id: q.id, title: q.title, order: q.order, prompt: displayable ? q.prompt : null, period: q.period, state,
          options: displayable ? q.options.map(({ code, text }) => ({ code, text })) : [],
          contextFields: applicabilityContextFields(q).map(id => ({ id, ...catalog.contextDefinitions?.[id] ?? { label: "Contexto individual", help: "" } })),
          relatedQuestions: catalog.questions.filter(related => related.id !== q.id && catalog.crossRules.some(rule => rule.relatedQuestionIds?.includes(q.id) && rule.relatedQuestionIds.includes(related.id))).map(related => ({ id: related.id, title: related.title })),
          privateReviewRequired: !!(q.applicability && "requires_private_review" in q.applicability && q.applicability.requires_private_review), privateModule,
          privateAnswer: privateModule ? data.privateAnswers[privateModule.id] ?? null : null };
      });
      return { id: session.id, revision: session.revision, status: session.status, version: catalog.version, consented: !!session.consentedAt, questions, context: data.context,
        neckCompressionReport: data.neckCompressionReport, answered: questions.filter(q => ["A", "B", "C"].includes(q.state)).length, blocked: questions.filter(q => q.state === "BLOCKED_BY_POLICY").length };
    });
  }
  async saveAnswer(userId: string, value: unknown) {
    const input = answerSchema.parse(value);
    return this.transaction(userId, async (tx, { member }) => {
      const { session, catalog } = await this.own(tx, userId, member.coupleId, input.sessionId, input.revision);
      if (session.status !== "IN_PROGRESS") throw new ContractError("SESSION_CLOSED");
      const data = await withPrivateClearance(tx, session);
      const question = catalog.questions.find(q => q.id === input.questionId);
      if (!question || applicability(question, data.context, data.privateClearance?.q181) !== true) throw new ContractError("QUESTION_UNAVAILABLE");
      const privateModule = catalog.privateModules.find(m => m.questionId === question.id && m.trigger.includes(input.answer));
      if (input.privateAnswer && !privateModule) throw new ContractError("INVALID_ANSWER");
      if (input.neckCompressionReport !== undefined && question.id !== "Q103") throw new ContractError("INVALID_ANSWER");
      data.answers[question.id] = input.answer;
      for (const definition of catalog.privateModules.filter(m => m.questionId === question.id)) delete data.privateAnswers[definition.id];
      if (privateModule && input.privateAnswer) data.privateAnswers[privateModule.id] = input.privateAnswer;
      if (question.id === "Q103") data.neckCompressionReport = input.neckCompressionReport ?? null;
      await tx.contractSession.update({ where: { id: session.id }, data: { payload: seal(sessionPayload(data), `${session.id}:${userId}`), revision: { increment: 1 } } });
    });
  }
  async saveContext(userId: string, value: unknown) {
    const input = contextSchema.parse(value);
    return this.transaction(userId, async (tx, { member }) => {
      const { session, catalog } = await this.own(tx, userId, member.coupleId, input.sessionId, input.revision);
      if (session.status !== "IN_PROGRESS") throw new ContractError("SESSION_CLOSED");
      const allowed = new Set(catalog.questions.flatMap(applicabilityContextFields));
      if (Object.keys(input.context).some(k => !allowed.has(k))) throw new ContractError("INVALID_CONTEXT");
      const data = await withPrivateClearance(tx, session);
      const before = reviewBasis(data);
      data.context = { ...data.context, ...input.context };
      if (reviewBasis(data) !== before) delete data.privateClearance;
      for (const q of catalog.questions) if (applicability(q, data.context, data.privateClearance?.q181) !== true) {
        delete data.answers[q.id];
        for (const m of catalog.privateModules.filter(m => m.questionId === q.id)) delete data.privateAnswers[m.id];
        if (q.id === "Q103") data.neckCompressionReport = null;
      }
      await tx.contractSession.update({ where: { id: session.id }, data: { payload: seal(sessionPayload(data), `${session.id}:${userId}`), revision: { increment: 1 } } });
    });
  }
  async submit(userId: string, sessionId: string, revision: number) {
    z.uuid().parse(sessionId); revisionSchema.parse(revision);
    return this.transaction(userId, async (tx, { member }) => {
      const { session, catalog } = await this.own(tx, userId, member.coupleId, sessionId, revision);
      if (session.status === "SUBMITTED") return;
      const data = await withPrivateClearance(tx, session);
      if (catalog.questions.some(q => ["NOT_ANSWERED", "BLOCKED_BY_POLICY"].includes(responseState(q, data)))) throw new ContractError("SUBMISSION_INCOMPLETE");
      if (catalog.privateModules.some(m => m.trigger.includes(data.answers[m.questionId]) && !data.privateAnswers[m.id])) throw new ContractError("SUBMISSION_INCOMPLETE");
      if (data.neckCompressionReport === null) throw new ContractError("SUBMISSION_INCOMPLETE");
      await tx.contractSession.update({ where: { id: session.id }, data: { status: "SUBMITTED", submittedAt: new Date(), revision: { increment: 1 } } });
    });
  }
  async consent(userId: string, sessionId: string, revision: number, enabled: boolean) {
    z.uuid().parse(sessionId); revisionSchema.parse(revision); z.boolean().parse(enabled);
    return this.transaction(userId, async (tx, { member }) => {
      const { session, workspace } = await this.own(tx, userId, member.coupleId, sessionId, revision);
      if (enabled && session.status !== "SUBMITTED") throw new ContractError("SESSION_NOT_SUBMITTED");
      await tx.contractSession.update({ where: { id: session.id }, data: { consentedAt: enabled ? new Date() : null, revision: { increment: 1 } } });
      // Revocation and re-consent cannot resurrect an old proposal, acceptance or document.
      await tx.contractRecord.deleteMany({ where: { workspaceId: workspace.id, kind: "JOINT_FACTS" } });
      await tx.contractDecision.updateMany({ where: { workspaceId: workspace.id, activeKey: { not: null } }, data: { activeKey: null, status: "SUPERSEDED" } });
      await this.invalidateDocuments(tx, workspace.id);
    });
  }
  private async evaluate(tx: Tx, workspace: Awaited<ReturnType<ContractService["workspace"]>>, members: Awaited<ReturnType<ContractService["context"]>>["members"]) {
    const catalog = workspace.edition.snapshot as unknown as Catalog;
    const sessions = members.map(m => workspace.sessions.find(s => s.userId === m.userId && s.memberId === m.id));
    if (sessions.some(s => !s || s.status !== "SUBMITTED" || !s.consentedAt)) return null;
    for (const member of members) { try { await this.checkAccess(member.userId, tx); } catch (error) { if (!(error instanceof ContractError)) throw error; return null; } }
    const completeSessions = sessions.map(s => s!);
    const data = await Promise.all(completeSessions.map(s => withPrivateClearance(tx, s)));
    const safety = data.map(d => assessSafety(catalog, d));
    const records = await tx.contractRecord.findMany({ where: { workspaceId: workspace.id, kind: "JOINT_FACTS", userId: { in: members.map(m => m.userId) } } });
    const memberFacts = members.map(m => {
      const record = records.find(r => r.userId === m.userId);
      return record ? unseal<Facts>(record.payload, `record:${record.id}:${m.userId}`) : {};
    });
    const facts = agreedFacts(memberFacts[0], memberFacts[1]);
    facts.PREGNANCY_POSSIBLE = data.every(d => d.context.PREGNANCY_POSSIBLE === true);
    const basisHash = contentHash({ edition: workspace.edition.contentHash, engine: "1.4.0-engine.2", members: members.map(m => ({ id: m.id, name: m.user.name })), reviews: data.map(d => d.privateClearance?.reviewId ?? null), facts,
      sessions: completeSessions.map(s => ({ id: s.id, revision: s.revision })) });
    const plans = catalog.questions.map(q => planPair(catalog, { questionId: q.id, members: [members[0].id, members[1].id],
      answers: [responseState(q, data[0]), responseState(q, data[1])], applicable: [applicability(q, data[0].context, data[0].privateClearance?.q181), applicability(q, data[1].context, data[1].privateClearance?.q181)],
      criticalSafety: safety.some(s => s.critical), safetyCleared: safety.every(s => s.cleared), facts }));
    if (facts.Q151_voluntary_agreement_requested === true) {
      const plan = plans.find(p => p.questionId === "Q151")!;
      if (data.every(d => d.privateClearance?.q151 && d.answers.Q151 !== "C")) { plan.action = "NO_ADDITIONAL_OUTPUT"; plan.modules = ["ND-Q151-01"]; }
      else plan.blockers.push("PRIVATE_REVIEW_REQUIRED");
    }
    if (facts.Q150_review_requested === true) plans.find(p => p.questionId === "Q150")!.modules.push("ND-Q150-REVIEW");
    return { catalog, basisHash, plans, safety, facts, memberFacts, records };
  }
  async saveJointFacts(userId: string, revision: number, input: unknown) {
    revisionSchema.parse(revision);
    const facts = z.record(z.string(), z.boolean().nullable()).parse(input);
    if (Object.keys(facts).some(k => !Object.hasOwn(JOINT_FACTS, k))) throw new ContractError("INVALID_CONTEXT");
    return this.transaction(userId, async (tx, { member, members }) => {
      const workspace = await this.workspace(tx, member.coupleId, true);
      const evaluation = await this.evaluate(tx, workspace, members);
      if (!evaluation?.safety.every(s => s.cleared) || !evaluation.catalog.productionReady) throw new ContractError("SHARED_UNAVAILABLE");
      const existing = evaluation.records.find(r => r.userId === userId);
      if ((existing?.revision ?? 0) !== revision) throw new ContractError("CONFLICT");
      const id = existing?.id ?? randomUUID();
      const payload = seal(facts, `record:${id}:${userId}`);
      if (existing) await tx.contractRecord.update({ where: { id }, data: { payload, revision: { increment: 1 } } });
      else await tx.contractRecord.create({ data: { id, workspaceId: workspace.id, userId, kind: "JOINT_FACTS", recordKey: "current", revision: 1, payload } });
      await this.invalidateShared(tx, workspace.id);
    });
  }
  async saveOwnRecord(userId: string, revision: number, value: unknown) {
    revisionSchema.parse(revision);
    const input = ownRecordSchema.parse(value);
    if (input.kind === "EVENT" && (Date.parse(input.at) > Date.now() + 60000 || Date.parse(input.at) < Date.now() - 5 * 366 * 86400000)) throw new ContractError("INVALID_EVENT_DATE");
    return this.transaction(userId, async (tx, { member }) => {
      const workspace = await this.workspace(tx, member.coupleId, true);
      const session = workspace.sessions.find(s => s.userId === userId);
      if (!session) throw new ContractError("SESSION_UNAVAILABLE");
      if (input.kind === "PLAN") {
        const data = await withPrivateClearance(tx, session);
        const ownLimit = data.answers.Q200 === "C" ? 1 : data.answers.Q200 === "B" ? 2 : 3;
        const limit = Math.min(PLAN_LIMITS[input.intensity], ownLimit);
        if (input.priorities.length > limit || input.secondary.length > limit) throw new ContractError("PLAN_LIMIT");
      }
      const recordKey = input.kind === "EVENT" ? input.id : "current";
      const existing = await tx.contractRecord.findUnique({ where: { workspaceId_userId_kind_recordKey: { workspaceId: workspace.id, userId, kind: input.kind, recordKey } } });
      if ((existing?.revision ?? 0) !== revision) throw new ContractError("CONFLICT");
      const id = existing?.id ?? randomUUID();
      const payload = seal(input, `record:${id}:${userId}`);
      if (existing) await tx.contractRecord.update({ where: { id }, data: { revision: { increment: 1 }, payload } });
      else await tx.contractRecord.create({ data: { id, workspaceId: workspace.id, userId, kind: input.kind, recordKey, revision: 1, payload } });
    });
  }
  async deleteOwnRecord(userId: string, recordId: string, revision: number) {
    z.uuid().parse(recordId); revisionSchema.parse(revision);
    return this.transaction(userId, async (tx, { member }) => {
      const workspace = await this.workspace(tx, member.coupleId, true);
      const record = await tx.contractRecord.findFirst({ where: { id: recordId, workspaceId: workspace.id, userId, kind: { in: ["EVENT", "PLAN", "EMERGENCY", "TIMING"] } } });
      if (!record || record.revision !== revision) throw new ContractError("CONFLICT");
      await tx.contractRecord.delete({ where: { id: recordId } });
    });
  }
  async getOperations(userId: string) {
    return this.transaction(userId, async (tx, { member, members }) => {
      const workspace = await this.workspace(tx, member.coupleId);
      const records = await tx.contractRecord.findMany({ where: { workspaceId: workspace.id, userId, kind: { in: ["EVENT", "PLAN", "EMERGENCY", "TIMING"] } }, orderBy: { createdAt: "desc" } });
      const own = records.map(r => ({ id: r.id, revision: r.revision, data: ownRecordSchema.parse(unseal<OwnRecord>(r.payload, `record:${r.id}:${userId}`)) }));
      const events = own.flatMap(r => r.data.kind === "EVENT" ? [r.data] : []);
      const session = workspace.sessions.find(s => s.userId === userId);
      const data = session ? await withPrivateClearance(tx, session) : EMPTY_SESSION;
      const ownLimit = data.answers.Q200 === "C" ? 1 : data.answers.Q200 === "B" ? 2 : 3;
      const evaluation = await this.evaluate(tx, workspace, members);
      const canShare = !!evaluation?.catalog.productionReady && evaluation.safety.every(s => s.cleared);
      const partnerId = members.find(m => m.userId !== userId)!.userId;
      const partnerRecords = canShare ? await tx.contractRecord.findMany({ where: { workspaceId: workspace.id, userId: partnerId, kind: { in: ["EMERGENCY", "TIMING"] } } }) : [];
      const partnerData = partnerRecords.map(r => ownRecordSchema.parse(unseal<OwnRecord>(r.payload, `record:${r.id}:${partnerId}`)));
      const emergency = partnerData.find(r => r.kind === "EMERGENCY");
      const sharedEmergency = emergency?.kind === "EMERGENCY" ? Object.entries(emergency.fields).filter(([, field]) => field.shared).map(([id, field]) => ({ label: EMERGENCY_FIELDS[id as keyof typeof EMERGENCY_FIELDS], value: field.value })) : [];
      const timing = own.find(r => r.data.kind === "TIMING")?.data;
      const partnerTiming = partnerData.find(r => r.kind === "TIMING");
      const timingAgreed = timing?.kind === "TIMING" && partnerTiming?.kind === "TIMING" && contentHash(timing) === contentHash(partnerTiming);
      const calendar: { id: string; title: string; at: string }[] = [];
      if (canShare && timingAgreed && timing?.kind === "TIMING") {
        const decisions = await tx.contractDecision.findMany({ where: { workspaceId: workspace.id, basisHash: evaluation!.basisHash, activeKey: { not: null }, status: "CONFIRMED_BY_BOTH" } });
        const intervals: Record<string, [number[], "days" | "months", string]> = {
          "ND-Q011-01": [[7, 15, 30], "days", "Tempo de qualidade e lazer"], "ND-Q055-12": [[7, 15, 30], "days", "Momento de reconexão voluntária"], "ND-Q090-12": [[1, 3, 6], "months", "Revisão da intimidade"], "ND-Q120-01": [[1, 3, 6], "months", "Revisão espiritual"], "ND-Q150-01": [[12, 24, 12], "months", "Revisão do projeto de vida"], "ND-Q185-01": [[12, 24, 36], "months", "Revisão do contrato"],
        };
        const schedules: { id: string; title: string; months: number; days: number }[] = [{ id: "FINANCE", title: "Revisão financeira", months: 1, days: 0 }];
        for (const decision of decisions) {
          const content = unseal<DecisionContent>(decision.payload, decision.id);
          const interval = intervals[content.moduleId];
          if (interval) {
            const amount = interval[0][["A", "B", "C"].indexOf(content.choice)];
            // Monthly options preserve calendar month length.
            const monthly = interval[1] === "months" || (["ND-Q011-01", "ND-Q055-12"].includes(content.moduleId) && content.choice === "C");
            schedules.push({ id: content.moduleId, title: interval[2], months: monthly ? interval[1] === "months" ? amount : 1 : 0, days: monthly ? 0 : amount });
            if (content.moduleId === "ND-Q150-01" && content.choice === "C") schedules.push({ id: "LIFE_COMPLETE", title: "Revisão completa do projeto de vida", months: 36, days: 0 });
          }
          for (const [field, values] of Object.entries(content.parameters)) if (/data|prazo|fim|inicio/i.test(field) && /^20\d{2}-\d{2}-\d{2}$/.test(values[0])) calendar.push({ id: `${content.moduleId}:${field}`, title: `${this.catalog.questions.find(q => q.id === content.moduleId.match(/Q\d{3}/)?.[0])?.title ?? "Acordo"} — ${field}`, at: localDateTimeToInstant(`${values[0]}T23:59`, timing.timeZone) });
        }
        for (const schedule of schedules) {
          for (let cycle = 0; cycle < 10000; cycle++) {
            let at: string;
            try { at = calendarOffset(timing.anchor, timing.timeZone, schedule.months * cycle, schedule.days * cycle); } catch { continue; }
            if (Date.parse(at) >= Date.now()) { calendar.push({ id: schedule.id, title: schedule.title, at }); break; }
          }
        }
      }
      return { newEventId: randomUUID(), newTopicId: randomUUID(), reminders: eventReminders(events), own, tasks: evaluateEvents(events as ContractEvent[], new Date().toISOString()), ownLimit, sharedEmergency, partnerTiming: partnerTiming?.kind === "TIMING" ? partnerTiming : null, timingAgreed: !!timingAgreed,
        protocols: this.catalog.protocols ?? [], reviewGuides: this.catalog.reviewGuides ?? [], jointProtocols: canShare ? [...new Set(evaluation!.plans.flatMap(p => p.protocols.filter(protocol => protocol.privacy === "COMMON").map(protocol => protocol.id)))] : [], calendar: calendar.sort((a, b) => a.at.localeCompare(b.at)), timeZone: timing?.kind === "TIMING" ? timing.timeZone : "America/Sao_Paulo" };
    });
  }
  private async invalidateShared(tx: Tx, workspaceId: string) {
    await tx.contractDecision.updateMany({ where: { workspaceId, activeKey: { not: null } }, data: { activeKey: null, status: "SUPERSEDED" } });
    await this.invalidateDocuments(tx, workspaceId);
  }
  private async invalidateDocuments(tx: Tx, workspaceId: string) {
    await tx.contractDocument.updateMany({ where: { workspaceId, status: "ACKNOWLEDGED" }, data: { status: "ARCHIVED_ACKNOWLEDGED" } });
    await tx.contractDocument.updateMany({ where: { workspaceId, status: "DRAFT" }, data: { status: "SUPERSEDED" } });
    const records = await tx.contractRecord.findMany({ where: { workspaceId, kind: "DOCUMENT_ACK" } });
    for (const record of records) await tx.contractRecord.update({ where: { id: record.id }, data: { kind: "ACK_HISTORY", recordKey: record.id } });
  }
  async reopen(userId: string, sessionId: string, revision: number) {
    z.uuid().parse(sessionId); revisionSchema.parse(revision);
    return this.transaction(userId, async (tx, { member }) => {
      const { session, workspace } = await this.own(tx, userId, member.coupleId, sessionId, revision);
      await tx.contractSession.update({ where: { id: session.id }, data: { status: "IN_PROGRESS", submittedAt: null, consentedAt: null, revision: { increment: 1 } } });
      await tx.contractRecord.deleteMany({ where: { workspaceId: workspace.id, kind: "JOINT_FACTS" } });
      await this.invalidateShared(tx, workspace.id);
    });
  }
  async privateArea(userId: string) {
    return this.transaction(userId, async (tx, { member, members }) => {
      const workspace = await this.workspace(tx, member.coupleId);
      const session = workspace.sessions.find(s => s.userId === userId);
      if (!session) throw new ContractError("SESSION_UNAVAILABLE");
      const data = await withPrivateClearance(tx, session);
      const safety = assessSafety(workspace.edition.snapshot as unknown as Catalog, data);
      const reviewers = await tx.user.findMany({ where: { id: { in: configuredReviewers(), notIn: members.map(m => m.userId) } }, select: { id: true, name: true } });
      const reviews = await tx.contractPrivateReview.findMany({ where: { workspaceId: workspace.id, ownerId: userId }, select: { id: true, status: true, basisHash: true, revokedAt: true, consentedAt: true } });
      return { safety: { critical: safety.critical, reviewRequired: safety.reviewRequired, complete: safety.complete, cleared: safety.cleared }, reviewers,
        guidance: safety.cleared ? (this.catalog.privateGuidance ?? []).filter(g => data.answers[g.questionId] === g.answer && applicability(this.catalog.questions.find(q => q.id === g.questionId)!, data.context, data.privateClearance?.q181) === true).map(g => ({ id: g.questionId, title: this.catalog.questions.find(q => q.id === g.questionId)!.title, text: renderRegisteredTemplate(g.template, { Nome: members.find(m => m.userId === userId)!.user.name }) })) : [],
        q181: data.context.KNOWN_TRUST_BREACH === true && data.context.REBUILDING_CHOSEN === true,
        reviews: reviews.map(r => ({ id: r.id, status: r.revokedAt ? "REVOKED" : r.basisHash !== reviewBasis(data) ? "OUTDATED" : r.status, date: r.consentedAt.toISOString() })) };
    });
  }
  async requestPrivateReview(userId: string, reviewerId: string, consent: boolean, q151Requested = false) {
    z.boolean().parse(q151Requested); z.uuid().parse(reviewerId); if (consent !== true) throw new ContractError("REVIEW_CONSENT_REQUIRED");
    return this.transaction(userId, async (tx, { member, members }) => {
      if (!configuredReviewers().includes(reviewerId) || members.some(m => m.userId === reviewerId)) throw new ContractError("REVIEWER_UNAVAILABLE");
      const workspace = await this.workspace(tx, member.coupleId, true);
      const session = workspace.sessions.find(s => s.userId === userId);
      if (!session) throw new ContractError("SESSION_UNAVAILABLE");
      const data = await withPrivateClearance(tx, session);
      const existing = await tx.contractPrivateReview.findFirst({ where: { workspaceId: workspace.id, ownerId: userId, reviewerId, basisHash: reviewBasis(data), revokedAt: null, status: "REQUESTED" } });
      if (existing && unseal<ReviewSnapshot>(existing.payload, `review:${existing.id}:${userId}:${reviewerId}`).q151Requested === q151Requested) return;
      const id = randomUUID();
      const q181Requested = data.context.KNOWN_TRUST_BREACH === true && data.context.REBUILDING_CHOSEN === true;
      const snapshot: ReviewSnapshot = { sessionId: session.id, answers: Object.fromEntries(Object.entries(data.answers).filter(([id]) => /^Q10[1-9]$|^Q110$|^Q119$|^Q162$/.test(id) || q151Requested && id === "Q151")),
        privateAnswers: Object.fromEntries(Object.entries(data.privateAnswers).filter(([id]) => id === "PF-Q119-01" || (q181Requested && id === "PF-Q081-01"))),
        context: Object.fromEntries(Object.entries(data.context).filter(([id]) => ["HAS_CHILDREN_OR_DEPENDENTS", "RESPONSABILIDADE_PARENTAL", "KNOWN_TRUST_BREACH", "REBUILDING_CHOSEN"].includes(id))), neckCompressionReport: data.neckCompressionReport, q181Requested, q151Requested };
      await tx.contractPrivateReview.create({ data: { id, workspaceId: workspace.id, ownerId: userId, reviewerId, basisHash: reviewBasis(data), payload: seal(snapshot, `review:${id}:${userId}:${reviewerId}`) } });
    });
  }
  async revokePrivateReview(userId: string, id: string) {
    z.uuid().parse(id);
    return this.transaction(userId, async (tx, { member }) => {
      const workspace = await this.workspace(tx, member.coupleId, true);
      const review = await tx.contractPrivateReview.findFirst({ where: { id, ownerId: userId, workspaceId: workspace.id } });
      if (!review) throw new ContractError("REVIEW_UNAVAILABLE");
      await tx.contractPrivateReview.update({ where: { id }, data: { revokedAt: new Date(), status: "REVOKED", payload: seal({}, `review:${id}:${userId}:${review.reviewerId}`) } });
      await tx.contractSession.updateMany({ where: { workspaceId: workspace.id, userId }, data: { revision: { increment: 1 } } });
      await this.invalidateShared(tx, workspace.id);
    });
  }
  async assignedReviews(userId: string) {
    if (!configuredReviewers().includes(userId)) throw new ContractError("REVIEWER_UNAVAILABLE");
    const reviews = await this.client.contractPrivateReview.findMany({ where: { reviewerId: userId, revokedAt: null, status: "REQUESTED", workspace: { couple: { status: "ACTIVE" } } }, include: { owner: { select: { name: true } }, workspace: { include: { edition: true, sessions: true, couple: { include: { members: true } } } } } });
    return reviews.flatMap(r => {
      if (r.workspace.couple.members.length !== 2 || r.workspace.couple.members.some(m => m.userId === userId || m.activeMembershipKey !== m.userId)) return [];
      const session = r.workspace.sessions.find(s => s.userId === r.ownerId);
      if (!session || !r.workspace.couple.members.some(m => m.id === session.memberId && m.userId === r.ownerId) || reviewBasis(unseal<SessionData>(session.payload, `${session.id}:${session.userId}`)) !== r.basisHash) return [];
      const payload = unseal<ReviewSnapshot>(r.payload, `review:${r.id}:${r.ownerId}:${userId}`);
      const catalog = r.workspace.edition.snapshot as unknown as Catalog;
      return [{ id: r.id, name: r.owner.name, q181: payload.q181Requested, q151: payload.q151Requested === true, neckCompressionReport: payload.neckCompressionReport,
        questions: Object.entries(payload.answers).map(([id, answer]) => ({ id, prompt: catalog.questions.find(q => q.id === id)?.prompt, answer: catalog.questions.find(q => q.id === id)?.options.find(o => o.code === answer)?.text })),
        privateQuestions: Object.entries(payload.privateAnswers).map(([id, answer]) => ({ id, prompt: catalog.privateModules.find(q => q.id === id)?.prompt, answer: catalog.privateModules.find(q => q.id === id)?.options.find(o => o.code === answer)?.text })), context: payload.context }];
    });
  }
  async decidePrivateReview(userId: string, id: string, outcome: "CONTINUE" | "PAUSE" | "CLOSE") {
    z.uuid().parse(id); z.enum(["CONTINUE", "PAUSE", "CLOSE"]).parse(outcome);
    if (!configuredReviewers().includes(userId)) throw new ContractError("REVIEWER_UNAVAILABLE");
    return this.client.$transaction(async tx => {
      const review = await tx.contractPrivateReview.findFirst({ where: { id, reviewerId: userId, revokedAt: null, status: "REQUESTED" }, include: { workspace: { include: { edition: true, sessions: true, couple: { include: { members: true } } } } } });
      if (!review || review.workspace.couple.status !== "ACTIVE" || review.workspace.couple.members.length !== 2 || review.workspace.couple.members.some(m => m.userId === userId || m.activeMembershipKey !== m.userId)) throw new ContractError("REVIEW_UNAVAILABLE");
      await tx.contractWorkspace.update({ where: { id: review.workspaceId }, data: { revision: { increment: 1 } } });
      const session = review.workspace.sessions.find(s => s.userId === review.ownerId);
      if (!session || !review.workspace.couple.members.some(m => m.id === session.memberId && m.userId === review.ownerId)) throw new ContractError("REVIEW_UNAVAILABLE");
      const data = unseal<SessionData>(session.payload, `${session.id}:${session.userId}`);
      const catalog = review.workspace.edition.snapshot as unknown as Catalog;
      const safety = assessSafety(catalog, data);
      if (reviewBasis(data) !== review.basisHash || (outcome === "CONTINUE" && (safety.critical || !safety.complete))) throw new ContractError("REVIEW_UNAVAILABLE");
      const scope = `review:${id}:${review.ownerId}:${userId}`;
      const snapshot = unseal<ReviewSnapshot>(review.payload, scope);
      if (outcome === "CONTINUE" && snapshot.q151Requested && (!data.answers.Q151 || data.answers.Q151 === "C")) throw new ContractError("REVIEW_UNAVAILABLE");
      await tx.contractPrivateReview.update({ where: { id }, data: { status: outcome, decidedAt: new Date(), payload: seal({ ...snapshot, outcome }, scope) } });
      await tx.contractSession.update({ where: { id: session.id }, data: { revision: { increment: 1 } } });
      await this.invalidateShared(tx, review.workspaceId);
    }, { isolationLevel: "Serializable" });
  }
  async getShared(userId: string) {
    return this.transaction(userId, async (tx, { member, members }) => {
      const exists = await tx.contractWorkspace.findFirst({ where: { coupleId: member.coupleId, edition: { version: this.catalog.version } } });
      if (!exists) return NEUTRAL_SHARED_STATE;
      const workspace = await this.workspace(tx, member.coupleId);
      const evaluation = await this.evaluate(tx, workspace, members);
      // Constant projection for incomplete rules, no consent, private review or partner progress.
      if (!evaluation || !evaluation.safety.every(s => s.cleared) || !evaluation.catalog.productionReady) return NEUTRAL_SHARED_STATE;
      const decisions = await tx.contractDecision.findMany({ where: { workspaceId: workspace.id } });
      const baseIds = [...new Set(evaluation.plans.flatMap(p => p.modules))];
      const ids = [...new Set([...baseIds, ...decisions.filter(d => d.activeKey && baseIds.includes(d.moduleId.split(":")[0])).map(d => d.moduleId)])];
      const modules: JointDecisionDto[] = ids.map(id => {
        const definition = moduleDefinition(evaluation.catalog, id);
        const history = decisions.filter(d => d.moduleId === id);
        const decision = history.find(d => d.activeKey && d.basisHash === evaluation.basisHash);
        const confirmations = decision?.confirmations as Confirmation[] | undefined;
        const proposal = decision ? unseal<DecisionContent>(decision.payload, decision.id) : null;
        const preview = proposal ? renderDecision(definition, proposal, { "Nome 1": members[0].user.name, "Nome 2": members[1].user.name }) : undefined;
        return { id, title: definition.title, prompt: `${evaluation.catalog.questions.find(q => q.id === definition.questionId)?.title} — ${definition.prompt}`, repeatable: definition.repeatable, options: definition.options, fieldDefinitions: definition.fieldDefinitions, preview, revision: Math.max(0, ...history.map(d => d.revision)),
          proposal: decision ? unseal<DecisionContent>(decision.payload, decision.id) : null, hash: decision?.contentHash ?? null,
          status: decision?.status ?? "OPEN", ownConfirmed: !!confirmations?.some(c => c.memberId === member.id && c.hash === decision?.contentHash) };
      });
      return { state: "AVAILABLE" as const, message: `Confirmem a mesma proposta para registrar a decisão conjunta. Pessoa 1: ${members[0].user.name}. Pessoa 2: ${members[1].user.name}.`, modules,
        facts: { revision: evaluation.records.find(r => r.userId === userId)?.revision ?? 0, own: evaluation.memberFacts[members.findIndex(m => m.userId === userId)], agreed: evaluation.facts, fields: Object.entries(JOINT_FACTS).map(([id, label]) => ({ id, label })) } };
    });
  }
  async propose(userId: string, value: unknown) {
    const input = decisionSchema.parse(value);
    return this.transaction(userId, async (tx, { member, members }) => {
      const workspace = await this.workspace(tx, member.coupleId, true);
      const evaluation = await this.evaluate(tx, workspace, members);
      if (!evaluation || !evaluation.safety.every(s => s.cleared) || !evaluation.catalog.productionReady || !evaluation.plans.some(p => !p.blockers.length && p.modules.includes(input.moduleId.split(":")[0]))) throw new ContractError("SHARED_UNAVAILABLE");
      const definition = moduleDefinition(evaluation.catalog, input.moduleId);
      const content = { ...validateDecision(definition, input.choice, input.parameters), moduleId: input.moduleId };
      const previous = await tx.contractDecision.findFirst({ where: { workspaceId: workspace.id, moduleId: input.moduleId }, orderBy: { revision: "desc" } });
      if ((previous?.revision ?? 0) !== input.revision) throw new ContractError("CONFLICT");
      if (previous) await tx.contractDecision.update({ where: { id: previous.id }, data: { activeKey: null, status: "SUPERSEDED" } });
      const id = randomUUID();
      await tx.contractDecision.create({ data: { id, workspaceId: workspace.id, moduleId: input.moduleId, revision: input.revision + 1, activeKey: `${workspace.id}:${input.moduleId}`, basisHash: evaluation.basisHash, contentHash: proposalHash(content, input.revision + 1, evaluation.basisHash), payload: seal(content, id), confirmations: [] } });
      await this.invalidateDocuments(tx, workspace.id);
    });
  }
  async confirm(userId: string, moduleId: string, hash: string, consensus: boolean) {
    z.string().max(50).parse(moduleId); z.string().regex(/^[a-f0-9]{64}$/).parse(hash); z.boolean().parse(consensus);
    return this.transaction(userId, async (tx, { member, members }) => {
      const workspace = await this.workspace(tx, member.coupleId, true);
      const evaluation = await this.evaluate(tx, workspace, members);
      if (!evaluation || !evaluation.safety.every(s => s.cleared) || !evaluation.catalog.productionReady || !evaluation.plans.some(p => !p.blockers.length && p.modules.includes(moduleId.split(":")[0]))) throw new ContractError("SHARED_UNAVAILABLE");
      moduleDefinition(evaluation.catalog, moduleId);
      const decision = await tx.contractDecision.findUnique({ where: { activeKey: `${workspace.id}:${moduleId}` } });
      if (!decision || decision.contentHash !== hash || decision.basisHash !== evaluation.basisHash || decision.status === "NO_CONSENSUS") throw new ContractError("CONFLICT");
      const confirmations = (decision.confirmations as Confirmation[]).filter(c => c.memberId !== member.id);
      if (consensus) confirmations.push({ memberId: member.id, hash, at: new Date().toISOString() });
      const status = !consensus ? "NO_CONSENSUS" : bothConfirmed(members.map(m => m.id), hash, confirmations) ? "CONFIRMED_BY_BOTH" : "PROPOSED";
      await tx.contractDecision.update({ where: { id: decision.id }, data: { confirmations: consensus ? confirmations : [], status } });
      if (!consensus) await this.invalidateDocuments(tx, workspace.id);
    });
  }
  async withdrawExtraDecision(userId: string, moduleId: string, hash: string) {
    z.string().max(50).parse(moduleId); z.string().regex(/^[a-f0-9]{64}$/).parse(hash);
    return this.transaction(userId, async (tx, { member, members }) => {
      const workspace = await this.workspace(tx, member.coupleId, true);
      const evaluation = await this.evaluate(tx, workspace, members);
      const definition = moduleDefinition(this.catalog, moduleId);
      if (!moduleId.includes(":") || !definition.repeatable || !evaluation?.catalog.productionReady || !evaluation.safety.every(s => s.cleared)) throw new ContractError("SHARED_UNAVAILABLE");
      const decision = await tx.contractDecision.findUnique({ where: { activeKey: `${workspace.id}:${moduleId}` } });
      if (!decision || decision.contentHash !== hash || decision.basisHash !== evaluation.basisHash) throw new ContractError("CONFLICT");
      await tx.contractDecision.update({ where: { id: decision.id }, data: { activeKey: null, status: "WITHDRAWN" } });
      await this.invalidateDocuments(tx, workspace.id);
    });
  }
  async generate(userId: string, reason = "") {
    z.string().trim().max(300).refine(v => !/[{}<>\u0000-\u001f]/.test(v)).parse(reason);
    return this.transaction(userId, async (tx, { member, members }) => {
      const workspace = await this.workspace(tx, member.coupleId, true);
      const evaluation = await this.evaluate(tx, workspace, members);
      if (evaluation) await tx.contractEvaluation.upsert({ where: { workspaceId_basisHash: { workspaceId: workspace.id, basisHash: evaluation.basisHash } },
        create: { workspaceId: workspace.id, basisHash: evaluation.basisHash, engineVersion: "1.4.0-engine.2", payload: seal(evaluation.plans, `${workspace.id}:${evaluation.basisHash}`) }, update: {} });
      // Deployment flags cannot bypass the compiled edition's readiness gate.
      if (!evaluation || !evaluation.catalog.productionReady || !evaluation.safety.every(s => s.cleared)) return { state: "UNAVAILABLE" as const, message: NEUTRAL_SHARED_STATE.message };
      const decisions = await tx.contractDecision.findMany({ where: { workspaceId: workspace.id, basisHash: evaluation.basisHash, activeKey: { not: null } } });
      const documentBasis = contentHash({ evaluation: evaluation.basisHash, decisions: decisions.map(d => ({ id: d.id, hash: d.contentHash, status: d.status })).sort((a, b) => a.id.localeCompare(b.id)) });
      let draft = generateRegisteredDraft({ catalog: evaluation.catalog, catalogHash: workspace.edition.contentHash, plans: evaluation.plans,
        members: [{ id: members[0].id, name: members[0].user.name }, { id: members[1].id, name: members[1].user.name }],
        consentedMemberIds: members.map(m => m.id), safetyCleared: true, criticalSafety: evaluation.safety.some(s => s.critical),
        unresolvedDependencies: evaluation.catalog.crossRules.filter(r => !r.predicate).map(r => r.id),
        decisions: decisions.map(d => ({ content: unseal<DecisionContent>(d.payload, d.id), hash: d.contentHash, revision: d.revision, basisHash: d.basisHash, confirmations: d.confirmations as Confirmation[] })) });
      const previous = await tx.contractDocument.findFirst({ where: { workspaceId: workspace.id, status: { in: ["ACKNOWLEDGED", "ARCHIVED_ACKNOWLEDGED"] }, basisHash: { not: documentBasis } }, orderBy: { createdAt: "desc" } });
      if (previous) {
        if (!reason.trim()) throw new ContractError("REVISION_REASON_REQUIRED");
        const old = unseal<ContractDraft>(previous.payload, `${workspace.id}:${previous.basisHash}`);
        const { contentHash: previousHash, ...oldBody } = old;
        if (contentHash(oldBody) !== previousHash || previousHash !== previous.contentHash) throw new ContractError("DOCUMENT_INTEGRITY");
        const { contentHash: _hash, ...body } = draft;
        void _hash;
        const next = { ...body, amendment: { previousHash, reason: reason.trim(), changedSectionIds: [...new Set([...old.sections, ...draft.sections].map(s => s.id))].filter(id => contentHash(old.sections.find(s => s.id === id) ?? null) !== contentHash(draft.sections.find(s => s.id === id) ?? null)) } };
        draft = { ...next, contentHash: contentHash(next) };
      }
      const existing = await tx.contractDocument.findUnique({ where: { workspaceId_basisHash: { workspaceId: workspace.id, basisHash: documentBasis } } });
      if (existing && existing.contentHash !== draft.contentHash) throw new ContractError("CONFLICT");
      const id = randomUUID();
      await tx.contractDocument.upsert({ where: { workspaceId_basisHash: { workspaceId: workspace.id, basisHash: documentBasis } },
        create: { id, workspaceId: workspace.id, basisHash: documentBasis, contentHash: draft.contentHash, payload: seal(draft, `${workspace.id}:${documentBasis}`) }, update: {} });
      return { state: "DRAFT" as const, message: "Rascunho preparado para leitura dos dois." };
    });
  }
  async documentHistory(userId: string) {
    return this.transaction(userId, async (tx, { member, members }) => {
      const workspace = await this.workspace(tx, member.coupleId);
      const evaluation = await this.evaluate(tx, workspace, members);
      if (!evaluation?.catalog.productionReady || !evaluation.safety.every(s => s.cleared)) return [];
      const documents = await tx.contractDocument.findMany({ where: { workspaceId: workspace.id, status: { in: ["ACKNOWLEDGED", "ARCHIVED_ACKNOWLEDGED"] } }, orderBy: { createdAt: "desc" } });
      const acknowledgments = await tx.contractRecord.findMany({ where: { workspaceId: workspace.id, kind: { in: ["DOCUMENT_ACK", "ACK_HISTORY"] }, userId: { in: members.map(m => m.userId) } } });
      return documents.map(document => {
        const draft = unseal<ContractDraft>(document.payload, `${workspace.id}:${document.basisHash}`);
        const { contentHash: hash, ...body } = draft;
        if (hash !== document.contentHash || contentHash(body) !== hash) throw new ContractError("DOCUMENT_INTEGRITY");
        const acceptances = acknowledgments.flatMap(record => {
          const ack = unseal<{ hash: string; basisHash: string; name?: string; at: string }>(record.payload, `record:${record.id}:${record.userId}`);
          return ack.hash === hash && ack.basisHash === document.basisHash ? [{ name: ack.name ?? members.find(m => m.userId === record.userId)!.user.name, at: ack.at }] : [];
        });
        return { id: document.id, draft, acceptances, date: document.createdAt.toISOString() };
      });
    });
  }
  async getDraft(userId: string): Promise<ContractDraft | null> {
    return this.transaction(userId, async (tx, { member, members }) => {
      const workspace = await this.workspace(tx, member.coupleId);
      const evaluation = await this.evaluate(tx, workspace, members);
      if (!evaluation || !evaluation.catalog.productionReady || !evaluation.safety.every(s => s.cleared)) return null;
      const document = await tx.contractDocument.findFirst({ where: { workspaceId: workspace.id, status: { in: ["DRAFT", "ACKNOWLEDGED"] } }, orderBy: { createdAt: "desc" } });
      if (!document) return null;
      const decisions = await tx.contractDecision.findMany({ where: { workspaceId: workspace.id, basisHash: evaluation.basisHash, activeKey: { not: null } } });
      const expectedBasis = contentHash({ evaluation: evaluation.basisHash, decisions: decisions.map(d => ({ id: d.id, hash: d.contentHash, status: d.status })).sort((a, b) => a.id.localeCompare(b.id)) });
      if (expectedBasis !== document.basisHash) return null;
      const draft = unseal<ContractDraft>(document.payload, `${workspace.id}:${document.basisHash}`);
      const { contentHash: hash, ...content } = draft;
      if (contentHash(content) !== hash || hash !== document.contentHash) throw new ContractError("DOCUMENT_INTEGRITY");
      return draft;
    });
  }
  async documentAcceptances(userId: string, hash: string) {
    z.string().regex(/^[a-f0-9]{64}$/).parse(hash);
    return this.transaction(userId, async (tx, { member, members }) => {
      const workspace = await this.workspace(tx, member.coupleId);
      const evaluation = await this.evaluate(tx, workspace, members);
      if (!evaluation?.catalog.productionReady || !evaluation.safety.every(s => s.cleared)) return [];
      const records = await tx.contractRecord.findMany({ where: { workspaceId: workspace.id, kind: "DOCUMENT_ACK", recordKey: hash, userId: { in: members.map(m => m.userId) } } });
      return records.map(r => ({ own: r.userId === userId, name: members.find(m => m.userId === r.userId)!.user.name, at: r.createdAt.toISOString() }));
    });
  }
  async acceptDocument(userId: string, hash: string) {
    z.string().regex(/^[a-f0-9]{64}$/).parse(hash);
    return this.transaction(userId, async (tx, { member, members }) => {
      const workspace = await this.workspace(tx, member.coupleId, true);
      const evaluation = await this.evaluate(tx, workspace, members);
      if (!evaluation?.catalog.productionReady || !evaluation.safety.every(s => s.cleared)) throw new ContractError("SHARED_UNAVAILABLE");
      const decisions = await tx.contractDecision.findMany({ where: { workspaceId: workspace.id, basisHash: evaluation.basisHash, activeKey: { not: null } } });
      const basisHash = contentHash({ evaluation: evaluation.basisHash, decisions: decisions.map(d => ({ id: d.id, hash: d.contentHash, status: d.status })).sort((a, b) => a.id.localeCompare(b.id)) });
      const document = await tx.contractDocument.findFirst({ where: { workspaceId: workspace.id, contentHash: hash, basisHash, status: { in: ["DRAFT", "ACKNOWLEDGED"] } } });
      if (!document) throw new ContractError("CONFLICT");
      const content = unseal<ContractDraft>(document.payload, `${workspace.id}:${basisHash}`);
      const { contentHash: digest, ...body } = content;
      if (digest !== hash || contentHash(body) !== hash) throw new ContractError("DOCUMENT_INTEGRITY");
      const id = randomUUID();
      await tx.contractRecord.upsert({ where: { workspaceId_userId_kind_recordKey: { workspaceId: workspace.id, userId, kind: "DOCUMENT_ACK", recordKey: hash } },
        create: { id, workspaceId: workspace.id, userId, kind: "DOCUMENT_ACK", recordKey: hash, payload: seal({ hash, basisHash, name: members.find(m => m.userId === userId)!.user.name, edition: evaluation.catalog.version, at: new Date().toISOString() }, `record:${id}:${userId}`) }, update: {} });
      const count = await tx.contractRecord.count({ where: { workspaceId: workspace.id, kind: "DOCUMENT_ACK", recordKey: hash, userId: { in: members.map(m => m.userId) } } });
      if (count === 2) await tx.contractDocument.update({ where: { id: document.id }, data: { status: "ACKNOWLEDGED" } });
    });
  }
  async getFund(userId: string) {
    return this.transaction(userId, async (tx, { member, members }) => {
      const workspace = await this.workspace(tx, member.coupleId);
      const evaluation = await this.evaluate(tx, workspace, members);
      if (!evaluation?.catalog.productionReady || !evaluation.safety.every(s => s.cleared)) return { available: false, documentHash: null, entries: [] as { id: string; hash: string; reference: string; status: string; ownConfirmed: boolean }[], totalCents: 0 };
      const document = await tx.contractDocument.findFirst({ where: { workspaceId: workspace.id, status: "ACKNOWLEDGED" }, orderBy: { createdAt: "desc" } });
      if (!document) return { available: false, documentHash: null, entries: [], totalCents: 0 };
      const records = await tx.contractRecord.findMany({ where: { workspaceId: workspace.id, kind: "FUND" }, orderBy: { createdAt: "asc" } });
      const entries = records.flatMap(record => {
        const entry = unseal<FundEntry>(record.payload, `record:${record.id}:${record.userId}`);
        if (entry.basisHash !== evaluation.basisHash || entry.documentHash !== document.contentHash) return [];
        return [{ id: record.id, hash: entry.hash, reference: entry.reference, status: entry.status, ownConfirmed: entry.confirmations.some(c => c.memberId === member.id && c.hash === entry.hash) }];
      });
      return { available: true, documentHash: document.contentHash, entries, totalCents: entries.filter(e => e.status === "CONFIRMED").length * 1000 };
    });
  }
  async proposeFund(userId: string, value: unknown) {
    const input = fundProposalSchema.parse(value);
    return this.transaction(userId, async (tx, { member, members }) => {
      const workspace = await this.workspace(tx, member.coupleId, true);
      const evaluation = await this.evaluate(tx, workspace, members);
      if (!evaluation?.catalog.productionReady || !evaluation.safety.every(s => s.cleared)) throw new ContractError("SHARED_UNAVAILABLE");
      const document = await tx.contractDocument.findFirst({ where: { workspaceId: workspace.id, contentHash: input.documentHash, status: "ACKNOWLEDGED" } });
      if (!document) throw new ContractError("SHARED_UNAVAILABLE");
      const id = randomUUID();
      const body = { ...input, amountCents: 1000 as const, currency: "BRL" as const, basisHash: evaluation.basisHash };
      const hash = contentHash(body);
      // Idempotent proposal identity; a contested record cannot be silently replaced.
      const existing = await tx.contractRecord.findFirst({ where: { workspaceId: workspace.id, kind: "FUND", recordKey: hash } });
      if (existing) return;
      const entry: FundEntry = { ...body, hash, confirmations: [], status: "PROPOSED" };
      await tx.contractRecord.create({ data: { id, workspaceId: workspace.id, userId, kind: "FUND", recordKey: hash, payload: seal(entry, `record:${id}:${userId}`) } });
    });
  }
  async confirmFund(userId: string, recordId: string, hash: string, accept: boolean) {
    z.uuid().parse(recordId); z.string().regex(/^[a-f0-9]{64}$/).parse(hash); z.boolean().parse(accept);
    return this.transaction(userId, async (tx, { member, members }) => {
      const workspace = await this.workspace(tx, member.coupleId, true);
      const evaluation = await this.evaluate(tx, workspace, members);
      if (!evaluation?.catalog.productionReady || !evaluation.safety.every(s => s.cleared)) throw new ContractError("SHARED_UNAVAILABLE");
      const record = await tx.contractRecord.findFirst({ where: { id: recordId, workspaceId: workspace.id, kind: "FUND", userId: { in: members.map(m => m.userId) } } });
      if (!record) throw new ContractError("SHARED_UNAVAILABLE");
      const scope = `record:${record.id}:${record.userId}`;
      const entry = unseal<FundEntry>(record.payload, scope);
      if (entry.hash !== hash || entry.basisHash !== evaluation.basisHash || entry.status === "CONTESTED") throw new ContractError("CONFLICT");
      if (!await tx.contractDocument.findFirst({ where: { workspaceId: workspace.id, status: "ACKNOWLEDGED", contentHash: entry.documentHash } })) throw new ContractError("SHARED_UNAVAILABLE");
      entry.confirmations = entry.confirmations.filter(c => c.memberId !== member.id);
      if (accept) entry.confirmations.push({ memberId: member.id, hash, at: new Date().toISOString() });
      else entry.confirmations = [];
      entry.status = !accept ? "CONTESTED" : bothConfirmed(members.map(m => m.id), hash, entry.confirmations) ? "CONFIRMED" : "PROPOSED";
      await tx.contractRecord.update({ where: { id: recordId }, data: { payload: seal(entry, scope), revision: { increment: 1 } } });
    });
  }
  async exportOwnData(userId: string) {
    const sessions = await this.client.contractSession.findMany({ where: { userId }, include: { workspace: { include: { edition: { select: { version: true } } } } } });
    const records = await this.client.contractRecord.findMany({ where: { userId, kind: { in: ["EVENT", "PLAN", "EMERGENCY", "TIMING", "JOINT_FACTS", "DOCUMENT_ACK"] } } });
    return { exportedAt: new Date().toISOString(), sessions: sessions.map(s => ({ version: s.workspace.edition.version, status: s.status, submittedAt: s.submittedAt?.toISOString() ?? null, consentedAt: s.consentedAt?.toISOString() ?? null, data: unseal<SessionData>(s.payload, `${s.id}:${userId}`) })), records: records.map(r => ({ kind: r.kind, data: unseal(r.payload, `record:${r.id}:${userId}`) })) };
  }
  async deleteOwnData(userId: string, confirmation: string) {
    if (confirmation !== "EXCLUIR MEUS DADOS") throw new ContractError("DELETE_CONFIRMATION_REQUIRED");
    // Ownership remains sufficient after a couple is dissolved or access is revoked.
    return this.client.$transaction(async tx => {
      const sessions = await tx.contractSession.findMany({ where: { userId }, select: { workspaceId: true } });
      const records = await tx.contractRecord.findMany({ where: { userId }, select: { workspaceId: true } });
      const workspaces = [...new Set([...sessions, ...records].map(s => s.workspaceId))].sort();
      for (const id of workspaces) await tx.contractWorkspace.update({ where: { id }, data: { revision: { increment: 1 } } });
      await tx.contractDocument.deleteMany({ where: { workspaceId: { in: workspaces } } });
      await tx.contractEvaluation.deleteMany({ where: { workspaceId: { in: workspaces } } });
      await tx.contractDecision.deleteMany({ where: { workspaceId: { in: workspaces } } });
      await tx.contractRecord.deleteMany({ where: { OR: [{ userId }, { workspaceId: { in: workspaces }, kind: { in: ["DOCUMENT_ACK", "ACK_HISTORY", "JOINT_FACTS", "FUND"] } }] } });
      await tx.contractPrivateReview.deleteMany({ where: { ownerId: userId } });
      await tx.contractSession.deleteMany({ where: { userId } });
    }, { isolationLevel: "Serializable", timeout: 30000 });
  }
}
