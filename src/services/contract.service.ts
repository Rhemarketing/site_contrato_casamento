import "server-only";
import { randomUUID } from "node:crypto";
import { Prisma, type PrismaClient } from "@/generated/prisma/client";
import { z } from "zod";
import { applicability, assessSafety, ContractError, EMPTY_SESSION, planPair, responseState } from "@/features/contract/domain/engine";
import { bothConfirmed, validateDecision, type DecisionContent } from "@/features/contract/domain/decisions";
import type { Catalog, Facts, OwnSessionDto, SessionData } from "@/features/contract/domain/types";
import { contractCatalog } from "@/features/contract/server/catalog";
import { requireContractPreview } from "@/features/contract/server/access";
import { contentHash, proposalHash, seal, unseal } from "@/features/contract/server/privacy";
import { generateRegisteredDraft, type ContractDraft } from "@/features/contract/server/generator";

const letter = z.enum(["A", "B", "C"]);
const revisionSchema = z.number().int().nonnegative();
const answerSchema = z.object({ sessionId: z.uuid(), revision: revisionSchema, questionId: z.string().regex(/^Q\d{3}$/), answer: letter, privateAnswer: letter.optional(), neckCompressionReport: z.boolean().optional() }).strict();
const contextSchema = z.object({ sessionId: z.uuid(), revision: revisionSchema, context: z.record(z.string(), z.boolean().nullable()) }).strict();
const decisionSchema = z.object({ moduleId: z.string().max(50), revision: revisionSchema, choice: letter, parameters: z.record(z.string(), z.array(z.string().max(80)).max(11)) }).strict();
type Tx = Prisma.TransactionClient;
type Confirmation = { memberId: string; hash: string; at: string };
export const NEUTRAL_SHARED_STATE = { state: "UNAVAILABLE" as const, message: "Esta etapa ainda não está disponível. Você pode continuar usando sua área individual.", modules: [] as JointDecisionDto[] };
export type JointDecisionDto = { id: string; title: string; prompt: string; options: Catalog["modules"][number]["options"]; revision: number; proposal: DecisionContent | null; hash: string | null; status: string; ownConfirmed: boolean };

export class ContractService {
  constructor(private readonly client: PrismaClient, private readonly catalog = contractCatalog,
    private readonly checkAccess: (userId: string) => void = requireContractPreview) {}

