import type { Metadata } from "next";
import { WorkspacePage } from "@/components/layout/workspace-page";
import { CoupleComparisonOverview } from "@/features/couple-comparison/components/couple-comparison-overview";
import { requireUser } from "@/lib/auth/current-user";
import { db } from "@/lib/db";
import { PrismaCoupleComparisonRepository } from "@/repositories/prisma/prisma-couple-comparison.repository";
import { CoupleComparisonService } from "@/services/couple-comparison.service";

export const metadata: Metadata = {
  title: "Comparação do casal",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function CoupleComparisonPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const user = await requireUser("/casal/comparacao");
  const state = await new CoupleComparisonService(new PrismaCoupleComparisonRepository(db)).getForUser(user.id);
  const error = (await searchParams).error;
  return (
    <WorkspacePage
      eyebrow="Consentimento mútuo"
      title="Comparação do casal"
      description="Um espaço protegido para observar diferenças de percepção somente quando as duas pessoas autorizarem."
    >
      <CoupleComparisonOverview state={state} error={error} />
    </WorkspacePage>
  );
}
