import Link from "next/link";
import { PageContainer } from "@/components/ui/page-container";

export function SiteFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-[#1b3846] bg-[#0a1820] text-slate-300">
      <PageContainer className="py-10 sm:py-12">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          {/* Identidade e Proposta */}
          <div className="max-w-md">
            <Link href="/" className="inline-flex items-center gap-3">
              <span className="flex size-9 items-center justify-center rounded-xl border border-amber-400/30 bg-gradient-to-br from-[#173744] to-[#244b5a] font-serif text-base font-bold text-amber-300 shadow-sm">
                CC
              </span>
              <span className="font-serif text-lg font-bold tracking-tight text-white">
                Contrato de Casamento
              </span>
            </Link>
            <p className="mt-3 text-xs leading-relaxed text-slate-400 sm:text-sm">
              Ferramenta estruturada de alinhamento e acordos para o casal. Mais clareza, respeito mútuo e privacidade individual na vida a dois.
            </p>
          </div>

          {/* Links Essenciais de Navegação */}
          <nav
            aria-label="Navegação do rodapé"
            className="flex flex-wrap items-center gap-x-6 gap-y-3 text-xs sm:text-sm"
          >
            <Link
              href="/cadastro?callbackUrl=%2Fadmissao%2Fquestionario"
              className="text-amber-300 transition-colors hover:text-amber-200"
            >
              Avaliação Gratuita
            </Link>
            <Link
              href="/#passo-a-passo"
              className="transition-colors hover:text-white"
            >
              Como Funciona
            </Link>
            <Link
              href="/#duvidas"
              className="transition-colors hover:text-white"
            >
              Dúvidas
            </Link>
            <Link
              href="/contrato/privacidade"
              className="transition-colors hover:text-white"
            >
              Privacidade & LGPD
            </Link>
            <span className="hidden h-3.5 w-px bg-slate-700 sm:inline-block" />
            <Link
              href="/login"
              className="font-medium text-white transition-colors hover:text-amber-200"
            >
              Entrar
            </Link>
            <Link
              href="/cadastro"
              className="font-medium text-white transition-colors hover:text-amber-200"
            >
              Criar Conta
            </Link>
          </nav>
        </div>

        {/* Linha Divisória */}
        <div className="mt-8 border-t border-[#173441] pt-6">
          <div className="flex flex-col gap-4 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
            <p>© {currentYear} Contrato de Casamento. Todos os direitos reservados.</p>

            <p className="text-[11px] leading-relaxed text-slate-400 sm:max-w-xl sm:text-right">
              Método relacional e preventivo de alinhamento entre parceiros. Não substitui assessoria jurídica formal nem atos notariais em cartório.
            </p>
          </div>
        </div>
      </PageContainer>
    </footer>
  );
}
