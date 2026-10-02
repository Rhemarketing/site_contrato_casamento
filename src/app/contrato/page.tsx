import type { Metadata } from "next";
import Link from "next/link";
import { Card, Badge, Button } from "@/components/ui";
import { requireUser } from "@/lib/auth/current-user";
import { contractAvailable, previewAvailable, requireContractPreview } from "@/features/contract/server/access";
import { db } from "@/lib/db";
import { ContractPurchaseService } from "@/services/contract-purchase.service";
import { ContractActionButton } from "@/features/contract/components/action-button";
import { startContractAction } from "@/app/actions/contract.actions";
import { acquireFreeContractAction } from "@/app/actions/contract-purchase.actions";

export const metadata: Metadata = { title: "Meu contrato" };
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ContractPage() {
  const user = await requireUser("/contrato");
  let allowed = false;
  const purchase = await new ContractPurchaseService(db).get(user.id);
  const acquired = purchase?.status === "PAID";
  if (previewAvailable()) {
    try {
      requireContractPreview(user.id);
      allowed = true;
    } catch {}
  }

  return (
    <div className="space-y-6">
      <Card>
        <Badge>Arquivo-mestre 1.4.0</Badge>
        <h2 className="mt-4 text-2xl font-semibold text-brand-strong">Do diálogo aos compromissos</h2>
        <ol className="mt-5 space-y-3">
          <li>1. Cada pessoa responde individualmente às perguntas aplicáveis.</li>
          <li>2. O contrato é gerado automaticamente assim que os dois concluírem o questionário.</li>
          <li>3. O documento fica imediatamente pronto para leitura, download em PDF e impressão.</li>
        </ol>
      </Card>

      <Card className="space-y-4">
        <h2 className="text-xl font-semibold">Contrato de Casamento — R$ 0,00</h2>
        <p>
          {acquired
            ? (purchase.shared
              ? "Seu parceiro já adquiriu o produto. Seu acesso às 200 perguntas está liberado automaticamente."
              : "Sua aquisição está confirmada e também libera o acesso do parceiro conectado.")
            : "Uma única aquisição libera as 200 perguntas para os dois. Você pode responder individualmente mesmo antes de conectar as contas."}
        </p>
        {acquired ? (
          <Link className="inline-block rounded-full bg-brand px-6 py-3 font-semibold text-white hover:bg-brand-strong" href="/contrato/questionario">
            Acessar questionário (200 perguntas)
          </Link>
        ) : (
          <form action={acquireFreeContractAction}>
            <Button type="submit">Comprar — R$ 0,00</Button>
          </form>
        )}
      </Card>

      {contractAvailable() && acquired ? (
        <Card className="space-y-4">
          <h2 className="text-xl font-semibold">Seu espaço individual</h2>
          <p>
            Você pode começar agora e conectar seu parceiro depois. Ao iniciar, suas respostas serão armazenadas de forma criptografada para preparar seus acordos. O compartilhamento exige autorização separada e pode ser revogado.
          </p>
          <Link className="inline-block text-brand underline font-semibold" href="/contrato/questionario">
            Abrir questionário (200 perguntas)
          </Link>
        </Card>
      ) : null}

      {allowed ? (
        <Card className="space-y-4">
          <h2 className="text-xl font-semibold">Prévia com dados fictícios</h2>
          <p>
            Use as contas de teste conectadas. As 200 regras de aplicabilidade estão cadastradas. Preencha os contextos e as respostas e autorize a avaliação nas duas contas. Alertas privados não bloqueiam a criação do contrato.
          </p>
          <ContractActionButton action={startContractAction}>Iniciar ou continuar a prévia</ContractActionButton>
          <Link className="inline-block text-brand underline" href="/contrato/questionario">
            Abrir minhas respostas
          </Link>
        </Card>
      ) : null}

      <div>
        <Link href="/admissao/resultado" className="inline-block text-brand underline">
          Consultar meu resultado de admissão
        </Link>
      </div>

      {user.role === "ADMIN" ? (
        <p>
          <Link className="text-brand underline" href="/admin/contrato">
            Revisar catálogo e pendências de integração
          </Link>
        </p>
      ) : null}
    </div>
  );
}
