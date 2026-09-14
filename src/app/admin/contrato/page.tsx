import Link from "next/link";
import { Alert, Badge, Card } from "@/components/ui";
import { WorkspacePage } from "@/components/layout/workspace-page";
import { requireAdmin } from "@/lib/auth/current-user";
import { contractCatalog } from "@/features/contract/server/catalog";
import { applicabilityContextFields, catalogReadiness } from "@/features/contract/domain/engine";
import { renderRegisteredTemplate } from "@/features/contract/domain/decisions";

export const dynamic = "force-dynamic";
export default async function ContractEditorialPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  await requireAdmin();
  const params = await searchParams;
  const catalog = contractCatalog;
  const q = catalog.questions.find(q => q.id === params.q) ?? catalog.questions[0];
  const report = catalogReadiness(catalog);
  const texts = catalog.components.filter(c => c.questionId === q.id && c.editorialFinal && c.editorialTemplate && c.privacy === "COMMON" && c.target === "CONTRACT");
  const rules = catalog.rules.filter(r => r.questionId === q.id);
  return <WorkspacePage eyebrow="Revisão editorial" title="Arquivo-mestre 1.4.0" description="Catálogo sem respostas de usuários. As prévias usam identidades fictícias e não são contratos emitidos.">
    <Alert variant="warning">{report.productionReady ? "Edição compilada para liberação." : "Edição indisponível."} {report.missingApplicability} perguntas sem regra de aplicabilidade; {report.privateReviewApplicability} exige revisão privada antes da exibição. Restam {report.pendingModules} módulos conjuntos por estruturar e {report.pendingCrossRules} cruzamentos sem predicado.</Alert>
    <p className="mt-4 text-sm text-muted">Edição de integração: {catalog.version}. As 184 aplicabilidades foram decididas por delegação; as 16 regras da fonte foram preservadas.</p>
    <div className="my-6 grid gap-4 sm:grid-cols-4">{[["Perguntas", report.questions], ["Combinações", report.pairs], ["Textos conjuntos finais", report.jointTexts], ["Módulos compilados", report.compiledModules]].map(([label, value]) => <Card key={label}><p className="text-sm text-muted">{label}</p><p className="mt-2 text-3xl font-semibold text-brand">{value}</p></Card>)}</div>
    <form className="my-6 flex flex-wrap gap-3" action="/admin/contrato"><label className="flex-1">Pergunta<select name="q" defaultValue={q.id} className="mt-2 min-h-12 w-full rounded-xl border border-line bg-surface p-3">{catalog.questions.map(q => <option key={q.id} value={q.id}>{q.id} — {q.title}</option>)}</select></label><button className="self-end rounded-full bg-brand px-5 py-3 text-white">Consultar</button></form>
    <Card className="space-y-4"><Badge>{q.id}</Badge><h2 className="text-2xl font-semibold">{q.title}</h2><p>{q.prompt}</p><p className="text-sm text-muted">{q.period} · {q.applicability && "always" in q.applicability ? "Aplicabilidade geral" : "Aplicabilidade condicionada ao contexto individual"}</p>
      {q.applicabilityDecision ? <p>{q.applicabilityDecision.rationale}</p> : <p>Regra original preservada.</p>}
      {applicabilityContextFields(q).map(id => <p key={id} className="text-sm"><strong>{catalog.contextDefinitions?.[id]?.label}</strong> {catalog.contextDefinitions?.[id]?.help}</p>)}
      {q.options.map(o => <p key={o.code}><strong>{o.code}.</strong> {o.text}</p>)}
      <div className="overflow-x-auto"><table className="w-full text-left text-sm"><caption className="mb-3 text-left font-semibold">Seis combinações cadastradas</caption><thead><tr><th className="p-2">Par</th><th>Ação interna</th><th>Dependências locais</th></tr></thead><tbody>{rules.map(r => <tr key={r.id} className="border-t border-line"><td className="p-2">{r.key}</td><td>{r.action}</td><td>{r.dependencies.length}</td></tr>)}</tbody></table></div>
    </Card>
    <div className="my-6 space-y-4"><h2 className="text-xl font-semibold">Redações conjuntas finalizadas — prévia editorial</h2>{texts.length ? texts.map(c => <Card key={c.id}><p className="mb-3 text-sm text-muted">{c.id}</p><p>{renderRegisteredTemplate(c.editorialTemplate!, { "Nome 1": "Pessoa 1", "Nome 2": "Pessoa 2" })}</p></Card>) : <Alert>Esta pergunta não tem texto no lote de 487 redações conjuntas. Saídas privadas continuam restritas ao titular.</Alert>}</div>
    {catalog.modules.filter(m => m.questionId === q.id).map(m => <Card key={m.id} className="mb-4"><h3 className="font-semibold">{m.id} — {m.compiled ? "Definição compilada" : "Módulo indisponível"}</h3>{m.compiled ? <><p className="my-3">{m.prompt}</p>{m.options.map(o => <div className="mb-4" key={o.code}><p>{o.code}. {o.text}</p><p className="mt-2 text-sm text-muted">{o.template}</p></div>)}</> : <p className="mt-2 text-sm text-muted">{m.status}</p>}</Card>)}
    <Card><h2 className="text-xl font-semibold">Configuração de liberação</h2><p className="mt-4">Aquisição gratuita: R$ 0,00, confirmada pelo servidor. Gateway real adiado por solicitação do usuário. O servidor precisa de chave de criptografia, migrations e configuração explícita de ativação. Revisores somente recebem os escopos autorizados por cada titular.</p><p className="mt-4">56 módulos da fonte e um formulário de resultado da revisão do projeto de vida. Os 96 cruzamentos têm destinos definidos: dois textos cruzados com papéis, duas reutilizações e 92 referências contextuais individuais; referências sem regra de inferência não criam diagnósticos.</p><p className="mt-4">Os 487 textos conjuntos estão preservados. A publicação de cada texto depende de sua elegibilidade e privacidade.</p></Card>
    <Link href="/contrato" className="mt-6 inline-block text-brand underline">Voltar à área do contrato</Link>
  </WorkspacePage>;
}
