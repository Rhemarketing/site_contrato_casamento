"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function AdminNav() {
  const pathname = usePathname();

  const isUsers = pathname === "/admin" || pathname.startsWith("/admin/usuarios");
  const isWhiteboard = pathname.startsWith("/admin/contrato/whiteboard");
  const isCatalog = pathname.startsWith("/admin/contrato") && !isWhiteboard;

  return (
    <div className="mb-8 border-b border-line">
      <nav className="flex space-x-6">
        <Link
          href="/admin"
          className={`flex items-center gap-2 border-b-2 pb-3.5 text-sm font-semibold transition-colors ${
            isUsers
              ? "border-brand text-brand"
              : "border-transparent text-muted hover:border-line hover:text-foreground"
          }`}
        >
          <svg className="size-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          Gestão de Usuários
        </Link>

        <Link
          href="/admin/contrato"
          className={`flex items-center gap-2 border-b-2 pb-3.5 text-sm font-semibold transition-colors ${
            isCatalog
              ? "border-brand text-brand"
              : "border-transparent text-muted hover:border-line hover:text-foreground"
          }`}
        >
          <svg className="size-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10 9 9 9 8 9" />
          </svg>
          Catálogo & Arquivo-Mestre
        </Link>

        <Link
          href="/admin/contrato/whiteboard"
          className={`flex items-center gap-2 border-b-2 pb-3.5 text-sm font-semibold transition-colors ${
            isWhiteboard
              ? "border-brand text-brand"
              : "border-transparent text-muted hover:border-line hover:text-foreground"
          }`}
        >
          <svg className="size-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="7" height="7" rx="1.5" />
            <rect x="14" y="3" width="7" height="7" rx="1.5" />
            <rect x="14" y="14" width="7" height="7" rx="1.5" />
            <rect x="3" y="14" width="7" height="7" rx="1.5" />
            <path d="M10 6.5h4" />
            <path d="M6.5 10v4" />
            <path d="M17.5 10v4" />
            <path d="M10 17.5h4" />
          </svg>
          Whiteboard das 200 Questões
        </Link>
      </nav>
    </div>
  );
}
