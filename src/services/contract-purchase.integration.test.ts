// @vitest-environment node
import { randomBytes, randomUUID } from "node:crypto";
import { afterAll, expect, it, vi } from "vitest";
import { createTestPrismaClient } from "@/test/create-test-prisma";
import { ContractPurchaseService } from "./contract-purchase.service";
import { ContractService } from "./contract.service";
import { CoupleInviteService } from "./couple-invite.service";
import { requireContractAccess } from "@/features/contract/server/access";

const db = createTestPrismaClient();
const ids: string[] = [];
afterAll(async () => {
  const members = await db.coupleMember.findMany({ where: { userId: { in: ids } } });
  const coupleIds = members.map(m => m.coupleId);
  await db.contractSession.deleteMany({ where: { userId: { in: ids } } });
  await db.contractWorkspace.deleteMany({ where: { coupleId: { in: coupleIds } } });
  await db.coupleMember.deleteMany({ where: { userId: { in: ids } } });
  await db.coupleInvite.deleteMany({ where: { coupleId: { in: coupleIds } } });
  await db.couple.deleteMany({ where: { id: { in: coupleIds } } });
  await db.contractPurchase.deleteMany({ where: { userId: { in: ids } } }); await db.user.deleteMany({ where: { id: { in: ids } } }); await db.$disconnect(); vi.unstubAllEnvs(); });
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
  vi.stubEnv("CONTRACT_DATA_KEY", randomBytes(32).toString("base64"));
  const contracts = new ContractService(db);
  await expect(contracts.start(b.id)).rejects.toThrow("PRODUCT_NOT_ACQUIRED");
  await expect(contracts.start(a.id)).resolves.toBeUndefined();
  expect(await contracts.getOwn(a.id)).toMatchObject({ coupleConnected: false, status: "IN_PROGRESS" });
});

it.each([
  ["CREATOR", "before"], ["PARTNER", "before"],
  ["CREATOR", "after"], ["PARTNER", "after"],
])("compartilha compra de %s feita %s do vínculo, respeitando revogação e privacidade", async (role, timing) => {
  vi.stubEnv("CONTRACT_ENABLED", "true");
  vi.stubEnv("CONTRACT_DATA_KEY", randomBytes(32).toString("base64"));
  const a = await db.user.create({ data: { name: "Criador", email: `shared-${randomUUID()}@teste.local` } });
  const b = await db.user.create({ data: { name: "Parceiro", email: `shared-${randomUUID()}@teste.local` } });
  ids.push(a.id, b.id);
  const buyer = role === "CREATOR" ? a : b;
  const recipient = role === "CREATOR" ? b : a;
  const service = new ContractPurchaseService(db);
  const contracts = new ContractService(db);
  const invites = new CoupleInviteService(db, { appUrl: "http://localhost:3000" });
  if (timing === "before") await service.acquireFree(buyer.id);
  const invite = await invites.createInvite(a, b.email);
  await expect(service.requireAccess(recipient.id)).rejects.toThrow("PRODUCT_NOT_ACQUIRED");
  await invites.acceptInvite(b, invite.inviteUrl.split("/").at(-1)!);
  if (timing === "after") {
    await expect(service.requireAccess(recipient.id)).rejects.toThrow("PRODUCT_NOT_ACQUIRED");
    await service.acquireFree(buyer.id);
  }
  expect(await service.get(recipient.id)).toMatchObject({ status: "PAID", shared: true });
  await expect(service.requireAccess(recipient.id)).resolves.toBeUndefined();
  await expect(requireContractAccess(recipient.id, db)).resolves.toBeUndefined();
  await contracts.start(buyer.id);
  await contracts.start(recipient.id);
  expect(await contracts.getOwn(recipient.id)).toMatchObject({ status: "IN_PROGRESS", coupleConnected: true });
  expect((await contracts.getOwn(recipient.id))?.questions).toHaveLength(200);
  expect(await db.contractPurchase.findUnique({ where: { userId: recipient.id } })).toBeNull();
  const sessions = await db.contractSession.findMany({ where: { userId: { in: [a.id, b.id] } } });
  expect(sessions).toHaveLength(2);
  expect(sessions.every(session => session.consentedAt === null)).toBe(true);

  // A failed/revoked personal purchase must not hide the partner's valid access.
  await service.acquireFree(recipient.id);
  await db.contractPurchase.update({ where: { userId: recipient.id }, data: { revokedAt: new Date() } });
  expect(await service.get(recipient.id)).toMatchObject({ status: "PAID", shared: true });
  await expect(requireContractAccess(recipient.id, db)).resolves.toBeUndefined();

  await db.contractPurchase.update({ where: { userId: buyer.id }, data: { status: "PENDING" } });
  await expect(requireContractAccess(recipient.id, db)).rejects.toThrow("PRODUCT_NOT_ACQUIRED");
  await service.acquireFree(buyer.id);
  await db.contractPurchase.update({ where: { userId: buyer.id }, data: { revokedAt: new Date() } });
  expect(await service.get(recipient.id)).toBeNull();
  await expect(contracts.start(recipient.id)).rejects.toThrow("PRODUCT_NOT_ACQUIRED");
  await service.acquireFree(buyer.id);
  const membership = await db.coupleMember.findUniqueOrThrow({ where: { activeMembershipKey: buyer.id } });
  await db.coupleMember.update({ where: { id: membership.id }, data: { activeMembershipKey: null } });
  await expect(service.requireAccess(recipient.id)).rejects.toThrow("PRODUCT_NOT_ACQUIRED");
  await db.coupleMember.update({ where: { id: membership.id }, data: { activeMembershipKey: buyer.id } });
  await db.couple.update({ where: { id: membership.coupleId }, data: { status: "INACTIVE" } });
  await expect(requireContractAccess(recipient.id, db)).rejects.toThrow("PRODUCT_NOT_ACQUIRED");
  await expect(service.requireAccess(buyer.id)).resolves.toBeUndefined();
  await service.acquireFree(recipient.id);
  await expect(service.requireAccess(recipient.id)).resolves.toBeUndefined();
});
