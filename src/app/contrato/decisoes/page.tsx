import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/current-user";

export default async function ContractDecisionsPage() {
  await requireUser("/contrato/decisoes");
  redirect("/contrato/documento");
}
