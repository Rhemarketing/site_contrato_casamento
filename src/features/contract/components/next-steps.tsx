import Link from "next/link";
import { Card } from "@/components/ui";

export function ContractNextSteps() {
  return <Card className="space-y-4">
    <h2 className="text-xl font-semibold">Das respostas ao contrato</h2>
    <ol className="list-decimal space-y-3 pl-5">
      <li><Link className="text-brand underline" href="/contrato/questionario">Responder e concluir o questionário</Link>. Cada pessoa preenche e conclui as perguntas na própria conta.</li>
      <li><strong>Geração automática do contrato</strong>. Assim que ambos concluírem o questionário, o contrato do casal é gerado automaticamente.</li>
      <li><Link className="text-brand underline" href="/contrato/documento">Abrir Nosso contrato</Link> para leitura, download em PDF ou impressão imediata.</li>
    </ol>
  </Card>;
}
