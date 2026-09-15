import { expect, it } from "vitest";
import catalogData from "@/data/contract-master-v1.4.0.json";
import { privateBlockers } from "./private-blockers";
import type { Catalog, SessionData } from "./types";

const catalog = catalogData as unknown as Catalog;
function fixture(): SessionData {
  return { answers: Object.fromEntries(catalog.questions.map(q => [q.id, "A"])), privateAnswers: {}, context: {}, neckCompressionReport: false };
}
it.each(["Q103", "Q104", "Q105", "Q110"])("identifica a alternativa crítica exata de %s", id => {
  const data = fixture(); data.answers[id] = "C";
  const item = privateBlockers(catalog, data).find(b => b.id === `${id}-critical`);
  expect(item?.selected).toBe(`C. ${catalog.questions.find(q => q.id === id)!.options.find(o => o.code === "C")!.text}`);
  expect(item?.reason).toContain("alerta crítico");
  expect(item?.blocking).toBe(false);
});
it("separa complemento crítico da alternativa principal da Q103", () => {
  const data = fixture(); data.neckCompressionReport = true;
  const items = privateBlockers(catalog, data);
  expect(items.find(b => b.id === "Q103-neck")?.selected).toContain("Resposta: Sim");
  expect(items.find(b => b.id === "Q103-neck")?.blocking).toBe(false);
  expect(items.find(b => b.id === "Q103-critical")).toBeUndefined();
});
it("mantém alertas informativos independentemente de revisão anterior", () => {
  const data = fixture(); data.answers.Q101 = "B"; data.answers.Q119 = "C"; data.answers.Q162 = "C";
  expect(privateBlockers(catalog, data).filter(b => b.id.endsWith("-review")).map(b => b.questionId)).toEqual(["Q101", "Q119", "Q162"]);
  data.privateClearance = { safety: true, q181: false, reviewId: "review" };
  expect(privateBlockers(catalog, data).filter(b => b.id.endsWith("-review"))).toHaveLength(3);
  data.answers.Q103 = "C";
  expect(privateBlockers(catalog, data).some(b => b.id === "Q103-critical")).toBe(true);
});
it("identifica contextos, perguntas e complementos não preenchidos", () => {
  const data = fixture(); delete data.answers.Q001; data.neckCompressionReport = null;
  const privateModule = catalog.privateModules[0]; data.answers[privateModule.questionId] = privateModule.trigger[0];
  const items = privateBlockers(catalog, data);
  expect(items.find(b => b.id === "Q001-pending")?.selected).toContain("Nenhuma alternativa");
  expect(items.find(b => b.id === "Q103-neck")?.selected).toContain("Não informada");
  expect(items.find(b => b.id === "Q103-neck")?.blocking).toBe(true);
  expect(items.find(b => b.id === `${privateModule.questionId}-${privateModule.id}`)?.reason).toContain(privateModule.prompt);
  expect(items.some(b => b.selected.includes("Contexto:"))).toBe(true);
});
