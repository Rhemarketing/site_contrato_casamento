import type { Metadata } from "next";
import { WorkspacePage } from "@/components/layout/workspace-page";
import { CoupleOverview } from "@/features/couple/components/couple-overview";
import { requireUser } from "@/lib/auth/current-user";
import { db } from "@/lib/db";
import { CoupleService } from "@/services/couple.service";

export const metadata: Metadata = { title: "Casal" };
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function CouplePage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const user = await requireUser("/casal");
  const overview = await new CoupleService(db).getOverview(user.id);
  const error = (await searchParams).error;
  return (
    <WorkspacePage
      eyebrow="Vínculo seguro"
      title="Área do casal"
      description="Conecte as duas contas com consentimento explícito, mantendo as respostas individuais protegidas."
    >
      <CoupleOverview overview={overview} error={error} />
    </WorkspacePage>
  );
}
