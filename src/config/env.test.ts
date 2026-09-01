import { afterEach, describe, expect, it, vi } from "vitest";
import { getAppUrl, getSmtpConfig } from "./env";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("configuração pública e SMTP", () => {
  it("exige HTTPS fora de localhost", () => {
    vi.stubEnv("APP_URL", "http://example.test");
    expect(() => getAppUrl()).toThrow("APP_URL deve usar HTTPS");
    vi.stubEnv("APP_URL", "https://example.test/");
    expect(getAppUrl()).toBe("https://example.test");
    vi.stubEnv("APP_URL", "http://localhost:3000");
    expect(getAppUrl()).toBe("http://localhost:3000");
  });

  it("valida as cinco variáveis SMTP sem devolvê-las ao browser", () => {
    vi.stubEnv("SMTP_HOST", "smtp.example.test");
    vi.stubEnv("SMTP_PORT", "587");
    vi.stubEnv("SMTP_USER", "smtp-user");
    vi.stubEnv("SMTP_PASSWORD", "smtp-secret");
    vi.stubEnv("SMTP_FROM", "Contrato <no-reply@example.test>");
    expect(getSmtpConfig()).toEqual({
      host: "smtp.example.test",
      port: 587,
      user: "smtp-user",
      password: "smtp-secret",
      from: "Contrato <no-reply@example.test>",
    });
  });
});
