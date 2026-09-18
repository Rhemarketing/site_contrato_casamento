import Link from "next/link";
import { LogoutButton } from "@/components/auth/logout-button";
import { PageContainer } from "@/components/ui/page-container";
import { publicNavigation } from "@/config/navigation";
import { getCurrentUser } from "@/lib/auth/current-user";
import { MobileMenu } from "./mobile-menu";

const authenticatedNavigation = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Minha prova", href: "/admissao/questionario" },
  { label: "Casal", href: "/casal" },
  { label: "Meu contrato", href: "/contrato" },
];

export async function SiteHeader() {
  const user = await getCurrentUser();
  const navigationItems = user ? authenticatedNavigation : publicNavigation;
  const adminItem = user?.role === "ADMIN" ? { label: "Administração", href: "/admin" } : undefined;

  return (
    <header className="relative border-b border-line bg-surface/95 backdrop-blur-sm">
      <PageContainer className="flex min-h-18 items-center justify-between gap-x-5 py-3">
        <Link href="/" className="font-serif text-lg font-bold leading-tight text-brand-strong sm:text-xl">
          Contrato<br className="sm:hidden" /> de Casamento
        </Link>

        {/* Navegação desktop */}
        <nav aria-label="Navegação principal" className="hidden md:flex items-center gap-5">
          {navigationItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="whitespace-nowrap text-sm font-medium text-muted transition hover:text-brand"
            >
              {item.label}
            </Link>
          ))}
          {adminItem && (
            <Link
              href={adminItem.href}
              className="whitespace-nowrap text-sm font-medium text-muted transition hover:text-brand"
            >
              {adminItem.label}
            </Link>
          )}
        </nav>

        {/* Ações do usuário no desktop */}
        <div className="hidden md:flex items-center gap-2">
          {user ? (
            <LogoutButton />
          ) : (
            <>
              <Link href="/login" className="rounded-full px-3 py-2 text-sm font-semibold text-brand hover:bg-brand/5">
                Entrar
              </Link>
              <Link
                href="/cadastro"
                className="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-strong"
              >
                Criar conta
              </Link>
            </>
          )}
        </div>

        {/* Menu hambúrguer para mobile */}
        <MobileMenu
          items={navigationItems}
          adminItem={adminItem}
          user={user ? { name: user.name, email: user.email } : null}
          logoutButton={
            <LogoutButton
              className="flex w-full items-center justify-center rounded-xl bg-accent/10 px-4 py-3 text-center text-base font-semibold text-accent transition hover:bg-accent/20"
              buttonText="Sair da conta"
            />
          }
        />
      </PageContainer>
    </header>
  );
}
