import type { Prisma, PrismaClient } from "@/generated/prisma/client";
import { ADMISSION_QUESTIONNAIRE_NAME } from "@/data/questionnaire-admission-v8";
import { parseQuestionnaireSeedDefinition, type QuestionnaireSeedDefinition } from "@/validations/questionnaire-seed";

const HISTORICAL_VERSION_ERROR = "Uma versão de questionário com respostas históricas não pode ser modificada. Crie uma nova versão do questionário.";

type TransactionHost = Pick<PrismaClient, "$transaction">;

function canonicalSnapshot(definition: QuestionnaireSeedDefinition) {
  return {
    code: definition.questionario.codigo,
    name: ADMISSION_QUESTIONNAIRE_NAME,
    version: definition.questionario.versao,
    isActive: true,
    questions: definition.perguntas.map((question) => ({
      code: question.codigo,
      order: question.id,
      stage: question.etapa,
      area: question.area,
      text: question.pergunta,
      description: question.descricao ?? null,
      isScored: question.pontua,
      isPrivate: question.privada,
      isActive: true,
      options: question.alternativas.map((option, index) => ({
        letter: option.letra,
        text: option.texto,
        score: option.pontuacao,
        internalCode: option.codigo_interno ?? null,
        flag: option.flag ?? null,
        order: index + 1,
      })),
    })),
  };
}

function persistedSnapshot(questionnaire: Awaited<ReturnType<typeof loadQuestionnaire>>) {
  if (!questionnaire) return null;
  return {
    code: questionnaire.code,
    name: questionnaire.name,
    version: questionnaire.version,
    isActive: questionnaire.isActive,
    questions: questionnaire.questions.map((question) => ({
      code: question.code,
      order: question.order,
      stage: question.stage,
      area: question.area,
      text: question.text,
      description: question.description,
      isScored: question.isScored,
      isPrivate: question.isPrivate,
      isActive: question.isActive,
      options: question.options.map((option) => ({
        letter: option.letter,
        text: option.text,
        score: option.score === null ? null : Number(option.score),
        internalCode: option.internalCode,
        flag: option.flag,
        order: option.order,
      })),
    })),
  };
}

function loadQuestionnaire(transaction: Prisma.TransactionClient, code: string, version: string) {
  return transaction.questionnaire.findUnique({
    where: { code_version: { code, version } },
    include: {
      questions: { orderBy: { order: "asc" }, include: { options: { orderBy: { order: "asc" } } } },
      _count: { select: { attempts: true } },
    },
  });
}

export async function syncQuestionnaire(client: TransactionHost, input: unknown) {
  const definition = parseQuestionnaireSeedDefinition(input);
  const canonical = canonicalSnapshot(definition);

  return client.$transaction(async (transaction) => {
    const existing = await loadQuestionnaire(transaction, canonical.code, canonical.version);
    if (existing && JSON.stringify(persistedSnapshot(existing)) === JSON.stringify(canonical)) {
      return { questionnaireId: existing.id, created: false, synchronized: false };
    }
    if (existing?._count.attempts) throw new Error(HISTORICAL_VERSION_ERROR);

    const questionnaire = await transaction.questionnaire.upsert({
      where: { code_version: { code: canonical.code, version: canonical.version } },
      create: { code: canonical.code, name: canonical.name, version: canonical.version, isActive: canonical.isActive },
      update: { name: canonical.name, isActive: canonical.isActive },
    });

    await transaction.question.updateMany({ where: { questionnaireId: questionnaire.id }, data: { order: { increment: 1000 } } });

    for (const question of canonical.questions) {
      const { options, ...questionData } = question;
      const persistedQuestion = await transaction.question.upsert({
        where: { questionnaireId_code: { questionnaireId: questionnaire.id, code: question.code } },
        create: { questionnaireId: questionnaire.id, ...questionData },
        update: questionData,
      });
      await transaction.questionOption.updateMany({ where: { questionId: persistedQuestion.id }, data: { order: { increment: 100 } } });
      for (const option of options) {
        await transaction.questionOption.upsert({
          where: { questionId_letter: { questionId: persistedQuestion.id, letter: option.letter } },
          create: { questionId: persistedQuestion.id, ...option },
          update: option,
        });
      }
      await transaction.questionOption.deleteMany({ where: { questionId: persistedQuestion.id, letter: { notIn: options.map((option) => option.letter) } } });
    }

    const staleQuestions = await transaction.question.findMany({ where: { questionnaireId: questionnaire.id, code: { notIn: canonical.questions.map((question) => question.code) } }, select: { id: true } });
    for (const staleQuestion of staleQuestions) {
      await transaction.questionOption.deleteMany({ where: { questionId: staleQuestion.id } });
      await transaction.question.delete({ where: { id: staleQuestion.id } });
    }

    return { questionnaireId: questionnaire.id, created: !existing, synchronized: true };
  });
}

export { HISTORICAL_VERSION_ERROR };
