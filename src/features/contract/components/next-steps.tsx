import Link from "next/link";
import { Card } from "@/components/ui";

export function ContractNextSteps() {
  return <Card className="space-y-4">
    <h2 className="text-xl font-semibold">Das respostas ao contrato</h2>
    <ol className="list-decimal space-y-3 pl-5">
      <li><Link className="text-brand underline" href="/contrato/questionario#conclusao">Concluir minhas respostas e autorizar a avaliação</Link>. Cada pessoa faz isso na própria conta, depois de preencher as perguntas e os complementos privados. Se conectaram as contas depois de concluir, autorizem a avaliação após a conexão.</li>
      <li><Link className="text-brand underline" href="/contrato/decisoes">Revisar NÓS DECIDIMOS</Link>. Quando a etapa estiver disponível, preencham os contextos conjuntos e confirmem a mesma proposta nas duas contas para os acordos apresentados.</li>
      <li><Link className="text-brand underline" href="/contrato/documento">Abrir Nosso contrato</Link> e clicar em <strong>Preparar ou atualizar rascunho</strong>. Depois, cada pessoa lê o texto e registra seu aceite. O documento pode ser impresso ou salvo como PDF.</li>
    </ol>
    <p className="text-sm text-muted">Se a etapa conjunta ainda estiver indisponível, confira a conclusão e a autorização na sua conta e consulte <Link className="underline" href="/contrato/privacidade">sua área privada</Link>. Estas orientações não revelam respostas ou condições privadas do parceiro.</p>
  </Card>;
}
