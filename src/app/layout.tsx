import type { Metadata } from "next";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Contrato de Casamento",
    template: "%s | Contrato de Casamento",
  },
  description:
    "Um espaço seguro para transformar conversas importantes em decisões conscientes a dois.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body className="flex min-h-screen flex-col antialiased">
        <a className="skip-link" href="#conteudo-principal">
          Pular para o conteúdo
        </a>
        <SiteHeader />
        <main id="conteudo-principal" className="flex-1">
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
