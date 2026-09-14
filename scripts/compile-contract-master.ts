import { createHash } from "node:crypto";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import type { Catalog } from "../src/features/contract/domain/types";
import { APPLICABILITY_VERSION, applicabilityDecisions, contextDefinitions } from "../src/features/contract/domain/applicability-policy";
import { applicabilityContextFields } from "../src/features/contract/domain/engine";
import { compileReleaseModule } from "./contract-module-definitions";
import { prepareReleaseCatalog } from "./contract-release-catalog";
import { compileProtocols } from "./contract-protocol-definitions";

async function main() {
const root = path.resolve("contrato_casamento_mestre");
const manifest = JSON.parse(await readFile(path.join(root, "MANIFESTO.json"), "utf8"));
if (manifest.package_version !== "1.4.0") throw new Error("Versão inesperada");
for (const file of manifest.files) {
  const resolved = path.resolve(root, file.path);
  if (!resolved.startsWith(root + path.sep)) throw new Error("Caminho inválido no manifesto");
  const bytes = await readFile(resolved);
  if (createHash("sha256").update(bytes).digest("hex") !== file.sha256) throw new Error(`Integridade inválida: ${file.path}`);
}
// Input is the hash-verified, versioned source package, never a user payload.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function read(name: string): Promise<any> {
  return JSON.parse(await readFile(path.join(root, "dados", `${name}.json`), "utf8"));
}
const [questions, rules, components, modules, privateModules, conditions, crosses, clauses, globals, gambling] = await Promise.all(
  ["perguntas", "matriz_combinacoes", "componentes_saida", "nos_decidimos", "subperguntas_privadas", "condicoes_fluxo", "cruzamentos", "clausulas", "regras_globais", "politica_apostas"].map(read),
);
const decisionsById = new Map(applicabilityDecisions.map(d => [d.questionId, d]));
const missingIds = questions.filter((q: { applicability_rule: unknown }) => q.applicability_rule === null).map((q: { question_id: string }) => q.question_id);
if (decisionsById.size !== 184 || applicabilityDecisions.length !== 184 || missingIds.length !== 184 || missingIds.some((id: string) => !decisionsById.has(id))) throw new Error("As decisões devem cobrir exatamente as 184 aplicabilidades ausentes, sem alterar as 16 existentes");
const policyHash = createHash("sha256").update(JSON.stringify({ version: APPLICABILITY_VERSION, applicabilityDecisions, contextDefinitions })).digest("hex");
const catalog: Catalog = {
  version: "1.4.0-release.1", sourceHash: createHash("sha256").update(JSON.stringify(manifest)).digest("hex"), productionReady: true,
  applicabilityPolicy: { version: APPLICABILITY_VERSION, hash: policyHash }, contextDefinitions,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  questions: questions.map((q: any) => ({ id: q.question_id, title: q.title, prompt: q.prompt_text, order: q.display_order,
    applicability: q.applicability_rule ?? decisionsById.get(q.question_id)!.rule,
    ...(decisionsById.has(q.question_id) ? { applicabilityDecision: { version: APPLICABILITY_VERSION, rationale: decisionsById.get(q.question_id)!.rationale } } : {}),
    period: q.reference_period.years === 2 ? "Últimos 2 anos" : q.reference_period.source_override_text ?? "Últimos 90 dias",
    clauseId: q.clause_destination, proposedClauseId: q.clause_destination_proposal ?? null, source: q.base_source_ref,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    options: q.options.map((o: any) => ({ code: o.code, text: o.text, privacy: o.privacy_class, componentId: o.output_component_id })),
  })),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  rules: rules.map((r: any) => ({ id: r.pair_rule_id, questionId: r.question_id, key: r.pair_key, action: r.action, privacy: r.privacy_class, target: r.output_target,
    componentId: r.pair_component_id ?? null, fixedComponentIds: r.fixed_component_ids ?? [], moduleIds: r.joint_module_ids,
    privateModuleIds: r.private_module_ids, protocolIds: r.protocol_ids, eventRuleIds: r.event_rule_ids,
    dependencies: r.execution_dependencies, steps: r.conditional_steps, active: false, jointBlocked: r.joint_blocked === true, source: r.source_refs,
  })),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  components: components.map((c: any) => ({ id: c.component_id, questionId: c.question_id, privacy: c.privacy_class, target: c.output_target,
    template: c.contract_template, editorialTemplate: c.editorial_template ?? null, editorialFinal: c.editorial_status === "FINAL_BY_USER_DELEGATION",
    active: false, version: c.version ?? "1.4.0", source: c.source_refs,
  })),
  modules: modules.map(compileReleaseModule),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  privateModules: privateModules.map((m: any) => ({ id: m.private_module_id, questionId: m.question_id, trigger: m.trigger.answer_in, prompt: m.prompt_text, options: m.options })),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  conditions: conditions.map((c: any) => ({ id: c.condition_id, questionId: c.question_id, predicate: c.predicate })),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  crossRules: crosses.map((c: any) => ({ id: c.cross_rule_id, predicate: c.predicate, status: c.status })),
  clauses: clauses.map((c: { clause_id: string; title: string }) => ({ id: c.clause_id, title: c.title })),
  safetyLevels: Object.fromEntries(Object.entries(globals.safety.source_option_severities).map(([id, levels]) =>
    [id, Object.fromEntries(Object.entries(levels as object).filter(([key]) => ["A", "B", "C"].includes(key)))])),
  gamblingTemplate: gambling.contract_template,
};
prepareReleaseCatalog(catalog, components, await read("regras_fixas"), crosses);
catalog.protocols = compileProtocols(await read("protocolos"));
catalog.reviewGuides = ["Q150", "Q185"].map(id => {
  const q = questions.find((q: { question_id: string }) => q.question_id === id);
  const source = q.source_sections.find((s: { label: string }) => s.label === (id === "Q150" ? "ROTEIRO FIXO DA REVISÃO DO PROJETO DE VIDA" : "GATILHOS DE REVISÃO EXTRAORDINÁRIA"));
  return { id, title: q.title, paragraphs: source.text.split(/\n\s*\n/).map((p: string) => p.replace(/\s+/g, " ")).filter((p: string) => !/^[A-Z0-9_]+$/.test(p)) };
});
const lifeQuestion = questions.find((q: { question_id: string }) => q.question_id === "Q150");
const lifeTemplate = lifeQuestion.source_sections.find((s: { label: string }) => s.label === "Texto automático").text.match(/“([^”]+)”/)[1];
catalog.modules.push({ id: "ND-Q150-REVIEW", questionId: "Q150", title: "Resultado da revisão do projeto de vida", prompt: "Registrem o resultado após percorrer o roteiro de revisão disponível no acompanhamento.", predicate: { op: "fact", name: "Q150_review_requested" }, status: "COMPILED", compiled: true, operational: true,
  options: [{ code: "A", text: "Registrar o resultado da revisão realizada", template: lifeTemplate, fields: ["roteiro", "prioridade", "responsavel", "prazo", "metas", "data"] }],
  fieldDefinitions: {
    roteiro: { label: "Roteiro da revisão", type: "selection", options: ["Percorremos os dez temas do roteiro de revisão"] },
    prioridade: { label: "Prioridade principal", type: "text" }, responsavel: { label: "Responsável pela prioridade principal", type: "member" }, prazo: { label: "Prazo da prioridade principal", type: "date" },
    metas: { label: "Até três metas secundárias", type: "table", optional: true, emptyText: "nenhuma meta secundária registrada", maxRows: 3, columns: [{ label: "Meta", type: "text" }, { label: "Responsável", type: "member" }, { label: "Prazo", type: "date" }] },
    data: { label: "Data da próxima revisão", type: "date" },
  }, fixedTexts: [lifeQuestion.source_sections.find((s: { label: string }) => s.label === "Regra").text], reusedByQuestions: [], source: lifeQuestion.base_source_ref, version: "1.4.0-release.1" });
