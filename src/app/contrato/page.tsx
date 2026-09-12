import Link from "next/link";
import { Card, Alert, Badge } from "@/components/ui";
import { requireUser } from "@/lib/auth/current-user";
import { previewAvailable, requireContractPreview } from "@/features/contract/server/access";
import { ContractActionButton } from "@/features/contract/components/action-button";
import { startContractAction } from "@/app/actions/contract.actions";

export default async function ContractPage() {
  const user = await requireUser("/contrato");
  let allowed = false;
  if (previewAvailable()) { try { requireContractPreview(user.id); allowed = true; } catch {} }
  return <div className="space-y-6"><Card><Badge>Arquivo-mestre 1.4.0</Badge><h2 className="mt-4 text-2xl font-semibold text-brand-strong">Do diálogo aos compromissos</h2>
    <ol className="mt-5 space-y-3"><li>1. Cada pessoa responde individualmente às perguntas aplicáveis.</li><li>2. Os dois autorizam a avaliação para preparar os acordos.</li><li>3. As decisões conjuntas exigem confirmação da mesma proposta.</li><li>4. O contrato utiliza os textos cadastrados e as decisões confirmadas.</li></ol></Card>
    <Alert>Esta etapa está em preparação. A prova de admissão e seu resultado continuam disponíveis.</Alert>
    {allowed ? <Card className="space-y-4"><h2 className="text-xl font-semibold">Prévia com dados fictícios</h2><p>Use as contas de teste conectadas. As regras ainda não definidas aparecem como pendentes e impedem a conclusão.</p><ContractActionButton action={startContractAction}>Iniciar ou continuar a prévia</ContractActionButton><Link className="inline-block text-brand underline" href="/contrato/questionario">Abrir minhas respostas</Link></Card> : null}
    <Link href="/admissao/resultado" className="inline-block text-brand underline">Consultar meu resultado de admissão</Link>
    {user.role === "ADMIN" ? <p><Link className="text-brand underline" href="/admin/contrato">Revisar catálogo e pendências de integração</Link></p> : null}
  </div>;
}
