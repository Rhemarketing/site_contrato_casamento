import { beforeEach, describe, expect, it, vi } from "vitest";

const { authMock, redirectMock } = vi.hoisted(() => ({
  authMock: vi.fn(),
  redirectMock: vi.fn((url: string) => { throw new Error(`redirect:${url}`); }),
}));

vi.mock("@/auth", () => ({ auth: authMock }));
vi.mock("next/navigation", () => ({ redirect: redirectMock }));

import { requireAdmin, requireUser } from "./current-user";

const session = (role: "USER" | "ADMIN") => ({
  user: { id: `${role.toLowerCase()}-id`, name: role, email: `${role.toLowerCase()}@example.test`, role },
  expires: new Date(Date.now() + 60_000).toISOString(),
});

describe("server-side authorization helpers", () => {
  beforeEach(() => { authMock.mockReset(); redirectMock.mockClear(); });

  it("redireciona usuário não autenticado preservando callback interno", async () => {
    authMock.mockResolvedValue(null);
    await expect(requireUser("/admissao/questionario")).rejects.toThrow("redirect:/login?callbackUrl=%2Fadmissao%2Fquestionario");
  });

  it("retorna identidade autenticada para USER", async () => {
    authMock.mockResolvedValue(session("USER"));
    await expect(requireUser("/dashboard")).resolves.toMatchObject({ id: "user-id", role: "USER" });
  });

  it("nega área administrativa para USER", async () => {
    authMock.mockResolvedValue(session("USER"));
    await expect(requireAdmin()).rejects.toThrow("redirect:/dashboard");
  });

  it("permite área administrativa para ADMIN", async () => {
    authMock.mockResolvedValue(session("ADMIN"));
    await expect(requireAdmin()).resolves.toMatchObject({ id: "admin-id", role: "ADMIN" });
  });
});
