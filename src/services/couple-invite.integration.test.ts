// @vitest-environment node

import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { ADMISSION_QUESTIONNAIRE_CODE, ADMISSION_QUESTIONNAIRE_VERSION } from "@/config/admission-questionnaire";
import { admissionQuestionnaireV8 } from "@/data/questionnaire-admission-v8";
import { hashInviteToken } from "@/lib/couple-invite-token";
import { createTestPrismaClient } from "@/test/create-test-prisma";
import { AdmissionFinancialProfileService } from "./admission-financial-profile.service";
import { AdmissionIndividualReportService } from "./admission-individual-report.service";
import { AdmissionResultService } from "./admission-result.service";
import { AdmissionSafetyService } from "./admission-safety.service";
import { CoupleInviteService } from "./couple-invite.service";
import { CoupleService } from "./couple.service";
import { syncQuestionnaire } from "./questionnaire-seed.service";

const prisma = createTestPrismaClient();
const inviteService = new CoupleInviteService(prisma, { appUrl: "http://localhost:3000" });
const coupleService = new CoupleService(prisma);
const suffix = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
const userIds: string[] = [];
const coupleIds: string[] = [];
const attemptIds: string[] = [];
let questionnaire: Awaited<ReturnType<typeof loadQuestionnaire>>;

function loadQuestionnaire() {
  return prisma.questionnaire.findUniqueOrThrow({
    where: { code_version: { code: ADMISSION_QUESTIONNAIRE_CODE, version: ADMISSION_QUESTIONNAIRE_VERSION } },
    include: { questions: { orderBy: { order: "asc" }, include: { options: { orderBy: { order: "asc" } } } } },
  });
}

async function createUser(label: string, email = `${label}-${suffix}@example.test`) {
  const user = await prisma.user.create({ data: { name: `Couple ${label}`, email } });
  userIds.push(user.id);
  return user;
}

function tokenFromUrl(inviteUrl: string) {
  return new URL(inviteUrl).pathname.split("/").at(-1)!;
}

async function createInvitePair(label: string) {
  const creator = await createUser(`${label}-creator`);
  const partner = await createUser(`${label}-partner`);
  const created = await inviteService.createInvite(creator, partner.email);
  const membership = await prisma.coupleMember.findUniqueOrThrow({ where: { activeMembershipKey: creator.id } });
  coupleIds.push(membership.coupleId);
  return { creator, partner, created, token: tokenFromUrl(created.inviteUrl), coupleId: membership.coupleId };
}

async function createCompletedAttempt(userId: string) {
  const attempt = await prisma.questionnaireAttempt.create({
    data: {
      questionnaireId: questionnaire.id,
      questionnaireVersion: questionnaire.version,
      userId,
      status: "IN_PROGRESS",
      openAttemptKey: `${userId}:${questionnaire.id}`,
    },
  });
  attemptIds.push(attempt.id);
  await prisma.answer.createMany({
    data: questionnaire.questions.map((question) => {
      const letter = question.order >= 6 && question.order <= 30 ? "B" : "A";
      const option = question.options.find((candidate) => candidate.letter === letter)!;
      return { attemptId: attempt.id, questionId: question.id, optionId: option.id, score: option.score };
    }),
  });
  await new AdmissionResultService(prisma).completeForUser(userId, attempt.id);
  return attempt;
}

