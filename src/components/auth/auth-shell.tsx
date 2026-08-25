import type { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { PageContainer } from "@/components/ui/page-container";

interface AuthShellProps { title: string; description: string; children: ReactNode; footer: ReactNode; }

export function AuthShell({ title, description, children, footer }: AuthShellProps) {
  return (
    <PageContainer className="py-12 sm:py-20"><Card className="mx-auto max-w-md p-6 sm:p-9">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">Contrato de Casamento</p><h1 className="mt-3 font-serif text-3xl text-brand-strong">{title}</h1><p className="mt-2 text-muted">{description}</p>
      <div className="mt-8">{children}</div><div className="mt-7 border-t border-line pt-5 text-center text-sm text-muted">{footer}</div>
    </Card></PageContainer>
  );
}