  private async context(tx: Tx, userId: string) {
    this.checkAccess(userId);
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
  private data(session: { id: string; userId: string; payload: string }) { return unseal<SessionData>(session.payload, `${session.id}:${session.userId}`); }
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
      const data = this.data(session);
      const questions = catalog.questions.map(q => {
        const state = responseState(q, data);
        const displayable = !["BLOCKED_BY_POLICY", "NOT_APPLICABLE"].includes(state);
        const privateModule = displayable ? catalog.privateModules.find(m => m.questionId === q.id && m.trigger.includes(data.answers[q.id])) ?? null : null;
        return { id: q.id, title: q.title, order: q.order, prompt: displayable ? q.prompt : null, period: q.period, state,
          options: displayable ? q.options.map(({ code, text }) => ({ code, text })) : [],
          contextFields: Object.keys(q.applicability?.context_equals ?? {}), privateModule,
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
      const data = this.data(session);
      const question = catalog.questions.find(q => q.id === input.questionId);
      if (!question || applicability(question, data.context) !== true) throw new ContractError("QUESTION_UNAVAILABLE");
      const privateModule = catalog.privateModules.find(m => m.questionId === question.id && m.trigger.includes(input.answer));
      if (input.privateAnswer && !privateModule) throw new ContractError("INVALID_ANSWER");
      if (input.neckCompressionReport !== undefined && question.id !== "Q103") throw new ContractError("INVALID_ANSWER");
      data.answers[question.id] = input.answer;
      for (const definition of catalog.privateModules.filter(m => m.questionId === question.id)) delete data.privateAnswers[definition.id];
      if (privateModule && input.privateAnswer) data.privateAnswers[privateModule.id] = input.privateAnswer;
      if (question.id === "Q103") data.neckCompressionReport = input.neckCompressionReport ?? null;
      await tx.contractSession.update({ where: { id: session.id }, data: { payload: seal(data, `${session.id}:${userId}`), revision: { increment: 1 } } });
    });
  }
  async saveContext(userId: string, value: unknown) {
    const input = contextSchema.parse(value);
    return this.transaction(userId, async (tx, { member }) => {
      const { session, catalog } = await this.own(tx, userId, member.coupleId, input.sessionId, input.revision);
      if (session.status !== "IN_PROGRESS") throw new ContractError("SESSION_CLOSED");
      const allowed = new Set(catalog.questions.flatMap(q => Object.keys(q.applicability?.context_equals ?? {})));
      if (Object.keys(input.context).some(k => !allowed.has(k))) throw new ContractError("INVALID_CONTEXT");
      const data = this.data(session);
      data.context = { ...data.context, ...input.context };
      for (const q of catalog.questions) if (applicability(q, data.context) !== true) {
        delete data.answers[q.id];
        for (const m of catalog.privateModules.filter(m => m.questionId === q.id)) delete data.privateAnswers[m.id];
        if (q.id === "Q103") data.neckCompressionReport = null;
      }
      await tx.contractSession.update({ where: { id: session.id }, data: { payload: seal(data, `${session.id}:${userId}`), revision: { increment: 1 } } });
    });
  }
  async submit(userId: string, sessionId: string, revision: number) {
    z.uuid().parse(sessionId); revisionSchema.parse(revision);
    return this.transaction(userId, async (tx, { member }) => {
      const { session, catalog } = await this.own(tx, userId, member.coupleId, sessionId, revision);
      if (session.status === "SUBMITTED") return;
      const data = this.data(session);
      if (catalog.questions.some(q => ["NOT_ANSWERED", "BLOCKED_BY_POLICY"].includes(responseState(q, data)))) throw new ContractError("SUBMISSION_INCOMPLETE");
      if (catalog.privateModules.some(m => m.trigger.includes(data.answers[m.questionId]) && !data.privateAnswers[m.id])) throw new ContractError("SUBMISSION_INCOMPLETE");
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
      await tx.contractDecision.updateMany({ where: { workspaceId: workspace.id, activeKey: { not: null } }, data: { activeKey: null, status: "SUPERSEDED" } });
      await tx.contractDocument.updateMany({ where: { workspaceId: workspace.id }, data: { status: "SUPERSEDED" } });
    });
  }
  private async evaluate(tx: Tx, workspace: Awaited<ReturnType<ContractService["workspace"]>>, members: Awaited<ReturnType<ContractService["context"]>>["members"]) {
    const catalog = workspace.edition.snapshot as unknown as Catalog;
    const sessions = members.map(m => workspace.sessions.find(s => s.userId === m.userId && s.memberId === m.id));
    if (sessions.some(s => !s || s.status !== "SUBMITTED" || !s.consentedAt)) return null;
    const completeSessions = sessions.map(s => s!);
    const data = completeSessions.map(s => this.data(s));
    const safety = data.map(d => assessSafety(catalog, d));
    const basisHash = contentHash({ edition: workspace.edition.contentHash, engine: "1.4.0-engine.1", sessions: completeSessions.map(s => ({ id: s.id, revision: s.revision })) });
    const plans = catalog.questions.map(q => planPair(catalog, { questionId: q.id, members: [members[0].id, members[1].id],
      answers: [responseState(q, data[0]), responseState(q, data[1])], applicable: [applicability(q, data[0].context), applicability(q, data[1].context)],
      criticalSafety: safety.some(s => s.critical), safetyCleared: safety.every(s => s.cleared), facts: {} as Facts }));
    return { catalog, basisHash, plans, safety };
  }
  async getShared(userId: string) {
    return this.transaction(userId, async (tx, { member, members }) => {
      const exists = await tx.contractWorkspace.findFirst({ where: { coupleId: member.coupleId, edition: { version: this.catalog.version } } });
      if (!exists) return NEUTRAL_SHARED_STATE;
      const workspace = await this.workspace(tx, member.coupleId);
      const evaluation = await this.evaluate(tx, workspace, members);
      // Constant projection for incomplete rules, no consent, private review or partner progress.
      if (!evaluation || !evaluation.safety.every(s => s.cleared) || !evaluation.catalog.productionReady) return NEUTRAL_SHARED_STATE;
      const ids = [...new Set(evaluation.plans.flatMap(p => p.modules))];
      const decisions = await tx.contractDecision.findMany({ where: { workspaceId: workspace.id } });
      const modules: JointDecisionDto[] = ids.map(id => {
        const definition = evaluation.catalog.modules.find(m => m.id === id)!;
        const history = decisions.filter(d => d.moduleId === id);
        const decision = history.find(d => d.activeKey && d.basisHash === evaluation.basisHash);
        const confirmations = decision?.confirmations as Confirmation[] | undefined;
        return { id, title: definition.title, prompt: definition.prompt!, options: definition.options, revision: Math.max(0, ...history.map(d => d.revision)),
          proposal: decision ? unseal<DecisionContent>(decision.payload, decision.id) : null, hash: decision?.contentHash ?? null,
          status: decision?.status ?? "OPEN", ownConfirmed: !!confirmations?.some(c => c.memberId === member.id && c.hash === decision?.contentHash) };
      });
      return { state: "AVAILABLE" as const, message: "Confirmem a mesma proposta para registrar a decisão conjunta.", modules };
    });
  }
  async propose(userId: string, value: unknown) {
    const input = decisionSchema.parse(value);
    return this.transaction(userId, async (tx, { member, members }) => {
      const workspace = await this.workspace(tx, member.coupleId, true);
      const evaluation = await this.evaluate(tx, workspace, members);
      if (!evaluation || !evaluation.safety.every(s => s.cleared) || !evaluation.catalog.productionReady || !evaluation.plans.some(p => !p.blockers.length && p.modules.includes(input.moduleId))) throw new ContractError("SHARED_UNAVAILABLE");
      const definition = evaluation.catalog.modules.find(m => m.id === input.moduleId)!;
      const content = validateDecision(definition, input.choice, input.parameters);
      const previous = await tx.contractDecision.findFirst({ where: { workspaceId: workspace.id, moduleId: definition.id }, orderBy: { revision: "desc" } });
      if ((previous?.revision ?? 0) !== input.revision) throw new ContractError("CONFLICT");
      if (previous) await tx.contractDecision.update({ where: { id: previous.id }, data: { activeKey: null, status: "SUPERSEDED" } });
      const id = randomUUID();
      await tx.contractDecision.create({ data: { id, workspaceId: workspace.id, moduleId: definition.id, revision: input.revision + 1, activeKey: `${workspace.id}:${definition.id}`, basisHash: evaluation.basisHash, contentHash: proposalHash(content, input.revision + 1, evaluation.basisHash), payload: seal(content, id), confirmations: [] } });
      await tx.contractDocument.updateMany({ where: { workspaceId: workspace.id }, data: { status: "SUPERSEDED" } });
    });
  }
  async confirm(userId: string, moduleId: string, hash: string, consensus: boolean) {
    z.string().max(50).parse(moduleId); z.string().regex(/^[a-f0-9]{64}$/).parse(hash); z.boolean().parse(consensus);
    return this.transaction(userId, async (tx, { member, members }) => {
      const workspace = await this.workspace(tx, member.coupleId, true);
      const evaluation = await this.evaluate(tx, workspace, members);
      if (!evaluation || !evaluation.safety.every(s => s.cleared) || !evaluation.catalog.productionReady || !evaluation.plans.some(p => !p.blockers.length && p.modules.includes(moduleId))) throw new ContractError("SHARED_UNAVAILABLE");
      const decision = await tx.contractDecision.findUnique({ where: { activeKey: `${workspace.id}:${moduleId}` } });
      if (!decision || decision.contentHash !== hash || decision.basisHash !== evaluation.basisHash || decision.status === "NO_CONSENSUS") throw new ContractError("CONFLICT");
      const confirmations = (decision.confirmations as Confirmation[]).filter(c => c.memberId !== member.id);
      if (consensus) confirmations.push({ memberId: member.id, hash, at: new Date().toISOString() });
      const status = !consensus ? "NO_CONSENSUS" : bothConfirmed(members.map(m => m.id), hash, confirmations) ? "CONFIRMED_BY_BOTH" : "PROPOSED";
      await tx.contractDecision.update({ where: { id: decision.id }, data: { confirmations: consensus ? confirmations : [], status } });
      if (!consensus) await tx.contractDocument.updateMany({ where: { workspaceId: workspace.id }, data: { status: "SUPERSEDED" } });
    });
  }
  async generate(userId: string) {
    return this.transaction(userId, async (tx, { member, members }) => {
      const workspace = await this.workspace(tx, member.coupleId, true);
      const evaluation = await this.evaluate(tx, workspace, members);
      if (evaluation) await tx.contractEvaluation.upsert({ where: { workspaceId_basisHash: { workspaceId: workspace.id, basisHash: evaluation.basisHash } },
        create: { workspaceId: workspace.id, basisHash: evaluation.basisHash, engineVersion: "1.4.0-engine.1", payload: seal(evaluation.plans, `${workspace.id}:${evaluation.basisHash}`) }, update: {} });
      // The shipped edition is unreleased. No env flag can promote it to production.
      if (!evaluation || !evaluation.catalog.productionReady || !evaluation.safety.every(s => s.cleared)) return { state: "UNAVAILABLE" as const, message: NEUTRAL_SHARED_STATE.message };
      const decisions = await tx.contractDecision.findMany({ where: { workspaceId: workspace.id, basisHash: evaluation.basisHash, activeKey: { not: null } } });
      const documentBasis = contentHash({ evaluation: evaluation.basisHash, decisions: decisions.map(d => ({ id: d.id, hash: d.contentHash, status: d.status })).sort((a, b) => a.id.localeCompare(b.id)) });
      const draft = generateRegisteredDraft({ catalog: evaluation.catalog, catalogHash: workspace.edition.contentHash, plans: evaluation.plans,
        members: [{ id: members[0].id, name: members[0].user.name }, { id: members[1].id, name: members[1].user.name }],
        consentedMemberIds: members.map(m => m.id), safetyCleared: true, criticalSafety: evaluation.safety.some(s => s.critical),
        unresolvedDependencies: evaluation.catalog.crossRules.filter(r => !r.predicate).map(r => r.id),
        decisions: decisions.map(d => ({ content: unseal<DecisionContent>(d.payload, d.id), hash: d.contentHash, revision: d.revision, basisHash: d.basisHash, confirmations: d.confirmations as Confirmation[] })) });
      const id = randomUUID();
      await tx.contractDocument.upsert({ where: { workspaceId_basisHash: { workspaceId: workspace.id, basisHash: documentBasis } },
        create: { id, workspaceId: workspace.id, basisHash: documentBasis, contentHash: draft.contentHash, payload: seal(draft, `${workspace.id}:${documentBasis}`) }, update: {} });
      return { state: "DRAFT" as const, message: "Rascunho preparado para leitura dos dois." };
    });
  }
  async getDraft(userId: string): Promise<ContractDraft | null> {
    return this.transaction(userId, async (tx, { member, members }) => {
      const workspace = await this.workspace(tx, member.coupleId);
      const evaluation = await this.evaluate(tx, workspace, members);
      if (!evaluation || !evaluation.catalog.productionReady || !evaluation.safety.every(s => s.cleared)) return null;
      const document = await tx.contractDocument.findFirst({ where: { workspaceId: workspace.id, status: "DRAFT" }, orderBy: { createdAt: "desc" } });
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
}
