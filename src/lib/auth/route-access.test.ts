import { describe, expect, it } from "vitest";
import { canAccessRoute } from "./route-access";

describe("route authorization policy", () => {
  it("permite rotas públicas sem sessão", () => expect(canAccessRoute("/login")).toBe(true));
  it("nega dashboard e questionário sem sessão", () => {
    expect(canAccessRoute("/dashboard")).toBe(false);
    expect(canAccessRoute("/admissao/questionario")).toBe(false);
  });
  it("permite dashboard para USER", () => expect(canAccessRoute("/dashboard", "USER")).toBe(true));
  it("nega admin para USER", () => expect(canAccessRoute("/admin", "USER")).toBe(false));
  it("permite admin para ADMIN", () => expect(canAccessRoute("/admin/configuracoes", "ADMIN")).toBe(true));
  it("protege todas as novas etapas do contrato e a revisão editorial", () => {
    for (const route of ["/contrato", "/contrato/questionario", "/contrato/decisoes", "/contrato/documento"]) {
      expect(canAccessRoute(route)).toBe(false);
      expect(canAccessRoute(route, "USER")).toBe(true);
    }
    expect(canAccessRoute("/admin/contrato", "USER")).toBe(false);
  });
});
