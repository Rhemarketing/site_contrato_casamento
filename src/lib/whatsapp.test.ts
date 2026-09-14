import { describe, expect, it } from "vitest";
import { formatWhatsAppPhone, normalizeWhatsAppPhone, whatsAppInviteUrl } from "./whatsapp";

describe("convite pelo WhatsApp", () => {
  it("formata digitação e colagem sem duplicar o código do Brasil", () => {
    expect(formatWhatsAppPhone("11987654321")).toBe("(11) 98765-4321");
    expect(formatWhatsAppPhone("+55 (11) 98765-4321")).toBe("(11) 98765-4321");
    expect(formatWhatsAppPhone("11")).toBe("(11");
    expect(formatWhatsAppPhone("")).toBe("");
  });
  it("valida no servidor sem truncar números incorretos", () => {
    expect(normalizeWhatsAppPhone("(11) 98765-4321")).toBe("5511987654321");
    expect(normalizeWhatsAppPhone("+55 11 98765-4321")).toBe("5511987654321");
    for (const value of ["119876543", "119876543210", "11345678901", "abc11987654321"]) expect(normalizeWhatsAppPhone(value)).toBeNull();
  });
  it("codifica o convite dentro da mensagem, sem permitir injetar parâmetros", () => {
    const link = new URL(whatsAppInviteUrl("11987654321", "https://example.com/convite/teste?a=1&b=2"));
    expect(link.hostname).toBe("wa.me");
    expect(link.pathname).toBe("/5511987654321");
    expect([...link.searchParams.keys()]).toEqual(["text"]);
    expect(link.searchParams.get("text")).toContain("https://example.com/convite/teste?a=1&b=2");
    expect(() => whatsAppInviteUrl("11987654321", "javascript:alert(1)")).toThrow();
  });
});
