import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MobileMenu } from "./mobile-menu";

afterEach(() => {
  cleanup();
});

vi.mock("next/navigation", () => ({
  usePathname: () => "/dashboard",
}));

const mockItems = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Minha prova", href: "/admissao/questionario" },
  { label: "Casal", href: "/casal" },
  { label: "Meu contrato", href: "/contrato" },
];

describe("MobileMenu", () => {
  it("renders closed by default and toggles on click", async () => {
    const user = userEvent.setup();
    render(
      <MobileMenu
        items={mockItems}
        user={null}
        logoutButton={<div>Logout</div>}
      />
    );

    const button = screen.getByRole("button", { name: "Abrir menu de navegação" });
    expect(button).toBeInTheDocument();
    expect(screen.queryByRole("navigation", { name: "Navegação móvel" })).not.toBeInTheDocument();

    await user.click(button);

    expect(screen.getByRole("button", { name: "Fechar menu de navegação" })).toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: "Navegação móvel" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Minha prova" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Fechar menu de navegação" }));
    expect(screen.queryByRole("navigation", { name: "Navegação móvel" })).not.toBeInTheDocument();
  });

  it("renders authenticated user name and logout button when logged in", async () => {
    const user = userEvent.setup();
    render(
      <MobileMenu
        items={mockItems}
        user={{ name: "Lucas", email: "lucas@example.com" }}
        logoutButton={<button type="button">Sair da conta</button>}
      />
    );

    await user.click(screen.getByRole("button", { name: "Abrir menu de navegação" }));

    expect(screen.getByText("Lucas")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sair da conta" })).toBeInTheDocument();
  });

  it("renders login and cadastro links when unauthenticated", async () => {
    const user = userEvent.setup();
    render(
      <MobileMenu
        items={[{ label: "Início", href: "/" }]}
        user={null}
      />
    );

    await user.click(screen.getByRole("button", { name: "Abrir menu de navegação" }));

    expect(screen.getByRole("link", { name: "Entrar" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Criar conta" })).toBeInTheDocument();
  });
});
