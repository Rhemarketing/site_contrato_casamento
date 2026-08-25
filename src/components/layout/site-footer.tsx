import Link from "next/link";
import { PageContainer } from "@/components/ui/page-container";

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-brand-strong py-8 text-white/75">
      <PageContainer className="flex flex-col gap-4 text-sm sm:flex-row sm:items-center sm:justify-between">
        <p>© {new Date().getFullYear()} Contrato de Casamento</p>
        <div className="flex gap-5"><Link href="/login" className="hover:text-white">Entrar</Link><Link href="/cadastro" className="hover:text-white">Criar conta</Link></div>
      </PageContainer>
    </footer>
  );
}
