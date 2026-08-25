import Link from "next/link";
import { publicNavigation } from "@/config/navigation";
import { PageContainer } from "@/components/ui/page-container";

export function SiteHeader() {
  return (
    <header className="border-b border-line bg-surface/95">
      <PageContainer className="flex min-h-18 items-center justify-between gap-5 py-3">
        <Link href="/" className="font-serif text-lg font-bold leading-tight text-brand-strong sm:text-xl">Contrato<br className="sm:hidden" /> de Casamento</Link>
        <nav aria-label="Navegação principal" className="hidden items-center gap-6 md:flex">
          {publicNavigation.map((item) => <Link key={item.href} href={item.href} className="text-sm font-medium text-muted transition hover:text-brand">{item.label}</Link>)}
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/login" className="rounded-full px-3 py-2 text-sm font-semibold text-brand hover:bg-brand/5">Entrar</Link>
          <Link href="/cadastro" className="hidden rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-strong sm:inline-flex">Criar conta</Link>
        </div>
      </PageContainer>
    </header>
  );
}
