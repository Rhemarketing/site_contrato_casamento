// @vitest-environment node
import { randomUUID } from "node:crypto";
import { afterAll, expect, it, vi } from "vitest";
import { createTestPrismaClient } from "@/test/create-test-prisma";
import { ContractPurchaseService } from "./contract-purchase.service";
import { ContractService } from "./contract.service";

const db = createTestPrismaClient();
const ids: string[] = [];
afterAll(async () => { await db.contractPurchase.deleteMany({ where: { userId: { in: ids } } }); await db.user.deleteMany({ where: { id: { in: ids } } }); await db.$disconnect(); vi.unstubAllEnvs(); });
it("confirma aquisição pessoal, gratuita e idempotente sem liberar outra conta", async () => {
  const a = await db.user.create({ data: { name: "Compra Um", email: `free-${randomUUID()}@teste.local` } });
  const b = await db.user.create({ data: { name: "Compra Dois", email: `free-${randomUUID()}@teste.local` } });
  ids.push(a.id, b.id);
  const service = new ContractPurchaseService(db);
  await Promise.all([service.acquireFree(a.id), service.acquireFree(a.id)]);
  const purchase = await db.contractPurchase.findUniqueOrThrow({ where: { userId: a.id } });
  expect(purchase).toMatchObject({ status: "PAID", amountCents: 0, currency: "BRL", source: "FREE_CHECKOUT", revokedAt: null });
  expect(await db.contractPurchase.count({ where: { userId: a.id } })).toBe(1);
  await expect(service.requireAccess(a.id)).resolves.toBeUndefined();
  await expect(service.requireAccess(b.id)).rejects.toThrow("PRODUCT_NOT_ACQUIRED");
  await db.contractPurchase.update({ where: { userId: a.id }, data: { revokedAt: new Date() } });
  await expect(service.requireAccess(a.id)).rejects.toThrow("PRODUCT_NOT_ACQUIRED");
  await service.acquireFree(a.id);
  await expect(service.requireAccess(a.id)).resolves.toBeUndefined();
  vi.stubEnv("CONTRACT_ENABLED", "true");
  const contracts = new ContractService(db);
  await expect(contracts.start(b.id)).rejects.toThrow("PRODUCT_NOT_ACQUIRED");
  await expect(contracts.start(a.id)).rejects.toThrow("COUPLE_UNAVAILABLE");
});
