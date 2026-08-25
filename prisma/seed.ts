import "dotenv/config";
import { admissionQuestionnaireV8 } from "../src/data/questionnaire-admission-v8";
import { createPrismaClient } from "../src/lib/create-prisma-client";
import { syncQuestionnaire } from "../src/services/questionnaire-seed.service";

const prisma = createPrismaClient();

async function main() {
  try {
    const result = await syncQuestionnaire(prisma, admissionQuestionnaireV8);
    console.info(`Questionário 8.0 processado com sucesso (${result.created ? "criado" : result.synchronized ? "sincronizado" : "inalterado"}).`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "Falha desconhecida ao executar o seed.");
  process.exitCode = 1;
});
