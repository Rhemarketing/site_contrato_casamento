import type { ReactNode } from "react";
import { PageHeading } from "@/components/layout/page-heading";
import { PageContainer } from "@/components/ui/page-container";

interface WorkspacePageProps { eyebrow: string; title: string; description: string; children: ReactNode; }

export function WorkspacePage({ eyebrow, title, description, children }: WorkspacePageProps) {
  return <><PageHeading eyebrow={eyebrow} title={title} description={description} /><PageContainer className="py-10 sm:py-14">{children}</PageContainer></>;
}
