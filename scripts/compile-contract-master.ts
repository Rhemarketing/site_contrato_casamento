import { createHash } from "node:crypto";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import type { Catalog, JointModule } from "../src/features/contract/domain/types";

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
// Explicit compilation of complete definitions. No fallback extraction or
// model-generated wording. All other modules retain their blocking source status.
const compiledPrompts: Record<string, string> = {
  "ND-Q011-01": "Qual será a frequência mínima de um momento exclusivo de vocês?",
  "ND-Q031-01": "Qual regra geral?",
  "ND-Q041-01": "NÓS DECIDIMOS 1 — modelo",
  "ND-Q041-02": "NÓS DECIDIMOS 2 — contribuição comum",
  "ND-Q069-01": "Qual é a posição atual do casal em relação à possibilidade de gravidez?",
  "ND-Q113-01": "NÓS DECIDIMOS",
  "ND-Q124-01": "Qual modelo geral vocês desejam utilizar para organização das refeições principais da casa?",
  "ND-Q140-01": "Qual objetivo vocês desejam registrar para experiências especiais do casal?",
};
const compiledIds = new Set(Object.keys(compiledPrompts));
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function compileModule(m: any): JointModule {
  const compiled = compiledIds.has(m.joint_module_id);
  const options = compiled ? ["A", "B", "C"].map(code => {
    const section = m.source_text.split(`Texto ${code}`)[1];
    const template = section?.match(/“([^”]+)”/)?.[1]?.replace(/\s+/g, " ").trim();
    const option = m.option_candidates.find((o: { code: string }) => o.code === code);
    if (!template || !option) throw new Error(`Módulo incompleto: ${m.joint_module_id}`);
    const fields = [...template.matchAll(/\{([^}]+)\}/g)].map(x => x[1]).filter(x => !["Nome 1", "Nome 2"].includes(x));
    if (fields.some(x => !["categorias 1", "categorias 2"].includes(x))) throw new Error("Campo não compilado");
    return { code, text: option.text_candidate, template, fields };
  }) : [];
  return {
    id: m.joint_module_id, questionId: m.question_id, title: m.label,
    prompt: compiledPrompts[m.joint_module_id] ?? null,
    predicate: m.trigger_predicate ?? null, status: m.status, compiled,
    options: options as JointModule["options"], source: m.source_ref, version: "1.4.0-compiled.1",
    fixedTexts: m.joint_module_id === "ND-Q140-01" ? [m.source_text.split("PARÁGRAFO FIXO")[1].replace(/\s+/g, " ").trim()]
      : m.joint_module_id === "ND-Q069-01" ? [m.source_text.split("Regra importante")[1].split("Aplicabilidade")[0].replace(/\s+/g, " ").trim()] : [],
    reusedByQuestions: m.joint_module_id === "ND-Q011-01" ? ["Q048", "Q131"] : [],
  };
}
const catalog: Catalog = {
  version: "1.4.0", sourceHash: createHash("sha256").update(JSON.stringify(manifest)).digest("hex"), productionReady: false,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  questions: questions.map((q: any) => ({ id: q.question_id, title: q.title, prompt: q.prompt_text, order: q.display_order,
    applicability: q.applicability_rule, period: q.reference_period.years === 2 ? "Últimos 2 anos" : q.reference_period.source_override_text ?? "Últimos 90 dias",
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
  modules: modules.map(compileModule),
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
if (catalog.questions.length !== 200 || catalog.rules.length !== 1200 || catalog.components.filter(c => c.editorialFinal).length !== 487) throw new Error("Inventário inválido");
const finalTexts = await read("textos_conjuntos");
for (const text of finalTexts) {
  const component = catalog.components.find(c => c.id === text.component_id);
  if (!component?.editorialFinal || component.editorialTemplate !== text.template || createHash("sha256").update(text.template).digest("hex") !== text.sha256) throw new Error(`Texto conjunto inconsistente: ${text.text_id}`);
}
await mkdir("src/data", { recursive: true });
await writeFile("src/data/contract-master-v1.4.0.json", JSON.stringify(catalog) + "\n");
console.log(`Arquivo-mestre verificado: 200 perguntas, 1.200 pares, 487 textos conjuntos; ${compiledIds.size} módulos compilados. Produção bloqueada.`);
}
main().catch(error => { console.error(error instanceof Error ? error.message : "Falha de importação"); process.exitCode = 1; });
