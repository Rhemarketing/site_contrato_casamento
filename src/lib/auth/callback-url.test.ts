import { describe, expect, it } from "vitest";
import { getSafeCallbackUrl } from "./callback-url";

describe("getSafeCallbackUrl", () => {
  it("aceita caminho interno", () => expect(getSafeCallbackUrl("/admissao/questionario?etapa=1")).toBe("/admissao/questionario?etapa=1"));
  it("recusa URL externa e protocol-relative", () => {
    expect(getSafeCallbackUrl("https://site-malicioso.example")).toBe("/dashboard");
    expect(getSafeCallbackUrl("//site-malicioso.example")).toBe("/dashboard");
  });
});
