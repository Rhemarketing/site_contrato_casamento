import Link from "next/link";
import { LogoutButton } from "@/components/auth/logout-button";
import { PageContainer } from "@/components/ui/page-container";
import { publicNavigation } from "@/config/navigation";
import { getCurrentUser } from "@/lib/auth/current-user";

const authenticatedNavigation = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Minha prova", href: "/admissao/questionario" },
  { label: "Casal", href: "/casal" },
];

export async function SiteHeader() {
  const user = await getCurrentUser();
  return (
    <header className="border-b border-line bg-surface/95">
      <PageContainer className="flex min-h-18 flex-wrap items-center justify-between gap-x-5 gap-y-2 py-3">
        <Link href="/" className="font-serif text-lg font-bold leading-tight text-brand-strong sm:text-xl">Contrato<br className="sm:hidden" /> de Casamento</Link>
        <nav aria-label="Navegação principal" className="order-3 flex w-full items-center gap-5 overflow-x-auto py-1 md:order-none md:w-auto md:overflow-visible">
          {(user ? authenticatedNavigation : publicNavigation).map((item) => <Link key={item.href} href={item.href} className="whitespace-nowrap text-sm font-medium text-muted transition hover:text-brand">{item.label}</Link>)}
          {user?.role === "ADMIN" ? <Link href="/admin" className="text-sm font-medium text-muted transition hover:text-brand">Administração</Link> : null}
        </nav>
        <div className="flex items-center gap-2">
          {user ? <LogoutButton /> : <><Link href="/login" className="rounded-full px-3 py-2 text-sm font-semibold text-brand hover:bg-brand/5">Entrar</Link><Link href="/cadastro" className="hidden rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-strong sm:inline-flex">Criar conta</Link></>}
        </div>
      </PageContainer>
    </header>
  );
}
