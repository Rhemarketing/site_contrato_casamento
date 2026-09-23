import "dotenv/config";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../src/generated/prisma/client";

async function main() {
  const email = process.argv[2]?.trim().toLowerCase();

  if (!email) {
    console.error("Uso: npx tsx scripts/promote-admin.ts <email>");
    process.exit(1);
  }

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("DATABASE_URL não configurada no .env");
    process.exit(1);
  }

  const url = new URL(databaseUrl);
  const adapter = new PrismaMariaDb({
    host: url.hostname,
    port: url.port ? Number(url.port) : 3306,
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: decodeURIComponent(url.pathname.replace(/^\//, "")),
  });

  const prisma = new PrismaClient({ adapter });

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, name: true, email: true, role: true },
    });

    if (!user) {
      console.error(`Usuário com e-mail "${email}" não encontrado.`);
      process.exit(1);
    }

    if (user.role === "ADMIN") {
      console.log(`O usuário ${user.name} (${user.email}) já possui o papel ADMIN.`);
      return;
    }

    const updated = await prisma.user.update({
      where: { email },
      data: { role: "ADMIN" },
      select: { id: true, name: true, email: true, role: true },
    });

    console.log(`✅ Sucesso! O usuário ${updated.name} (${updated.email}) agora é ADMIN.`);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    console.error("Erro ao promover usuário:", message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
