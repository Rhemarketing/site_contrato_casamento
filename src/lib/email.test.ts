import { describe, expect, it } from "vitest";
import { normalizeEmail } from "./email";

describe("normalizeEmail", () => {
  it("remove espaços externos e converte para minúsculas", () => {
    expect(normalizeEmail(" Pessoa@EMAIL.com ")).toBe("pessoa@email.com");
  });
});
