import { requireUser } from "@/lib/auth/current-user";
import { db } from "@/lib/db";
import { ContractService } from "@/services/contract.service";

export const dynamic = "force-dynamic";
export async function GET() {
  const user = await requireUser("/contrato/privacidade");
  const data = await new ContractService(db).exportOwnData(user.id);
  return new Response(JSON.stringify(data, null, 2), { headers: { "Content-Type": "application/json; charset=utf-8", "Content-Disposition": 'attachment; filename="meus-dados-contrato.json"', "Cache-Control": "private, no-store, max-age=0", "X-Content-Type-Options": "nosniff" } });
}
