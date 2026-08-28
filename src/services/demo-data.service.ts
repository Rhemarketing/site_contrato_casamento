import type { PrismaClient } from "@/generated/prisma/client";
import { createHash, randomBytes } from "node:crypto";
import { hashPassword } from "@/lib/password";
import { AdmissionResultService } from "./admission-result.service";

export const DEMO_EMAIL_DOMAIN = "@contrato.local";
export const DEMO_USERS = [
  { email: "demo.novo@contrato.local", name: "Demo Novo", scenario: "Conta sem prova e sem casal" },
  { email: "demo.andamento@contrato.local", name: "Demo Andamento", scenario: "Prova com 15 respostas" },
  { email: "demo.base@contrato.local", name: "Demo Boa Base", scenario: "Resultado com boa base conjugal" },
  { email: "demo.ajustes@contrato.local", name: "Demo Ajustes", scenario: "Resultado intermediário" },
  { email: "demo.desgaste@contrato.local", name: "Demo Desgaste", scenario: "Resultado de alto desgaste" },
  { email: "demo.safety@contrato.local", name: "Demo Safety", scenario: "Orientação privada de Safety" },
  { email: "demo.convite@contrato.local", name: "Demo Convite", scenario: "Casal com convite pendente" },
  { email: "demo.casal.a@contrato.local", name: "Demo Casal A", scenario: "Casal conectado — creator" },
  { email: "demo.casal.b@contrato.local", name: "Demo Casal B", scenario: "Casal conectado — partner" },
] as const;

type DemoEnvironment = { nodeEnv?: string; databaseUrl?: string };