describe("casal, convites e vínculo seguro", () => {
  beforeAll(async () => {
    await syncQuestionnaire(prisma, admissionQuestionnaireV8);
    questionnaire = await loadQuestionnaire();
  });

  afterAll(async () => {
    await prisma.answer.deleteMany({ where: { attemptId: { in: attemptIds } } });
    await prisma.areaResult.deleteMany({ where: { attemptId: { in: attemptIds } } });
    await prisma.resultFlag.deleteMany({ where: { attemptId: { in: attemptIds } } });
    await prisma.questionnaireAttempt.deleteMany({ where: { id: { in: attemptIds } } });
    await prisma.coupleInvite.deleteMany({ where: { coupleId: { in: coupleIds } } });
    await prisma.coupleMember.deleteMany({ where: { coupleId: { in: coupleIds } } });
    await prisma.couple.deleteMany({ where: { id: { in: coupleIds } } });
    await prisma.user.deleteMany({ where: { id: { in: userIds } } });
    await prisma.$disconnect();
  });

  it("cria Couple PENDING, CREATOR e convite PENDING com as chaves ativas", async () => {
    const creator = await createUser("create-owner");
    const created = await inviteService.createInvite(creator, `  SPOUSE-${suffix}@EXAMPLE.TEST  `);
    const member = await prisma.coupleMember.findUniqueOrThrow({
      where: { activeMembershipKey: creator.id },
      include: { couple: true },
    });
    coupleIds.push(member.coupleId);
    const invite = await prisma.coupleInvite.findFirstOrThrow({ where: { coupleId: member.coupleId } });
    expect(member).toMatchObject({ userId: creator.id, role: "CREATOR", activeMembershipKey: creator.id });
    expect(member.couple.status).toBe("PENDING");
    expect(invite).toMatchObject({
      email: `spouse-${suffix}@example.test`,
      status: "PENDING",
      activeInviteKey: member.coupleId,
    });
    expect(created.expiresAt).toBe(invite.expiresAt.toISOString());
  });

  it("retorna token uma vez, persiste apenas SHA-256 e constrói URL com APP_URL confiável", async () => {
    const pair = await createInvitePair("token");
    const stored = await prisma.coupleInvite.findFirstOrThrow({ where: { coupleId: pair.coupleId } });
    expect(pair.created.inviteUrl).toBe(`http://localhost:3000/convite/${pair.token}`);
    expect(pair.token).toHaveLength(43);
    expect(stored.tokenHash).toBe(hashInviteToken(pair.token));
    expect(JSON.stringify(stored)).not.toContain(pair.token);
  });

  it("nega auto-convite sem criar Couple, member ou invite", async () => {
    const creator = await createUser("self");
    const before = await Promise.all([prisma.couple.count(), prisma.coupleMember.count(), prisma.coupleInvite.count()]);
    await expect(inviteService.createInvite(creator, ` ${creator.email.toUpperCase()} `)).rejects.toMatchObject({ code: "SELF_INVITE_NOT_ALLOWED" });
    expect(await Promise.all([prisma.couple.count(), prisma.coupleMember.count(), prisma.coupleInvite.count()])).toEqual(before);
  });

  it("regenera no mesmo Couple e membership, cancelando o token anterior", async () => {
    const pair = await createInvitePair("regenerate");
    const regenerated = await inviteService.createInvite(pair.creator, pair.partner.email);
    const invites = await prisma.coupleInvite.findMany({ where: { coupleId: pair.coupleId }, orderBy: { createdAt: "asc" } });
    expect(await prisma.coupleMember.count({ where: { coupleId: pair.coupleId } })).toBe(1);
    expect(invites).toHaveLength(2);
    expect(invites[0]).toMatchObject({ status: "CANCELLED", activeInviteKey: null });
    expect(invites[1]).toMatchObject({ status: "PENDING", activeInviteKey: pair.coupleId });
    expect(await inviteService.getInvitePreview(pair.token)).toEqual({ state: "CANCELLED" });
    expect(tokenFromUrl(regenerated.inviteUrl)).not.toBe(pair.token);
  });

  it("cancela convite sem cancelar o Couple PENDING", async () => {
    const pair = await createInvitePair("cancel-invite");
    await inviteService.cancelInvite(pair.creator.id);
    expect(await prisma.couple.findUniqueOrThrow({ where: { id: pair.coupleId } })).toMatchObject({ status: "PENDING" });
    expect(await prisma.coupleInvite.findFirstOrThrow({ where: { coupleId: pair.coupleId } })).toMatchObject({ status: "CANCELLED", activeInviteKey: null });
  });

  it("cancela vínculo PENDING sem apagar histórico e permite iniciar outro", async () => {
    const pair = await createInvitePair("cancel-couple");
    await coupleService.cancelPendingCouple(pair.creator.id);
    expect(await prisma.couple.findUniqueOrThrow({ where: { id: pair.coupleId } })).toMatchObject({ status: "INACTIVE" });
    expect(await prisma.coupleMember.findFirstOrThrow({ where: { coupleId: pair.coupleId } })).toMatchObject({ activeMembershipKey: null });
    expect(await prisma.coupleInvite.findFirstOrThrow({ where: { coupleId: pair.coupleId } })).toMatchObject({ status: "CANCELLED", activeInviteKey: null });

    await inviteService.createInvite(pair.creator, pair.partner.email);
    const current = await prisma.coupleMember.findUniqueOrThrow({ where: { activeMembershipKey: pair.creator.id } });
    coupleIds.push(current.coupleId);
    expect(current.coupleId).not.toBe(pair.coupleId);
  });

  it("aceita explicitamente com e-mail correto e ativa o casal", async () => {
    const pair = await createInvitePair("accept");
    await inviteService.acceptInvite(pair.partner, pair.token);
    const [couple, members, invite] = await Promise.all([
      prisma.couple.findUniqueOrThrow({ where: { id: pair.coupleId } }),
      prisma.coupleMember.findMany({ where: { coupleId: pair.coupleId }, orderBy: { role: "asc" } }),
      prisma.coupleInvite.findFirstOrThrow({ where: { coupleId: pair.coupleId } }),
    ]);
    expect(couple.status).toBe("ACTIVE");
    expect(members.map(({ role }) => role).sort()).toEqual(["CREATOR", "PARTNER"]);
    expect(members.find(({ role }) => role === "PARTNER")).toMatchObject({ userId: pair.partner.id, activeMembershipKey: pair.partner.id });
    expect(invite).toMatchObject({ status: "ACCEPTED", activeInviteKey: null });
    expect(invite.acceptedAt).not.toBeNull();
  });

  it("nega e-mail incorreto e criador sem consumir o convite", async () => {
    const pair = await createInvitePair("wrong-account");
    const wrong = await createUser("wrong-account-other");
    await expect(inviteService.acceptInvite(wrong, pair.token)).rejects.toMatchObject({ code: "INVITE_EMAIL_MISMATCH" });
    await expect(inviteService.acceptInvite(pair.creator, pair.token)).rejects.toMatchObject({ code: "INVITE_FORBIDDEN" });
    expect(await prisma.coupleInvite.findFirstOrThrow({ where: { coupleId: pair.coupleId } })).toMatchObject({ status: "PENDING", acceptedAt: null });
    expect(await prisma.coupleMember.count({ where: { coupleId: pair.coupleId } })).toBe(1);
  });

  it("nega convite expirado, cancelado e já aceito sem membro adicional", async () => {
    const expired = await createInvitePair("expired");
    await prisma.coupleInvite.updateMany({ where: { coupleId: expired.coupleId }, data: { expiresAt: new Date(Date.now() - 1_000) } });
    await expect(inviteService.acceptInvite(expired.partner, expired.token)).rejects.toMatchObject({ code: "INVITE_EXPIRED" });

    const cancelled = await createInvitePair("cancelled");
    await inviteService.cancelInvite(cancelled.creator.id);
    await expect(inviteService.acceptInvite(cancelled.partner, cancelled.token)).rejects.toMatchObject({ code: "INVITE_CANCELLED" });

    const accepted = await createInvitePair("already-used");
    await inviteService.acceptInvite(accepted.partner, accepted.token);
    await expect(inviteService.acceptInvite(accepted.partner, accepted.token)).rejects.toMatchObject({ code: "INVITE_ALREADY_USED" });
    expect(await prisma.coupleMember.count({ where: { coupleId: accepted.coupleId, role: "PARTNER" } })).toBe(1);
  });

  it("não permite cancelar Couple ACTIVE nem criar novo convite", async () => {
    const pair = await createInvitePair("active-immutable");
    await inviteService.acceptInvite(pair.partner, pair.token);
    await expect(coupleService.cancelPendingCouple(pair.creator.id)).rejects.toMatchObject({ code: "COUPLE_NOT_PENDING" });
    await expect(inviteService.createInvite(pair.creator, `other-${suffix}@example.test`)).rejects.toMatchObject({ code: "COUPLE_ALREADY_ACTIVE" });
    expect(await prisma.couple.findUniqueOrThrow({ where: { id: pair.coupleId } })).toMatchObject({ status: "ACTIVE" });
  });

  it("preview público é sanitizado e GET não causa efeitos colaterais", async () => {
    const pair = await createInvitePair("preview");
    const before = await prisma.coupleInvite.findFirstOrThrow({ where: { coupleId: pair.coupleId } });
    const memberCount = await prisma.coupleMember.count({ where: { coupleId: pair.coupleId } });
    const preview = await inviteService.getInvitePreview(pair.token);
    const after = await prisma.coupleInvite.findFirstOrThrow({ where: { coupleId: pair.coupleId } });
    expect(preview).toMatchObject({ state: "AVAILABLE", creatorName: pair.creator.name });
    expect(preview).toHaveProperty("recipientEmail", `${pair.partner.email[0]}***@example.test`);
    expect(JSON.stringify(preview)).not.toMatch(/coupleId|userId|tokenHash|activeInviteKey|@example\.test.*@example\.test/);
    expect(after).toEqual(before);
    expect(await prisma.coupleMember.count({ where: { coupleId: pair.coupleId } })).toBe(memberCount);
  });

  it("token malformado ou desconhecido retorna estado genérico", async () => {
    expect(await inviteService.getInvitePreview("not-a-valid-token")).toEqual({ state: "UNAVAILABLE" });
    expect(await inviteService.getInvitePreview("z".repeat(43))).toEqual({ state: "UNAVAILABLE" });
  });

  it("overview expõe somente dados mínimos em NONE, PENDING e ACTIVE", async () => {
    const none = await createUser("overview-none");
    expect(await coupleService.getOverview(none.id)).toEqual({ state: "NONE" });
    const pair = await createInvitePair("overview");
    const pending = await coupleService.getOverview(pair.creator.id);
    await inviteService.acceptInvite(pair.partner, pair.token);
    const active = await coupleService.getOverview(pair.creator.id);
    expect(pending).toMatchObject({ state: "PENDING", role: "CREATOR", invite: { email: pair.partner.email, status: "PENDING" } });
    expect(active).toMatchObject({ state: "ACTIVE", role: "CREATOR", partner: { name: pair.partner.name, email: pair.partner.email } });
    expect(JSON.stringify([pending, active])).not.toMatch(/P31|P32|P33|P34|P35|P36|P37|P38|SAFETY_|CONSENT_|totalScore|ResultFlag|AreaResult|Answer|QuestionOption|tokenHash|activeMembershipKey|activeInviteKey|financialProfile|internalCode/);
  });

  it("constraints recusam segundo papel, vínculo atual e convite pendente", async () => {
    const pair = await createInvitePair("constraints");
    const anotherPartner = await createUser("constraints-extra-partner");
    await expect(prisma.coupleMember.create({ data: {
      coupleId: pair.coupleId,
      userId: anotherPartner.id,
      role: "CREATOR",
      activeMembershipKey: anotherPartner.id,
    } })).rejects.toMatchObject({ code: "P2002" });

    const otherCouple = await prisma.couple.create({ data: {} });
    coupleIds.push(otherCouple.id);
    await expect(prisma.coupleMember.create({ data: {
      coupleId: otherCouple.id,
      userId: pair.creator.id,
      role: "CREATOR",
      activeMembershipKey: pair.creator.id,
    } })).rejects.toMatchObject({ code: "P2002" });

    await expect(prisma.coupleInvite.create({ data: {
      coupleId: pair.coupleId,
      createdByUserId: pair.creator.id,
      email: anotherPartner.email,
      tokenHash: "f".repeat(64),
      activeInviteKey: pair.coupleId,
      expiresAt: new Date(Date.now() + 86_400_000),
    } })).rejects.toMatchObject({ code: "P2002" });
  });

  it("duas criações concorrentes terminam com somente um convite PENDING", async () => {
    const creator = await createUser("concurrent-create-owner");
    const emails = [`first-${suffix}@example.test`, `second-${suffix}@example.test`];
    const results = await Promise.allSettled(emails.map((email) => inviteService.createInvite(creator, email)));
    const membership = await prisma.coupleMember.findUniqueOrThrow({ where: { activeMembershipKey: creator.id } });
    coupleIds.push(membership.coupleId);
    expect(results.some(({ status }) => status === "fulfilled")).toBe(true);
    expect(await prisma.coupleInvite.count({ where: { coupleId: membership.coupleId, status: "PENDING" } })).toBe(1);
    expect(await prisma.couple.count({ where: { members: { some: { userId: creator.id } } } })).toBe(1);
  });

  it("duas aceitações simultâneas do mesmo token criam somente um PARTNER", async () => {
    const pair = await createInvitePair("concurrent-accept");
    const results = await Promise.allSettled([
      inviteService.acceptInvite(pair.partner, pair.token),
      inviteService.acceptInvite(pair.partner, pair.token),
    ]);
    expect(results.filter(({ status }) => status === "fulfilled")).toHaveLength(1);
    expect(await prisma.coupleMember.count({ where: { coupleId: pair.coupleId, role: "PARTNER" } })).toBe(1);
    expect(await prisma.couple.findUniqueOrThrow({ where: { id: pair.coupleId } })).toMatchObject({ status: "ACTIVE" });
    expect(await prisma.coupleInvite.findFirstOrThrow({ where: { coupleId: pair.coupleId } })).toMatchObject({ status: "ACCEPTED" });
  });

  it("mesmo usuário aceitando dois convites concorrentes obtém somente um vínculo atual", async () => {
    const partner = await createUser("double-partner");
    const creatorA = await createUser("double-creator-a");
    const creatorB = await createUser("double-creator-b");
    const [inviteA, inviteB] = await Promise.all([
      inviteService.createInvite(creatorA, partner.email),
      inviteService.createInvite(creatorB, partner.email),
    ]);
    const creatorMemberships = await prisma.coupleMember.findMany({ where: { userId: { in: [creatorA.id, creatorB.id] } } });
    coupleIds.push(...creatorMemberships.map(({ coupleId }) => coupleId));
    const results = await Promise.allSettled([
      inviteService.acceptInvite(partner, tokenFromUrl(inviteA.inviteUrl)),
      inviteService.acceptInvite(partner, tokenFromUrl(inviteB.inviteUrl)),
    ]);
    expect(results.filter(({ status }) => status === "fulfilled")).toHaveLength(1);
    expect(await prisma.coupleMember.count({ where: { activeMembershipKey: partner.id } })).toBe(1);
  });

  it("casal ACTIVE não concede acesso a Safety, financeiro ou relatório individual do parceiro", async () => {
    const pair = await createInvitePair("privacy");
    await inviteService.acceptInvite(pair.partner, pair.token);
    const attempt = await createCompletedAttempt(pair.creator.id);
    await expect(new AdmissionSafetyService(prisma).getPrivateSafetyResultForUser(pair.partner.id, attempt.id)).rejects.toMatchObject({ code: "PRIVATE_RESULT_FORBIDDEN" });
    await expect(new AdmissionFinancialProfileService(prisma).getFinancialProfileForOwner({ userId: pair.partner.id, attemptId: attempt.id })).rejects.toMatchObject({ code: "FINANCIAL_PROFILE_FORBIDDEN" });
    await expect(new AdmissionIndividualReportService(prisma).getForUser(pair.partner.id, attempt.id)).rejects.toMatchObject({ code: "REPORT_FORBIDDEN" });
  });
});
