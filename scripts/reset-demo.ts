import "dotenv/config";
import { createPrismaClient } from "../src/lib/create-prisma-client";
import { assertSafeDemoEnvironment, resetDemoData } from "../src/services/demo-data.service";

async function main() {
  assertSafeDemoEnvironment({ nodeEnv: process.env.NODE_ENV, databaseUrl: process.env.DATABASE_URL });
  const client = createPrismaClient();
  try {
    const result = await resetDemoData(client);
    console.info(`Demo local removida: ${result.removedUsers} contas e ${result.removedCouples} casais.`);
  } finally {
    await client.$disconnect();
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "Falha ao remover dados locais de demonstração.");
  process.exitCode = 1;
});