export function assertSafeDemoEnvironment({ nodeEnv, databaseUrl }: DemoEnvironment) {
  if (nodeEnv === "production") throw new Error("DEMO_SEED_FORBIDDEN_IN_PRODUCTION");
  if (!databaseUrl) throw new Error("DEMO_DATABASE_URL_REQUIRED");
  const url = new URL(databaseUrl);
  const database = decodeURIComponent(url.pathname.replace(/^\//, ""));
  const localHost = ["127.0.0.1", "localhost", "::1"].includes(url.hostname);
  const allowedDatabase = database === "contrato_casamento" || (nodeEnv === "test" && database === "contrato_casamento_test");
  if (url.protocol !== "mysql:" || !localHost || !allowedDatabase) throw new Error("DEMO_REMOTE_DATABASE_FORBIDDEN");
}

export function requireDemoPassword(password: string | undefined) {
  if (!password || password.length < 12) throw new Error("DEMO_USER_PASSWORD_REQUIRED");
  return password;
}

async function getDemoScope(client: PrismaClient) {
  const users = await client.user.findMany({
    where: { email: { endsWith: DEMO_EMAIL_DOMAIN } },
    select: { id: true, email: true },
  });
  const userIds = users.map(({ id }) => id);
  const memberships = userIds.length
    ? await client.coupleMember.findMany({ where: { userId: { in: userIds } }, select: { coupleId: true } })
    : [];
  const coupleIds = [...new Set(memberships.map(({ coupleId }) => coupleId))];
  if (coupleIds.length) {
    const foreignMember = await client.coupleMember.findFirst({
      where: { coupleId: { in: coupleIds }, user: { email: { not: { endsWith: DEMO_EMAIL_DOMAIN } } } },
      select: { id: true },
    });
    if (foreignMember) throw new Error("DEMO_RESET_SCOPE_CONFLICT");
  }
  if (userIds.length) {
    const foreignInvite = await client.coupleInvite.findFirst({
      where: { createdByUserId: { in: userIds }, ...(coupleIds.length ? { coupleId: { notIn: coupleIds } } : {}) },
      select: { id: true },
    });
    if (foreignInvite) throw new Error("DEMO_RESET_SCOPE_CONFLICT");
  }
  return { userIds, coupleIds };
}

export async function resetDemoData(client: PrismaClient) {
  const { userIds, coupleIds } = await getDemoScope(client);
  if (!userIds.length) return { removedUsers: 0, removedCouples: 0 };

  const attempts = await client.questionnaireAttempt.findMany({ where: { userId: { in: userIds } }, select: { id: true } });
  const attemptIds = attempts.map(({ id }) => id);
  await client.$transaction(async (transaction) => {
    if (attemptIds.length) {
      await transaction.answer.deleteMany({ where: { attemptId: { in: attemptIds } } });
      await transaction.areaResult.deleteMany({ where: { attemptId: { in: attemptIds } } });
      await transaction.resultFlag.deleteMany({ where: { attemptId: { in: attemptIds } } });
      await transaction.questionnaireAttempt.deleteMany({ where: { id: { in: attemptIds } } });
    }
    if (coupleIds.length) {
      await transaction.coupleComparisonConsent.deleteMany({ where: { coupleId: { in: coupleIds } } });
      await transaction.coupleInvite.deleteMany({ where: { coupleId: { in: coupleIds } } });
      await transaction.coupleMember.deleteMany({ where: { coupleId: { in: coupleIds } } });
      await transaction.couple.deleteMany({ where: { id: { in: coupleIds } } });
    }
    await transaction.user.deleteMany({ where: { id: { in: userIds }, email: { endsWith: DEMO_EMAIL_DOMAIN } } });
  });
  return { removedUsers: userIds.length, removedCouples: coupleIds.length };
}

type DemoQuestion = {
  id: string;
  code: string;
  order: number;
  options: Array<{ id: string; letter: string; score: { toString(): string } | null }>;
};

async function createAttempt(
  client: PrismaClient,
  questionnaire: { id: string; version: string; questions: DemoQuestion[] },
  userId: string,
  answerCount: number,
  chooseLetter: (question: DemoQuestion) => "A" | "B" | "C",
  complete: boolean,
) {
  const attempt = await client.questionnaireAttempt.create({
    data: {
      questionnaireId: questionnaire.id,
      questionnaireVersion: questionnaire.version,
      userId,
      status: answerCount ? "IN_PROGRESS" : "STARTED",
      openAttemptKey: complete ? null : `${userId}:${questionnaire.id}`,
    },
  });
  const questions = questionnaire.questions.slice(0, answerCount);
  await client.answer.createMany({
    data: questions.map((question) => {
      const option = question.options.find(({ letter }) => letter === chooseLetter(question));
      if (!option) throw new Error("DEMO_QUESTIONNAIRE_CONFIGURATION_ERROR");
      return { attemptId: attempt.id, questionId: question.id, optionId: option.id, score: option.score === null ? null : Number(option.score) };
    }),
  });
  if (complete) await new AdmissionResultService(client).completeForUser(userId, attempt.id);
  return attempt;
}

export async function seedDemoData(client: PrismaClient, password: string) {
  requireDemoPassword(password);
  await resetDemoData(client);
  const questionnaire = await client.questionnaire.findFirst({
    where: { code: "PROVA_ADMISSAO_CONTRATO_CASAMENTO", version: "8.0", isActive: true },
    include: { questions: { where: { isActive: true }, orderBy: { order: "asc" }, include: { options: { orderBy: { order: "asc" } } } } },
  });
  if (!questionnaire || questionnaire.questions.length !== 40) throw new Error("DEMO_QUESTIONNAIRE_NOT_AVAILABLE");

  const passwordHash = await hashPassword(password);
  const createdUsers = await Promise.all(DEMO_USERS.map((user) => client.user.create({
    data: { email: user.email, name: user.name, passwordHash, role: "USER" },
  })));
  const byEmail = new Map(createdUsers.map((user) => [user.email, user]));
  const user = (email: typeof DEMO_USERS[number]["email"]) => {
    const found = byEmail.get(email);
    if (!found) throw new Error("DEMO_USER_CONFIGURATION_ERROR");
    return found;
  };

  await createAttempt(client, questionnaire, user("demo.andamento@contrato.local").id, 15, () => "A", false);
  await createAttempt(client, questionnaire, user("demo.base@contrato.local").id, 40, () => "A", true);
  await createAttempt(client, questionnaire, user("demo.ajustes@contrato.local").id, 40, (question) => {
    if (question.order < 6 || question.order > 30) return "A";
    return question.order % 3 === 0 ? "C" : question.order % 2 === 0 ? "B" : "A";
  }, true);
  await createAttempt(client, questionnaire, user("demo.desgaste@contrato.local").id, 40, (question) => {
    if (question.order >= 6 && question.order <= 30) return "C";
    return "A";
  }, true);
  await createAttempt(client, questionnaire, user("demo.safety@contrato.local").id, 40, (question) => {
    if (question.order === 31) return "B";
    if (question.order >= 6 && question.order <= 30) return "B";
    return "A";
  }, true);
  await createAttempt(client, questionnaire, user("demo.casal.a@contrato.local").id, 40, () => "A", true);
  await createAttempt(client, questionnaire, user("demo.casal.b@contrato.local").id, 40, (question) => question.order >= 6 && question.order <= 30 ? "B" : "A", true);

  const pendingCreator = user("demo.convite@contrato.local");
  const pendingCouple = await client.couple.create({ data: { status: "PENDING" } });
  await client.coupleMember.create({ data: {
    coupleId: pendingCouple.id,
    userId: pendingCreator.id,
    role: "CREATOR",
    activeMembershipKey: pendingCreator.id,
  } });
  const pendingToken = randomBytes(32).toString("base64url");
  await client.coupleInvite.create({ data: {
    coupleId: pendingCouple.id,
    createdByUserId: pendingCreator.id,
    email: "conjuge.demo@contrato.local",
    tokenHash: createHash("sha256").update(pendingToken).digest("hex"),
    activeInviteKey: pendingCouple.id,
    status: "PENDING",
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1_000),
  } });

  const activeA = user("demo.casal.a@contrato.local");
  const activeB = user("demo.casal.b@contrato.local");
  const activeCouple = await client.couple.create({ data: { status: "ACTIVE" } });
  await client.coupleMember.createMany({ data: [
    { coupleId: activeCouple.id, userId: activeA.id, role: "CREATOR", activeMembershipKey: activeA.id },
    { coupleId: activeCouple.id, userId: activeB.id, role: "PARTNER", activeMembershipKey: activeB.id },
  ] });

  return { users: DEMO_USERS.length, couples: 2, attempts: 7 };
}
