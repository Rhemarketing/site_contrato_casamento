// @vitest-environment node
import { expect, it } from "vitest";
import { contractCatalog as catalog } from "../server/catalog";
import { assessSafety, EMPTY_SESSION } from "./engine";
import type { SessionData } from "./types";

const allA = (): SessionData => ({ ...structuredClone(EMPTY_SESSION), neckCompressionReport: false, context: { HAS_CHILDREN_OR_DEPENDENTS: false }, answers: Object.fromEntries(Array.from({ length: 9 }, (_, i) => [`Q${101 + i}`, "A" as const])) });
it("não presume resposta ausente nem exige Q110 inaplicável para completar segurança", () => {
  expect(assessSafety(catalog, EMPTY_SESSION).cleared).toBe(false);
  expect(assessSafety(catalog, allA())).toMatchObject({ complete: true, cleared: true, critical: false });
  const pending = allA(); pending.neckCompressionReport = null;
  expect(assessSafety(catalog, pending).cleared).toBe(false);
  pending.neckCompressionReport = false; pending.context.HAS_CHILDREN_OR_DEPENDENTS = true;
  expect(assessSafety(catalog, pending).cleared).toBe(false);
});
it("conta duas B distintas por pessoa e a liberação não supera alerta crítico", () => {
  const data = allA(); data.answers.Q101 = "B";
  expect(assessSafety(catalog, data)).toMatchObject({ level: "BASE", cleared: false });
  data.answers.Q102 = "B";
  expect(assessSafety(catalog, data)).toMatchObject({ level: "ALTO", cleared: false });
  data.privateClearance = { safety: true, q181: true, reviewId: "servidor" };
  expect(assessSafety(catalog, data).cleared).toBe(true);
  data.neckCompressionReport = true;
  expect(assessSafety(catalog, data)).toMatchObject({ level: "CRITICO", critical: true, cleared: false });
});
