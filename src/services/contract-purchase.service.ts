import "server-only";
import { Prisma, type PrismaClient } from "@/generated/prisma/client";
import { ContractError } from "@/features/contract/domain/engine";

export const CONTRACT_PRODUCT = { code: "CONTRATO_CASAMENTO", name: "Contrato de Casamento", amountCents: 0, currency: "BRL", displayPrice: "R$ 0,00" } as const;

export class ContractPurchaseService {
  constructor(private readonly client: PrismaClient) {}
  async get(userId: string) {
    const purchase = await this.client.contractPurchase.findUnique({ where: { userId } });
    return purchase ? { status: purchase.revokedAt ? "REVOKED" : purchase.status, acquiredAt: purchase.acquiredAt.toISOString(), amountCents: purchase.amountCents, currency: purchase.currency } : null;
  }
  async acquireFree(userId: string) {
    // No price, user ID, status or gateway acknowledgement comes from the form.
    const operation = () => this.client.contractPurchase.upsert({ where: { userId },
      create: { userId, productCode: CONTRACT_PRODUCT.code, status: "PAID", amountCents: 0, currency: "BRL", source: "FREE_CHECKOUT" },
      update: { status: "PAID", revokedAt: null },
      select: { status: true, amountCents: true, currency: true },
    });
    try { return await operation(); }
    catch (error) {
      if (!(error instanceof Prisma.PrismaClientKnownRequestError) || error.code !== "P2002") throw error;
      // Another click won the unique user key; read/update that acquisition.
      return operation();
    }
  }
  async requireAccess(userId: string) {
    const purchase = await this.client.contractPurchase.findUnique({ where: { userId } });
    if (!purchase || purchase.status !== "PAID" || purchase.revokedAt) throw new ContractError("PRODUCT_NOT_ACQUIRED");
  }
}