catalog.bible = JSON.parse(await readFile("src/data/contract-bible.json", "utf8"));
if (createHash("sha256").update(await readFile("content/bible/porbr2018_vpl.zip")).digest("hex") !== catalog.bible!.sourceArchiveSha256) throw new Error("Integridade da tradução bíblica inválida");
if (catalog.questions.length !== 200 || catalog.rules.length !== 1200 || catalog.components.filter(c => c.editorialFinal).length !== 487) throw new Error("Inventário inválido");
for (const q of catalog.questions) for (const field of applicabilityContextFields(q)) {
  if (!catalog.contextDefinitions?.[field]) throw new Error(`Contexto sem definição: ${q.id}/${field}`);
}
const finalTexts = await read("textos_conjuntos");
for (const text of finalTexts) {
  const component = catalog.components.find(c => c.id === text.component_id);
  if (!component?.editorialFinal || component.editorialTemplate !== text.template || createHash("sha256").update(text.template).digest("hex") !== text.sha256) throw new Error(`Texto conjunto inconsistente: ${text.text_id}`);
}
await mkdir("src/data", { recursive: true });
await writeFile("src/data/contract-master-v1.4.0.json", JSON.stringify(catalog) + "\n");
const general = applicabilityDecisions.filter(d => "always" in d.rule).length;
const escapeCell = (value: string) => value.replaceAll("|", "\\|").replace(/\s+/g, " ");
const rows = catalog.questions.map(q => {
  const fields = applicabilityContextFields(q);
  const rule = fields.length ? fields.map(f => `${f} = sim`).join(" e ") : "Sempre aplicável";
  const review = q.applicability && "requires_private_review" in q.applicability ? " + revisão privada segura vinculada às respostas" : "";
  return `| ${q.id} — ${escapeCell(q.title)} | ${q.applicabilityDecision ? "Decisão delegada" : "Fonte preservada"} | ${rule}${review} | ${escapeCell(q.applicabilityDecision?.rationale ?? "Regra existente preservada integralmente.")} |`;
});
const contextRows = Object.entries(contextDefinitions).map(([id, field]) => `| ${id} | ${escapeCell(field.label)} | ${escapeCell(field.help)} |`);
await mkdir("docs", { recursive: true });
await writeFile("docs/contract-applicability-decisions.md", `# Aplicabilidade — decisões delegadas\n\nGerado por \`npm run contract:compile\`. Política ${APPLICABILITY_VERSION}; integração ${catalog.version}; base original 1.4.0.\n\nAutorização: pedido do usuário em 12/09/2026 para decidir a aplicabilidade das 184 perguntas. São decisões de produto, não citações da fonte nem novas cláusulas de contrato.\n\nDas 184 regras antes ausentes: **${general} gerais** e **${184 - general} condicionais**. As 16 regras existentes são preservadas. Há **zero regras de aplicabilidade ausentes**, mas Q181 conserva a exigência de revisão privada segura, agora implementada com autorização nominal e revogação.\n\n## Critérios\n\n- Preferências, cenários hipotéticos e autoavaliações de postura são gerais, sem afirmar que um evento ocorreu. Responder exige escolher uma alternativa real; o sistema nunca escolhe por alguém. Não conseguir se avaliar mantém a pergunta sem resposta, sem transformá-la em A ou em inaplicável.\n- Experiências específicas e contextos estruturais são verificados antes do enunciado e das alternativas. Contexto SIM libera a resposta quando não há outra exigência; contexto NÃO produz NOT_APPLICABLE; ausente ou desconhecido mantém BLOCKED_BY_POLICY.\n- Contextos são individuais, booleanos e criptografados. Não pedir nomes de terceiros, diagnósticos, detalhes íntimos ou provas. Não inferir por sexo, gênero, idade, renda, orientação sexual, religião presumida, letras ou respostas do cônjuge.\n- O enunciado e seu período original prevalecem. Contextos ligados a episódios usam esse período; histórico com consequências atuais e luto em curso têm as exceções descritas na tabela. Preferências futuras não exigem ocorrência nos últimos 90 dias. Nenhum período novo de diagnóstico ou prazo de protocolo foi criado.\n- Q101–Q109 e Q119 não recebem filtros de violência, religião, emprego, tecnologia ou vida sexual. Q110 preserva a condição original de filhos/dependentes. Sem resposta não significa ausência de risco; a agregação considera respostas distintas por pessoa e a maior severidade, conforme a política de liberação.\n- Na Q146, não desejar filhos é uma posição válida (C), e dúvida ou divergência não excluem o tema. Fertilidade, idade e ausência de filhos não decidem a pertinência.\n- Na Q181, histórico conhecido e reconstrução voluntária são condições necessárias, insuficientes para liberação. A revisão privada segura é uma exigência da fonte; nenhum campo do navegador pode concedê-la. Ausência confirmada de contexto torna a pergunta inaplicável; presença mantém bloqueio até existir uma revisão vigente e autorizada.\n- Uma pergunta aplicável a somente um participante não forma par artificial: NO_SHARED_APPLICABILITY. Sua resposta permanece privada e não produz saída conjunta.\n- Quando o contexto muda para não ou desconhecido, respostas e complementos desse ramo são removidos. Voltar a sim exige nova resposta; não se ressuscita A/B/C antigo. NOT_APPLICABLE conta como item resolvido no progresso, mas não como resposta A/B/C.\n- Nova edição para novas sessões. Fotografias e respostas da integração 1.4.0 permanecem vinculadas à versão antiga; não são migradas nem reinterpretadas automaticamente.\n- A edição de liberação inclui os controles documentados em contract-release-decisions.md. A ativação do servidor exige chave própria, configuração do ambiente e migrations; gateway real permanece adiado por solicitação do usuário.\n\n## Matriz completa\n\n| Pergunta | Origem da regra | Aplicabilidade | Justificativa |\n|---|---|---|---|\n${rows.join("\n")}\n\n## Contextos exibidos somente ao respondente\n\n| Identificador | Pergunta de contexto | Orientação |\n|---|---|---|\n${contextRows.join("\n")}\n`);
console.log(`Arquivo-mestre verificado: 200 perguntas, 1.200 pares, 487 textos conjuntos; ${catalog.modules.filter(m => m.compiled).length} módulos compilados. Aplicabilidade: ${general} gerais + ${184 - general} condicionais delegadas + 16 preservadas. Edição compilada para liberação controlada.`);
}
main().catch(error => { console.error(error instanceof Error ? error.message : "Falha de importação"); process.exitCode = 1; });
