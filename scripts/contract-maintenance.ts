import "dotenv/config";
import { createPrismaClient } from "../src/lib/create-prisma-client";
import { maintainContracts } from "../src/services/contract-maintenance.service";
const client = createPrismaClient();
const apply = process.argv.includes("--apply"), rotate = process.argv.includes("--rotate");
maintainContracts(client, { apply, rotate }).then(result => console.info(`${apply ? "Aplicado" : "Simulação"}: ${result.workspaces} espaços; ${result.payloads} conteúdos verificados. Nenhum dado pessoal foi exibido.`))
  .catch(() => { console.error("Manutenção interrompida. Verifique configuração, chaves e acesso ao banco; nenhum conteúdo privado será exibido."); process.exitCode = 1; }).finally(() => client.$disconnect());
