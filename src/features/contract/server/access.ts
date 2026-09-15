import "server-only";
import { ContractError } from "../domain/engine";
import { contractDataKey } from "./privacy";
import type { Prisma } from "@/generated/prisma/client";
import { getContractPurchaseAccess } from "./purchase-access";

export function previewAvailable() {
  if (process.env.NODE_ENV === "production" || process.env.CONTRACT_PREVIEW_ENABLED !== "true") return false;
  try {
    const database = new URL(process.env.DATABASE_URL ?? "");
    if (!["localhost", "127.0.0.1", "[::1]"].includes(database.hostname)) return false;
    contractDataKey();
    return true;
  } catch { return false; }
}
export function requireContractPreview(userId: string) {
  const allowed = (process.env.CONTRACT_PREVIEW_USER_IDS ?? "").split(",").map(s => s.trim()).filter(Boolean);
  if (!previewAvailable() || !allowed.includes(userId)) throw new ContractError("PREVIEW_UNAVAILABLE");
}
export function contractAvailable() {
  if (process.env.CONTRACT_ENABLED !== "true") return false;
  try { contractDataKey(); return true; } catch { return false; }
}
export async function requireContractAccess(userId: string, client: Prisma.TransactionClient) {
  if (!contractAvailable()) { requireContractPreview(userId); return; }
  if (!await getContractPurchaseAccess(userId, client)) throw new ContractError("PRODUCT_NOT_ACQUIRED");
}
