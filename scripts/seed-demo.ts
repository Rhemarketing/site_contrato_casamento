import "dotenv/config";
import { createPrismaClient } from "../src/lib/create-prisma-client";
import { assertSafeDemoEnvironment, requireDemoPassword, seedDemoData } from "../src/services/demo-data.service";

async function main() {
  assertSafeDemoEnvironment({ nodeEnv: process.env.NODE_ENV, databaseUrl: process.env.DATABASE_URL });
  const password = requireDemoPassword(process.env.DEMO_USER_PASSWORD);
  const client = createPrismaClient();
  try {
    const result = await seedDemoData(client, password);
    console.info(`Demo local pronta: ${result.users} contas, ${result.attempts} tentativas e ${result.couples} casais.`);
  } finally {
    await client.$disconnect();
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "Falha ao criar dados locais de demonstração.");
  process.exitCode = 1;
});
