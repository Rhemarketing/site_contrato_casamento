// @vitest-environment node
import { describe, expect, it } from "vitest";
import { contractCatalog as catalog } from "../server/catalog";
import { renderDecision, validateDecision } from "./decisions";
import type { DecisionColumn, DecisionField, JointModule, Letter } from "./types";

function sample(field: DecisionColumn | DecisionField): string {
  if (field.options) return field.options[0];
  return ({ member: "1", date: "2026-10-15", time: "08:30", money: "100.50", percent: "5", number: "30", amountOrPercent: "5%" } as Record<string, string>)[field.type] ?? "Acordo de teste";
}
export function moduleParameters(definition: JointModule, code: Letter) {
  const params: Record<string, string[]> = {};
  for (const key of definition.options.find(o => o.code === code)!.fields) {
    const field = definition.fieldDefinitions![key];
    if (field.when && !params[field.when.field]?.includes(field.when.value)) continue;
    params[key] = [field.type === "table" ? JSON.stringify(field.columns!.map(sample)) : sample(field)];
  }
  return params;
}
describe("módulos consolidados da fonte", () => {
  it("renderiza todas as alternativas dos 56 módulos, com validação dos campos", () => {
    expect(catalog.modules.filter(m => m.compiled && !m.operational)).toHaveLength(56);
    for (const definition of catalog.modules.filter(m => m.compiled)) for (const option of definition.options) {
      const content = validateDecision(definition, option.code, moduleParameters(definition, option.code));
      const output = renderDecision(definition, content, { "Nome 1": "Alice", "Nome 2": "Bruno" });
      expect(output.length, `${definition.id}/${option.code}`).toBeGreaterThan(0);
      expect(output.join("\n"), `${definition.id}/${option.code}`).not.toMatch(/[{}]|undefined/);
      if (option.fields.length) expect(() => validateDecision(definition, option.code, {})).toThrow();
    }
  });
  it("preserva a correção de Q100 e a escolha não numérica de Q051", () => {
    const housing = catalog.modules.find(m => m.id === "ND-Q100-12")!;
    expect(housing.options[1].template).toContain("{data de revisão}");
    expect(housing.options[1].template).not.toContain("prazo escolhido");
    const intimacy = catalog.modules.find(m => m.id === "ND-Q051-50")!;
    const content = validateDecision(intimacy, "C", { meta: ["Sem meta numérica"] });
    expect(renderDecision(intimacy, content, { "Nome 1": "Alice", "Nome 2": "Bruno" })[0]).toContain("não estabelecer uma frequência numérica");
  });
  it("rejeita parâmetros malformados, datas inexistentes e períodos invertidos", () => {
    const housing = catalog.modules.find(m => m.id === "ND-Q100-12")!;
    const params = moduleParameters(housing, "B");
    expect(() => validateDecision(housing, "B", { ...params, "data de revisão": ["2026-02-31"] })).toThrow();
    expect(() => validateDecision(housing, "B", { ...params, "data inicial": ["2027-01-01"] })).toThrow();
    expect(() => validateDecision(housing, "B", { ...params, familiar: ["{Nome 1}"] })).toThrow();
    const tasks = catalog.modules.find(m => m.id === "ND-Q044-01")!;
    expect(() => validateDecision(tasks, "A", { tarefas: ['["Limpar","desconhecido","semanal"]'] })).toThrow();
  });
});
