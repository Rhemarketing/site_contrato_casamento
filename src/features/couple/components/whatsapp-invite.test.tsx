import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, expect, it, vi } from "vitest";
import { CoupleInviteForm } from "./couple-invite-form";
import InvitePage from "@/app/convite/[token]/page";

const mocks = vi.hoisted(() => ({ create: vi.fn(async () => ({ message: "Convite de teste" })), preview: vi.fn(), user: vi.fn() }));
afterEach(() => { cleanup(); vi.clearAllMocks(); });
vi.mock("@/app/actions/couple.actions", () => ({ createCoupleInviteAction: mocks.create, acceptCoupleInviteAction: vi.fn() }));
vi.mock("@/app/actions/auth.actions", () => ({ registerAction: vi.fn() }));
vi.mock("@/lib/auth/current-user", () => ({ getCurrentUser: mocks.user }));
vi.mock("@/lib/db", () => ({ db: {} }));
vi.mock("@/services/couple-invite.service", () => ({ CoupleInviteService: class { getInvitePreview = mocks.preview; } }));

it("exibe máscara e envia telefone pelo botão Convidar parceiro", async () => {
  const user = userEvent.setup();
  render(<CoupleInviteForm />);
  await user.type(screen.getByLabelText("WhatsApp do parceiro"), "11987654321");
  expect(screen.getByLabelText("WhatsApp do parceiro")).toHaveValue("(11) 98765-4321");
  await user.click(screen.getByRole("button", { name: "Convidar parceiro" }));
  expect(await screen.findByText("Convite de teste")).toBeInTheDocument();
  const data = mocks.create.mock.calls[0] as unknown as [unknown, FormData];
  expect(data[1].get("phone")).toBe("(11) 98765-4321");
  expect(data[1].has("email")).toBe(false);
});

it("abre o cadastro no próprio convite e preserva o retorno após autenticação", async () => {
  mocks.user.mockResolvedValue(null);
  mocks.preview.mockResolvedValue({ state: "AVAILABLE", creatorName: "Pessoa teste", channel: "WHATSAPP", recipientEmail: null });
  render(await InvitePage({ params: Promise.resolve({ token: "convite-teste" }) }));
  expect(screen.getByLabelText("Nome completo")).toBeRequired();
  expect(screen.getByLabelText("E-mail")).toBeRequired();
  expect(screen.getByLabelText("Senha")).toBeRequired();
  expect(screen.getByRole("link", { name: "Entrar para aceitar" })).toHaveAttribute("href", "/login?callbackUrl=%2Fconvite%2Fconvite-teste");
  expect(document.querySelector('input[name="callbackUrl"]')).toHaveValue("/convite/convite-teste");
});

it("não expõe cadastro para convite expirado e exige aceite explícito de conta conectada", async () => {
  mocks.preview.mockResolvedValue({ state: "EXPIRED" });
  const view = render(await InvitePage({ params: Promise.resolve({ token: "expirado" }) }));
  expect(screen.queryByLabelText("E-mail")).not.toBeInTheDocument();
  expect(screen.getByText("Este convite expirou.")).toBeInTheDocument();
  mocks.user.mockResolvedValue({ id: "partner" });
  mocks.preview.mockResolvedValue({ state: "AVAILABLE", creatorName: "Pessoa teste", channel: "WHATSAPP", recipientEmail: null });
  view.rerender(await InvitePage({ params: Promise.resolve({ token: "valido" }) }));
  expect(screen.getByRole("button", { name: "Aceitar convite" })).toBeInTheDocument();
  expect(screen.queryByLabelText("Senha")).not.toBeInTheDocument();
});
