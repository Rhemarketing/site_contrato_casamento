"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import type { NavigationItem } from "@/types/navigation";

interface MobileMenuProps {
  items: NavigationItem[];
  adminItem?: NavigationItem;
  user: { name?: string | null; email?: string | null } | null;
  logoutButton?: ReactNode;
}

export function MobileMenu({ items, adminItem, user, logoutButton }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Fecha o menu se a rota mudar
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setIsOpen(false);
  }

  // Fecha o menu com a tecla Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Bloqueia scroll do body quando aberto no mobile
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={isOpen ? "Fechar menu de navegação" : "Abrir menu de navegação"}
        aria-expanded={isOpen}
        aria-controls="mobile-navigation-panel"
        className="inline-flex size-10 items-center justify-center rounded-lg border border-line bg-surface text-brand-strong transition hover:bg-brand/5 focus-visible:outline-2 focus-visible:outline-brand"
      >
        {isOpen ? (
          <svg className="size-6" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="size-6" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        )}
      </button>

      {isOpen && (
        <>
          {/* Backdrop para fechar ao clicar fora */}
          <div
            className="fixed inset-0 top-[65px] z-30 bg-brand-strong/30 backdrop-blur-xs"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          {/* Painel do menu dropdown */}
          <div
            id="mobile-navigation-panel"
            className="absolute inset-x-0 top-full z-40 border-b border-line bg-surface shadow-2xl transition-all"
          >
            {user && (user.name || user.email) && (
              <div className="border-b border-line bg-background/50 px-5 py-3.5">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted">Conectado como</p>
                <p className="truncate text-sm font-semibold text-brand-strong">{user.name || user.email}</p>
              </div>
            )}

            <nav aria-label="Navegação móvel" className="p-3">
              <div className="space-y-1">
                {items.map((item) => {
                  const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center justify-between rounded-xl px-4 py-3 text-base font-medium transition ${
                        isActive
                          ? "bg-brand/10 font-semibold text-brand"
                          : "text-foreground hover:bg-brand/5 hover:text-brand"
                      }`}
                    >
                      <span>{item.label}</span>
                      {isActive && <span className="size-2 rounded-full bg-brand" aria-hidden="true" />}
                    </Link>
                  );
                })}

                {adminItem && (
                  <Link
                    href={adminItem.href}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center justify-between rounded-xl px-4 py-3 text-base font-medium transition ${
                      pathname.startsWith(adminItem.href)
                        ? "bg-brand/10 font-semibold text-brand"
                        : "text-foreground hover:bg-brand/5 hover:text-brand"
                    }`}
                  >
                    <span>{adminItem.label}</span>
                    {pathname.startsWith(adminItem.href) && <span className="size-2 rounded-full bg-brand" aria-hidden="true" />}
                  </Link>
                )}
              </div>

              <div className="mt-3 border-t border-line pt-3">
                {user ? (
                  <div onClick={() => setIsOpen(false)}>
                    {logoutButton}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      href="/login"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center justify-center rounded-xl border border-line bg-surface px-4 py-3 text-center text-sm font-semibold text-brand transition hover:border-brand"
                    >
                      Entrar
                    </Link>
                    <Link
                      href="/cadastro"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center justify-center rounded-xl bg-brand px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-brand-strong"
                    >
                      Criar conta
                    </Link>
                  </div>
                )}
              </div>
            </nav>
          </div>
        </>
      )}
    </div>
  );
}
